# --- Stage 1: Build Stage ---
# Use an official, slim Python image.
FROM python:3.11-slim as builder

# Set the working directory inside the container to /app
WORKDIR /app

# Set environment variables for clean execution
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create and activate a virtual environment for dependency isolation
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# ✅ CORRECTED PATH: Copy requirements.txt from the 'server' sub-directory
# The build context starts at your repository root, so the full path is needed.
COPY server/requirements.txt .

# Install all dependencies into the virtual environment
RUN pip install --no-cache-dir -r requirements.txt

# Download the spaCy model during the build phase (this is fine with Docker's layer caching)
RUN python -m spacy download en_core_web_sm


# --- Stage 2: Final Production Stage ---
# Start from a fresh, clean image to keep the final size small
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the entire virtual environment with all installed packages from the 'builder' stage
COPY --from=builder /opt/venv /opt/venv

# Add the venv to the final image's PATH
ENV PATH="/opt/venv/bin:$PATH"

# ✅ CORRECTED PATH: Copy your application code from the local 'server' sub-directory
# into the root of the container's working directory (/app).
COPY server/ .

# Tell Docker that the container will listen on port 10000
EXPOSE 10000

# The command to run when the container starts.
# This will execute 'uvicorn' on the 'main.py' file that is now in the /app directory.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]