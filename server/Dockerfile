# --- Stage 1: Build Stage ---
# Use an official, slim Python image. 'slim' means it has the minimal packages needed.
FROM python:3.11-slim as builder

# Set the working directory inside the container to /app
WORKDIR /app

# Set environment variables to prevent Python from creating .pyc files
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create a virtual environment inside the container for clean dependency management
RUN python -m venv /opt/venv
# Add the venv to the container's PATH, so 'pip' and 'python' commands use it
ENV PATH="/opt/venv/bin:$PATH"

# Copy ONLY the requirements file first. Docker caches this layer.
# If requirements.txt doesn't change, Docker won't re-install dependencies on future builds, making them much faster.
COPY requirements.txt .

# Install all dependencies into the virtual environment
RUN pip install --no-cache-dir -r requirements.txt

# Download the spaCy NLP model into the virtual environment
RUN python -m spacy download en_core_web_sm


# --- Stage 2: Final Production Stage ---
# Start again from a fresh, slim Python image to keep the final image small
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the entire virtual environment with all installed packages from the 'builder' stage
COPY --from=builder /opt/venv /opt/venv

# Add the venv to the final image's PATH
ENV PATH="/opt/venv/bin:$PATH"

# Copy all your application code (main.py, nlp_processor.py, etc.) into the container
COPY . .

# Tell Docker that the container will listen on port 10000.
# This is the port Render's network will connect to.
EXPOSE 10000

# This is the command that will be executed when the container starts.
# It tells Uvicorn to run your 'app' object from the 'main' file,
# listen on all network interfaces (0.0.0.0), and use port 10000.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]