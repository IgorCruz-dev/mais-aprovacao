from fastapi import FastAPI
from routers import health, essays

app = FastAPI(title="+Aprovação AI Service")

app.include_router(health.router)
app.include_router(essays.router, prefix="/ai/essays")


@app.get("/")
def root():
    return {"service": "ai", "status": "ok"}
