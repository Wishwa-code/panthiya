from . import views
from django.urls import path
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
    path('available/', views.available_classes, name='available_classes'),
    path('enroll/<int:classroom_id>/', views.enroll_classroom, name='enroll_classroom'),
    path('find-user/', views.find_user, name='find_user'), 
    path('send-friend-request/<int:user_id>/', views.send_friend_request, name='send_friend_request'), 
    path('accept-friend-request/<int:request_id>/', views.accept_friend_request, name='accept_friend_request')
]
