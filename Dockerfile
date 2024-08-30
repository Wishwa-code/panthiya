# Use the official Python image from the Docker Hub
FROM python:3.10-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev redis-server \
    && rm -rf /var/lib/apt/lists/*

# Copy the application code to the container
COPY . /app

# Install Python dependencies
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose the port the application will run on
EXPOSE 8000

# Start Redis in the background and then start the Django development server
CMD ["./start.sh"]
