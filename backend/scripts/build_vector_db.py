import chromadb
import json
import os
from tqdm import tqdm
from sentence_transformers import SentenceTransformer

# Suppress symlink warning
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
embedder = SentenceTransformer(EMBED_MODEL)
print(f"Embedding model loaded: {EMBED_MODEL}")

def build_vector_db(data_file, db_path="data/vector_db"):
    os.makedirs(db_path, exist_ok=True)
    client = chromadb.PersistentClient(path=db_path)

    try:
        client.delete_collection("medical_knowledge")
    except:
        pass

    collection = client.create_collection(
        name="medical_knowledge",
        metadata={"hnsw:space": "cosine"}
    )

    if not os.path.exists(data_file):
        print(f"Data file not found: {data_file}")
        return

    with open(data_file, encoding='utf-8') as f:
        all_entries = [json.loads(line) for line in f]

    print(f"Building vector DB from {len(all_entries)} entries...")

    BATCH_SIZE = 500
    batch_docs = []
    batch_ids  = []
    batch_meta = []

    for i, entry in enumerate(tqdm(all_entries)):
        doc_text = f"Patient: {entry['question']}\nDoctor: {entry['answer']}"
        batch_docs.append(doc_text)
        batch_ids.append(f"doc_{i}")
        batch_meta.append({
            "urgency": entry.get("urgency", "ROUTINE"),
            "source": entry.get("source", "unknown"),
            "question": entry["question"][:200]
        })

        if len(batch_docs) >= BATCH_SIZE:
            collection.add(
                documents=batch_docs,
                ids=batch_ids,
                metadatas=batch_meta
            )
            batch_docs, batch_ids, batch_meta = [], [], []

    if batch_docs:
        collection.add(
            documents=batch_docs,
            ids=batch_ids,
            metadatas=batch_meta
        )

    print(f"Vector DB built: {collection.count()} documents indexed")
    return collection

if __name__ == "__main__":
    build_vector_db("data/processed/train.jsonl")
