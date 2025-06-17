from django.urls import path
from . import views
from videochat.views import *

urlpatterns = [
    path('', views.index, name='index'),
    path('chats/', views.chats, name='chats'),
    path('chats/message/', MessageView.as_view()),
    path('chats/users/', UsersView.as_view()),
    path('chats/start-call/', StartCall.as_view()),
    path('chats/end-call/', EndCall.as_view()),
    path('create-channel/', CreateChannelView.as_view(), name='create-channel'),
    path('create-class/', views.create_class, name='createClass'),
    path("editClassroom/<int:classroom_id>", views.edit_classroom, name="edit_post"),
]
