from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from process_query.index import process_query

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/processquery")
async def api_process_query(query: str):
    try:
        response = process_query(query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))