# --- Stage 1: Build Stage ---
FROM python:3.11-slim as builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 🔥 Fix this line — path from repo root
COPY server/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

# --- Stage 2: Final Stage ---
FROM python:3.11-slim

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 🔥 Fix this line too — copy app code from /server
COPY server/ .

EXPOSE 10000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
