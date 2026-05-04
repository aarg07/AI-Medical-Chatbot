import pandas as pd
import re
import json
import os
from tqdm import tqdm

os.makedirs("data/processed", exist_ok=True)

def classify_urgency(text):
    text_lower = str(text).lower()

    CRITICAL_KEYWORDS = [
        "chest pain", "chest pressure", "heart attack", "cardiac arrest",
        "can't breathe", "cannot breathe", "difficulty breathing",
        "shortness of breath", "choking", "not breathing",
        "unconscious", "unresponsive", "passed out", "collapsed",
        "stroke", "face drooping", "arm weakness", "speech difficulty",
        "severe bleeding", "bleeding won't stop", "hemorrhage",
        "seizure", "convulsion", "fits",
        "overdose", "poisoning", "swallowed",
        "anaphylaxis", "severe allergic", "throat swelling",
        "suicide", "kill myself", "want to die",
        "drowning", "electrocution", "severe burn",
        "head injury", "skull fracture", "loss of consciousness",
    ]

    URGENT_KEYWORDS = [
        "high fever", "fever above 103", "fever above 104",
        "severe abdominal pain", "severe stomach pain",
        "vomiting blood", "blood in stool", "rectal bleeding",
        "broken bone", "fracture", "dislocated",
        "deep cut", "wound", "laceration",
        "severe headache", "worst headache",
        "urinary retention", "cannot urinate",
        "child not waking", "infant not responding",
        "severe dehydration", "signs of dehydration",
        "diabetic emergency", "blood sugar",
        "severe allergic reaction",
        "eye injury", "chemical in eye",
        "animal bite", "snake bite",
    ]

    for kw in CRITICAL_KEYWORDS:
        if kw in text_lower:
            return "CRITICAL"

    for kw in URGENT_KEYWORDS:
        if kw in text_lower:
            return "URGENT"

    return "ROUTINE"

def clean_text(text):
    if pd.isna(text) or not isinstance(text, str):
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def format_chatbot_data(input_csv, output_jsonl):
    if not os.path.exists(input_csv):
        print(f"Skipping {input_csv} (not found)")
        return
        
    df = pd.read_csv(input_csv)
    df = df.dropna(subset=['Patient', 'Doctor'])
    df['Patient'] = df['Patient'].apply(clean_text)
    df['Doctor'] = df['Doctor'].apply(clean_text)
    
    # Filter
    df = df[df['Patient'].str.len() > 10]
    df = df[df['Doctor'].str.len() > 20]
    df = df[df['Doctor'].str.len() < 2000]

    formatted = []
    for _, row in tqdm(df.iterrows(), total=len(df), desc="Formatting Chatbot Data"):
        urgency = classify_urgency(row['Patient'])
        formatted.append({
            "question": row['Patient'],
            "answer": row['Doctor'],
            "urgency": urgency,
            "source": "ai_medical_chatbot"
        })

    with open(output_jsonl, 'w', encoding='utf-8') as f:
        for entry in formatted:
            f.write(json.dumps(entry) + '\n')
    print(f"Formatted {len(formatted)} chatbot entries -> {output_jsonl}")

def format_medmcqa(input_csv, output_jsonl):
    if not os.path.exists(input_csv):
        print(f"Skipping {input_csv} (not found)")
        return
        
    df = pd.read_csv(input_csv)
    formatted = []
    option_map = {0: 'opa', 1: 'opb', 2: 'opc', 3: 'opd'}

    for _, row in tqdm(df.iterrows(), total=len(df), desc="Formatting MedMCQA Data"):
        correct_idx = int(row['cop']) if not pd.isna(row['cop']) else 0
        correct_col = option_map.get(correct_idx, 'opa')
        answer_text = str(row.get(correct_col, ''))
        
        explanation = str(row.get('explanation', ''))
        full_answer = f"{answer_text}. {explanation}" if explanation and explanation != 'nan' else answer_text
        question = str(row.get('question', ''))
        
        if len(question) < 10 or len(full_answer) < 5:
            continue

        formatted.append({
            "question": question,
            "answer": full_answer,
            "urgency": classify_urgency(question),
            "subject": str(row.get('subject_name', '')),
            "source": "medmcqa"
        })

    with open(output_jsonl, 'w', encoding='utf-8') as f:
        for entry in formatted:
            f.write(json.dumps(entry) + '\n')
    print(f"Formatted {len(formatted)} MedMCQA entries -> {output_jsonl}")

def merge_datasets(input_files, output_file):
    all_entries = []
    for fpath in input_files:
        if os.path.exists(fpath):
            with open(fpath, encoding='utf-8') as f:
                for line in f:
                    try:
                        all_entries.append(json.loads(line))
                    except:
                        pass

    seen = set()
    unique = []
    for entry in all_entries:
        q = entry['question'].strip().lower()
        if q not in seen:
            seen.add(q)
            unique.append(entry)

    with open(output_file, 'w', encoding='utf-8') as f:
        for entry in unique:
            f.write(json.dumps(entry) + '\n')
    print(f"Merged dataset saved to {output_file} ({len(unique)} entries)")

if __name__ == "__main__":
    format_chatbot_data("data/raw/ai_medical_chatbot.csv", "data/processed/chatbot_formatted.jsonl")
    format_medmcqa("data/raw/medmcqa.csv", "data/processed/medmcqa_formatted.jsonl")
    merge_datasets(
        ["data/processed/chatbot_formatted.jsonl", "data/processed/medmcqa_formatted.jsonl"],
        "data/processed/train.jsonl" # output directly as train.jsonl for simplicity
    )
