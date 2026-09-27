import os
import numpy as np
import evaluate

from transformers import (
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
)

from training.config import (
    MODEL_CHECKPOINT,
    OUTPUT_DIR,
    BATCH_SIZE,
    EPOCHS,
    LEARNING_RATE,
    WEIGHT_DECAY,
    USE_FP16,
)

from training.dataset import prepare_tokenized_datasets


# ============================================================
# Load Evaluation Metrics
# ============================================================

accuracy_metric = evaluate.load("accuracy")
precision_metric = evaluate.load("precision")
recall_metric = evaluate.load("recall")
f1_metric = evaluate.load("f1")


# ============================================================
# Compute Evaluation Metrics
# ============================================================

def compute_metrics(eval_pred):
    logits, labels = eval_pred

    predictions = np.argmax(logits, axis=-1)

    accuracy = accuracy_metric.compute(
        predictions=predictions,
        references=labels
    )["accuracy"]

    precision = precision_metric.compute(
        predictions=predictions,
        references=labels,
        average="weighted"
    )["precision"]

    recall = recall_metric.compute(
        predictions=predictions,
        references=labels,
        average="weighted"
    )["recall"]

    f1 = f1_metric.compute(
        predictions=predictions,
        references=labels,
        average="weighted"
    )["f1"]

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1,
    }


# ============================================================
# Main Training Function
# ============================================================

def main():

    # --------------------------------------------------------
    # Step 1: Load and Tokenize Dataset
    # --------------------------------------------------------

    print("=== Step 1: Loading Dataset and Tokenizing ===")

    train_dataset, val_dataset, test_dataset, tokenizer, _ = (
        prepare_tokenized_datasets()
    )

    print(f"Train samples: {len(train_dataset)}")
    print(f"Validation samples: {len(val_dataset)}")
    print(f"Test samples: {len(test_dataset)}")


    # --------------------------------------------------------
    # Step 2: Load Pretrained Model
    # --------------------------------------------------------

    print(
        f"=== Step 2: Loading Pretrained Model "
        f"({MODEL_CHECKPOINT}) ==="
    )

    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_CHECKPOINT,
        num_labels=2,
        id2label={
            0: "GENUINE",
            1: "FAKE",
        },
        label2id={
            "GENUINE": 0,
            "FAKE": 1,
        },
    )


    # --------------------------------------------------------
    # Step 3: Training Arguments
    # --------------------------------------------------------

    print("=== Step 3: Preparing Training Arguments ===")

    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,

        num_train_epochs=EPOCHS,

        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,

        learning_rate=LEARNING_RATE,
        weight_decay=WEIGHT_DECAY,

        # New Transformers API
        eval_strategy="epoch",

        save_strategy="epoch",

        load_best_model_at_end=True,

        metric_for_best_model="f1",

        greater_is_better=True,

        fp16=USE_FP16,

        report_to="none",

        # Helps avoid unnecessary column-related problems
        remove_unused_columns=True,
    )


    # --------------------------------------------------------
    # Step 4: Create Trainer
    # --------------------------------------------------------

    print("=== Step 4: Creating Trainer ===")

    trainer = Trainer(
        model=model,
        args=training_args,

        train_dataset=train_dataset,
        eval_dataset=val_dataset,

        compute_metrics=compute_metrics,
    )


    # --------------------------------------------------------
    # Step 5: Start Training
    # --------------------------------------------------------

    print("=== Step 5: Starting Fine-Tuning ===")

    trainer.train()


    # --------------------------------------------------------
    # Step 6: Evaluate on Test Dataset
    # --------------------------------------------------------

    print("=== Step 6: Evaluating Model on Test Dataset ===")

    test_results = trainer.evaluate(
        eval_dataset=test_dataset
    )

    print("\n=== Test Results ===")

    for key, value in test_results.items():
        print(f"{key}: {value}")


    # --------------------------------------------------------
    # Step 7: Save Model
    # --------------------------------------------------------

    print(
        f"=== Step 7: Saving Fine-Tuned Model to "
        f"{OUTPUT_DIR} ==="
    )

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    trainer.save_model(OUTPUT_DIR)

    tokenizer.save_pretrained(OUTPUT_DIR)

    print("\n========================================")
    print("Fine-tuning completed successfully!")
    print(f"Model saved to: {OUTPUT_DIR}")
    print("========================================")


# ============================================================
# Entry Point
# ============================================================

if __name__ == "__main__":
    main()