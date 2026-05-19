from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="OmniDeck Agent API",
    description="Backend to scan local vaults and generate markdown presentations.",
    version="0.1.0"
)

# Allow frontend Vite app to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "agent": "OmniDeck API is running"}

@app.get("/api/vaults")
def list_vaults():
    # Placeholder for Obsidian vault scanning
    return {"vaults": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
