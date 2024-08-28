from django.urls import path

from videochat.consumers.message import MessageConsumer
from videochat.consumers.notifications import NewUserConsumer

websocket_urlpatterns = [
    path('ws/notification/', NewUserConsumer.as_asgi()),
    path('ws/message/<str:username>/', MessageConsumer.as_asgi())
]
