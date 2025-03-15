this is just random change to trigger redneder deploy autmatically
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







So this is the other part


So for some reason docker thing is difficult to set up because when running full stack app docker container 
it needs to call its loopback whole and that loop back port need to mirror loopback port on host, only then application in the containter will be able to communicate  with back again, 
now comes the other problem even though container is mirroriing its loopback port to the host's loopback port its again going to call the container itself because its a full stack 
app so the problem is will actually work if it just calling its port itself without call ing for hosts, well seems like it should work because the react part is running and its getting mirrored to out desktop and when we call api caall from client which is in hosts gui it needs to call the container's loopback port then it should work right? 
for now its a mystery i got it send meesage for now on local host will figure out how it will go


this is how the docker contaiiner should un to make it workcorrect


sudo docker run -p 8000:8000

it needs to be run as porting the 8000 port to the contaitners 8000 port because internal APIs are hardcoded to call port 127.0.0.1:8000 so inorder for this to happeen it should call port 8000 of the host then it will automatically map to container 8000, basically application should map host port 8000 to container port 8000
