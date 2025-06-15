from django.urls import path
from . import views
from videochat.views import *

urlpatterns = [
    path('', views.index, name='index'),
    path('chats/', views.chats, name='chats'),
    path('message/', MessageView.as_view()),
    path('chats/users/', UsersView.as_view()),
    path('start-call/', StartCall.as_view()),
    path('end-call/', EndCall.as_view()),
    path('create-channel/', CreateChannelView.as_view(), name='create-channel')
]
