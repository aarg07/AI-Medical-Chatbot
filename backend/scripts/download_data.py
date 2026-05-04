from datasets import load_dataset
import pandas as pd
import os

# Create directories if they don't exist
os.makedirs("data/raw", exist_ok=True)

print("Downloading AI Medical Chatbot dataset...")
# Load only a subset for faster local execution during development/testing
try:
    ds = load_dataset("ruslanmv/ai-medical-chatbot", split="train[:5000]")
    df = pd.DataFrame(ds)
    print(f"Shape: {df.shape}")
    df.to_csv("data/raw/ai_medical_chatbot.csv", index=False)
    print("Saved to data/raw/ai_medical_chatbot.csv")
except Exception as e:
    print(f"Error downloading AI Medical Chatbot dataset: {e}")

print("Downloading MedMCQA dataset...")
try:
    ds2 = load_dataset("openlifescienceai/medmcqa", split="train[:2000]")
    df2 = pd.DataFrame(ds2)
    df2.to_csv("data/raw/medmcqa.csv", index=False)
    print(f"MedMCQA: {len(df2)} rows saved to data/raw/medmcqa.csv")
except Exception as e:
    print(f"Error downloading MedMCQA dataset: {e}")
