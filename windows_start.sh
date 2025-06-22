#!/bin/sh
nohup redis-server --requirepass "your-very-strong-and-secret-password" &
python manage.py runserver 0.0.0.0:8000
# nohup redis-server &
# python manage.py runserver 0.0.0.0:8000