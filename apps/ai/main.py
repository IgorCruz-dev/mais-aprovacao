from fastapi import FastAPI
from routers import health, essays, questions

app = FastAPI(title="+Aprovação AI Service")

app.include_router(health.router)
app.include_router(essays.router, prefix="/ai/essays")
app.include_router(questions.router, prefix="/ai/questions")


@app.get("/")
def root():
    return {"service": "ai", "status": "ok"}
