

-- //! windows files have CRLF ending pattern but linux has LF so you mighht to have check these if container doesnt execute the run command, make sure command is compatible with the host


--this command built a docker image using the content from current directory and and name it as panthiya

```
docker build -t panthiya:latest .

```


-wtihout cache version

```
 docker build --no-cache -t panthiya2 .
 ```


//this command runs the conatiner and ennble interactive shell while porting container port 8000: to host's port 8000

```
docker run --rm -it -p 8000:8000 panthiya /bin/sh
```

🔍 Explanation

Flag	Description

docker run	Run a container from an image

--rm	Automatically delete the container after it exits

-it	Enable interactive terminal (-i for input, -t for terminal)

-p 8000:8000	Map host port 8000 to container port 8000

panthiya:latest	The Docker image to run

/bin/sh	Starts a shell inside the container


//this command rung the container and make sure my project directory on the host machine is ported  to app directory inside the shell 
so any chang i make on the host mahcine is reflected in my container but after executing you get inside the intteractove shell running service from
that poinnt onwards is up to you 

```
docker run --rm -it -p 8000:8000 -v "C:/_projects/panthiya/panthiya:/app" -w /app panthiya:latest /bin/sh
```


after this probaly you might run shell script that run redis serve and applcation using thiss command(make sure your shell script is compatibnle with conatiner's environment like LF or CRLF)

```
./windows_start.sh
```

when you make change to local server stop the dev server inside the coonatinner and restart it just like doing in local only if you havent setup watchdog sccript


///!use this command to install nvim and check if somethigs wrong

```
apt-get update
apt-get install -y neovim

```


//!importannt this command need to run when you make any change to static files because the need to be rebuilt if you dont chagne this any static stuff wont be change 
```
# Collect static files
RUN python manage.py collectstatic --noinput
```

```
python manage.py collectstatic --clear --noinput
```