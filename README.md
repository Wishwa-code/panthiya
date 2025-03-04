"# panthiya" 


this is the procedure to start the container and use it

intially go to docker desktop and run the container set then
go in to directory where the directiory of windoes files system for the project(this is optiojnal)
now run 

docker ps

 to check running process then get the 
name of the process you want to go in to then

docker exec -it <cotainer name> /bin/bash

now create a virtual enviroment 

python -m venv venv

then go in to create virtual environment

source venv/bin/activate

no rinstall the required libraries

pip install -r requirements.txt

no run the applicationi inside the virtual enviroment and bind it to all IP addresses (0.0.0.0) ti make it acceptable from your lap

python manage.py runserver 0.0.0.0:8000

good luck have fun



this is another little  trick  

pip install watchdog
python manage.py runserver 0.0.0.0:8000 --noreload
watchmedo auto-restart --patterns="*.py" --recursive -- python manage.py runserver 0.0.0.0:8000
