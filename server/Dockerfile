# Pakai Python versi ringan
FROM python:3.9-slim

WORKDIR /app

# Install library
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy kodingan
COPY . .

# Python jalan di port 8000
EXPOSE 8000

# Jalankan server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]