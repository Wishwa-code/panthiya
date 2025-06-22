#!/bin/bash
# nohup redis-server &
nohup redis-server --requirepass "your-very-strong-and-secret-password" &
python manage.py runserver 0.0.0.0:8000