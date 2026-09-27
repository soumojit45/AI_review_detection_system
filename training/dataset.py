import os
import pandas as pd
import torch
from torch.utils.data import Dataset
from sklearn.model_selection import train_test_split
from transformers import AutoTokenizer
from training.config import get_resolved_data_path, MODEL_CHECKPOINT, MAX_LENGTH

class ReviewDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item

    def __len__(self):
        return len(self.labels)

def map_label_to_binary(val):
    """
    Standardizes labels:
    0 = GENUINE / REAL / OR (Original)
    1 = FAKE / CG (Computer Generated) / SPAM
    """
    if pd.isna(val):
        return None
    val_str = str(val).strip().lower()
    
    # Genuine variations
    if val_str in ['0', '0.0', 'genuine', 'real', 'or', 'truthful', 'authentic', 'human', 'false']:
        return 0
    # Fake variations
    if val_str in ['1', '1.0', 'fake', 'cg', 'spam', 'deceptive', 'generated', 'ai', 'true']:
        return 1
    
    # Try parsing as integer
    try:
        num = int(float(val_str))
        if num in [0, 1]:
            return num
    except Exception:
        pass
        
    return None

def load_and_split_data(test_size=0.15, val_size=0.15, random_state=42):
    '''
    Loads cleaned reviews dataset and creates a stratified 70/15/15 Train-Val-Test split.
    '''
    resolved_path = get_resolved_data_path()
    if not os.path.exists(resolved_path):
        raise FileNotFoundError(
            f"\n[ERROR] Dataset file not found at: '{resolved_path}'\n"
            f"Please place your processed data CSV in:\n"
            f"  data/processed/cleaned_reviews.csv\n"
            f"Or set the DATA_PATH environment variable to your CSV location."
        )

    print(f"\n📂 Loading dataset from: {resolved_path}")
    df = pd.read_csv(resolved_path)
    
    # Identify text column
    text_candidates = ['review', 'text', 'review_text', 'text_', 'statement', 'content', 'comment']
    text_col = None
    for candidate in text_candidates:
        if candidate in df.columns:
            text_col = candidate
            break
        # Case insensitive match
        match = [c for c in df.columns if c.lower() == candidate]
        if match:
            text_col = match[0]
            break
            
    if not text_col:
        raise ValueError(
            f"Could not find a review text column in dataset. "
            f"Expected one of {text_candidates}, but found: {list(df.columns)}"
        )

    # Identify label column
    label_candidates = ['label', 'target', 'category', 'class', 'label_', 'is_fake', 'fake']
    label_col = None
    for candidate in label_candidates:
        if candidate in df.columns:
            label_col = candidate
            break
        match = [c for c in df.columns if c.lower() == candidate]
        if match:
            label_col = match[0]
            break

    if not label_col:
        raise ValueError(
            f"Could not find a label/category column in dataset. "
            f"Expected one of {label_candidates}, but found: {list(df.columns)}"
        )

    print(f"✓ Detected review column: '{text_col}', label column: '{label_col}'")
    
    # Rename for consistency
    df = df.rename(columns={text_col: 'review', label_col: 'label'})
    
    # Drop rows with null values
    df = df.dropna(subset=['review', 'label']).copy()
    
    # Normalize labels to 0 (GENUINE) and 1 (FAKE)
    df['label'] = df['label'].apply(map_label_to_binary)
    df = df.dropna(subset=['label']).copy()
    df['label'] = df['label'].astype(int)
    df['review'] = df['review'].astype(str)

    genuine_count = (df['label'] == 0).sum()
    fake_count = (df['label'] == 1).sum()
    print(f"✓ Total usable samples: {len(df)} (Genuine: {genuine_count}, Fake: {fake_count})")
    
    if len(df) < 10:
        raise ValueError(f"Dataset has only {len(df)} valid samples; at least 10 samples are needed for stratified split.")

    # Stratified split: Train (70%), Temp (30%)
    train_df, temp_df = train_test_split(
        df, 
        test_size=(test_size + val_size), 
        random_state=random_state, 
        stratify=df['label']
    )
    
    # Split Temp into Val (15%) and Test (15%)
    val_ratio = val_size / (test_size + val_size)
    val_df, test_df = train_test_split(
        temp_df, 
        test_size=(1.0 - val_ratio), 
        random_state=random_state, 
        stratify=temp_df['label']
    )
    
    print(f"Train Set: {len(train_df)} samples")
    print(f"Validation Set: {len(val_df)} samples")
    print(f"Test Set: {len(test_df)} samples\n")
    
    return train_df, val_df, test_df

def prepare_tokenized_datasets():
    '''
    Tokenizes the review texts using the DistilBERT tokenizer and returns PyTorch datasets.
    '''
    tokenizer = AutoTokenizer.from_pretrained(MODEL_CHECKPOINT)
    train_df, val_df, test_df = load_and_split_data()
    
    train_encodings = tokenizer(
        train_df['review'].tolist(), 
        truncation=True, 
        padding='max_length', 
        max_length=MAX_LENGTH
    )
    val_encodings = tokenizer(
        val_df['review'].tolist(), 
        truncation=True, 
        padding='max_length', 
        max_length=MAX_LENGTH
    )
    test_encodings = tokenizer(
        test_df['review'].tolist(), 
        truncation=True, 
        padding='max_length', 
        max_length=MAX_LENGTH
    )
    
    train_dataset = ReviewDataset(train_encodings, train_df['label'].tolist())
    val_dataset = ReviewDataset(val_encodings, val_df['label'].tolist())
    test_dataset = ReviewDataset(test_encodings, test_df['label'].tolist())
    
    return train_dataset, val_dataset, test_dataset, tokenizer, test_df
