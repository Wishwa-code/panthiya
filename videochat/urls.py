from django.urls import path
from . import views
from videochat.views import *

urlpatterns = [
    path('', views.index, name='index'),
    path('message/', MessageView.as_view()),
    path('users/', UsersView.as_view()),
    path('start-call/', StartCall.as_view()),
    path('end-call/', EndCall.as_view()),
    path('create-channel/', CreateChannelView.as_view(), name='create-channel')
]