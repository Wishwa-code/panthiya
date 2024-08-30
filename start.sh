#!/bin/bash
nohup redis-server &
python manage.py runserver 0.0.0.0:8000