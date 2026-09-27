# 🛡️ AI Fake Review Detection System

An end-to-end Natural Language Processing (NLP) and Explainable AI (xAI) system designed to detect deceptive, AI-generated, and fraudulent customer reviews using Transfer Learning with **DistilBERT**, served via **FastAPI**, and visualized through an interactive **React + Vite** dashboard.

---

## 📌 Project Overview

Customer reviews heavily dictate online purchasing decisions, making e-commerce platforms prime targets for deceptive opinion spam. Traditional sentiment-based approaches fail to detect fraudulent reviews because deceptive reviews often mimic authentic sentiment (e.g., overly glowing fake positive reviews or maliciously fabricated negative reviews).

This system solves this challenge by:
1. **Transfer Learning via DistilBERT:** Adapting general contextual embeddings from `distilbert-base-uncased` to binary review authenticity classification (`GENUINE` vs. `FAKE`).
2. **Hybrid Explainable AI (xAI):** Decoupling neural network prediction from linguistic analysis to provide transparent reasoning without misattributing heuristic metrics to the transformer.
3. **Dual-Mode Inference:** Supporting both real-time single-review inspection and high-throughput batch CSV processing.

---

## 🏗️ System Architecture

```text
               User Review / CSV Dataset
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
┌──────────────────┐             ┌─────────────────────┐
│ Tokenizer (Word- │             │ Heuristic Linguistic│
│ Piece / Max:256) │             │       Analyzer      │
└────────┬─────────┘             └─────────┬───────────┘
         ▼                                 │
┌──────────────────┐                       ├── Specificity & Length
│ Fine-Tuned       │                       ├── Punctuation Density
│ DistilBERT Model │                       └── Capitalization Variance
└────────┬─────────┘                               │
         ▼                                         │
┌──────────────────┐                               │
│ Softmax Prob /   │                               │
│ Prediction Head  │                               │
└────────┬─────────┘                               │
         └────────────────┬────────────────────────┘
                          ▼
             ┌────────────────────────┐
             │ Unified xAI Generator  │
             └────────────┬───────────┘
                          ▼
               FastAPI REST Endpoints
            (/predict & /predict-batch)
                          ▼
            React Dashboard / Visualization
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js** (v18 or higher): [Download Node.js](https://nodejs.org/)
- **Python** (v3.9 or higher): [Download Python](https://www.python.org/)

---

### 2. Frontend Setup (React + Vite)
In your terminal or PowerShell inside the project directory (`AI-fake-review-detection`):

```powershell
# 1. Install dependencies (use --legacy-peer-deps to avoid any npm peer conflict):
npm install --legacy-peer-deps

# 2. Start the local development server:
npm run dev
```

Open your browser to: **`http://localhost:3000`**

> **Note:** The frontend dashboard includes a built-in offline smart heuristics fallback. Even if the Python FastAPI backend is not started, the app is fully functional for testing single reviews, batch CSV uploads, and viewing xAI breakdown metrics.

---

### 3. Backend Setup (FastAPI & DistilBERT Model)
To start the neural network inference server:

```powershell
# In PowerShell:
# 1. Create a virtual environment
python -m venv venv

# 2. Activate the virtual environment
.\venv\Scripts\Activate.ps1

# (On macOS/Linux: source venv/bin/activate)

# 3. Install Python requirements
pip install -r requirements.txt

# 4. Start the FastAPI server
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Once running, the React application automatically connects to `http://127.0.0.1:8000`.

---

### 4. 🧠 Training the DistilBERT Model with Your Own Processed Data

To train (or re-train) the neural network using your processed dataset:

1. **Place your dataset CSV file** in:
   ```
   data/processed/cleaned_reviews.csv
   ```
   *(Or keep it anywhere in the `data/` folder — the training pipeline auto-detects it).*

2. **Supported Column Names:**
   - **Review text**: `review`, `text`, `review_text`, `text_`, `statement`, or `content`
   - **Label**: `label`, `category`, `class`, or `target`

3. **Supported Label Formats:**
   - **Genuine reviews**: `0`, `"genuine"`, `"real"`, `"OR"`, `"truthful"`
   - **Fake reviews**: `1`, `"fake"`, `"CG"`, `"spam"`, `"deceptive"`

4. **Run Training in PowerShell:**
   ```powershell
   python -m training.train
   ```

5. **Evaluate Model Performance:**
   ```powershell
   python -m training.evaluate
   ```

Once training completes, the fine-tuned model weights are saved to `models/fake_review_distilbert/`. When you launch `uvicorn backend.main:app --reload`, the backend automatically loads your newly trained model!
