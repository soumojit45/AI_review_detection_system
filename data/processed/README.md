# 📁 Data Directory

Place your processed training dataset in this folder.

### Default Expected File:
`data/processed/cleaned_reviews.csv`

### Supported Column Formats:
The training script automatically detects and standardizes common column names:
- **Review Text Column**: `review`, `text`, `review_text`, `text_`, `statement`, or `content`
- **Label Column**: `label`, `target`, `category`, `class`, or `is_fake`

### Supported Label Encodings:
- **Genuine / Real**: `0`, `"genuine"`, `"real"`, `"OR"`, `"truthful"`
- **Fake / Deceptive**: `1`, `"fake"`, `"CG"`, `"spam"`, `"deceptive"`

### How to Train the DistilBERT Model:
Run from the root directory:
```powershell
python -m training.train
```

Once training completes, the fine-tuned model weights are saved to `models/fake_review_distilbert/` and will be automatically loaded by the FastAPI backend (`backend/main.py`).
