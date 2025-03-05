# Panthiya
An online classroom system :
Simple and resource-efficient mobile-first application designed to meet the basic requirements for Sri Lankan rural communities with access only to mobile phones.
---



This document outlines the procedure to start the container and use it effectively.

## Step-by-Step Guide

### Initial Setup

1. **Run the Container Set**:
   - Open Docker Desktop and start the container set.

2. **Navigate to the Project Directory** (optional):
   - Go to the directory where the Windows file system for the project is located.

### Check Running Processes

3. **List Running Processes**:
   - Run the following command to check the running processes:
     ```sh
     docker ps
     ```

4. **Get the Container Name**:
   - Identify the name of the process you want to access.

### Access the Container

5. **Execute Bash in the Container**:
   - Run the following command, replacing `<container_name>` with the actual container name:
     ```sh
     docker exec -it <container_name> /bin/bash
     ```

### Set Up the Virtual Environment

6. **Create a Virtual Environment**:
   - Run the following command to create a virtual environment:
     ```sh
     python -m venv venv
     ```

7. **Activate the Virtual Environment**:
   - Go into the virtual environment with the following command:
     ```sh
     source venv/bin/activate
     ```

### Install Required Libraries

8. **Install Dependencies**:
   - Install the required libraries by running:
     ```sh
     pip install -r requirements.txt
     ```

### Run the Application

9. **Run the Application**:
   - Run the application inside the virtual environment and bind it to all IP addresses (0.0.0.0) to make it accessible from your laptop:
     ```sh
     python manage.py runserver 0.0.0.0:8000
     ```

### Additional Tips

10. **Good Luck and Have Fun!**

## Additional Trick

### Auto-Restart with Watchdog

1. **Install Watchdog**:
   - Run the following command to install watchdog:
     ```sh
     pip install watchdog
     ```

2. **Run the Application with Watchdog**:
   - Use the following commands to run the application with auto-restart:
     ```sh
     python manage.py runserver 0.0.0.0:8000 --noreload
     watchmedo auto-restart --patterns="*.py" --recursive -- python manage.py runserver 0.0.0.0:8000
     ```

This setup ensures that your development environment is robust and efficient.
