# Use a Python base image with a specific version
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Install OWASP ZAP from a custom repository to ensure it's available
# This will download and install ZAP 2.15.0 - a stable, common version
RUN apt-get update && apt-get install -y wget && \
    wget -O /tmp/zap.deb https://github.com/zaproxy/zaproxy/releases/download/v2.15.0/ZAP_2.15.0_all.deb && \
    dpkg -i /tmp/zap.deb || apt-get install -f -y && \
    rm /tmp/zap.deb

# Copy the requirements file and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set the ZAP API key as a placeholder environment variable
# The hosting provider will inject the real API key in production
ENV ZAP_API_KEY=PLACEHOLDER_KEY

# Expose the port your Flask app runs on
EXPOSE 5000

# Command to run the Flask app and ZAP daemon
# This single command ensures both services start together in the container
CMD sh -c "zap.sh -daemon -host 0.0.0.0 -port 8080 & gunicorn --bind 0.0.0.0:5000 --workers 1 'app:app'"
