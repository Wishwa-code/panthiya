import base64
import http.client
import json
import os
import requests

from .models import Profile, User, Classrooms, FriendRequest

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from django.contrib.auth.models import User
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.core.paginator import Paginator
from django.dispatch import receiver
from django.http import JsonResponse
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.shortcuts import redirect,HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.urls import reverse


from rest_framework import serializers, status
from rest_framework import generics
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authentication import TokenAuthentication, BasicAuthentication, SessionAuthentication
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from agoraClassroomTokenBuilder.RtcTokenBuilder2 import *

from videochat.authentication import BearerAuthentication
from videochat.serializers import RegistrationSerializer, UsersWithMessageSerializer, UserSerializer, MessageSerializer, MessageModelSerializer

def index(request):
    if not request.user.is_authenticated:
        return redirect('accounts/login')
    myData = True
    user_list = User.objects.all()
    classes = Classrooms.objects.filter(members=request.user.id)
    print('classes of requested user',classes)
    all_classes_count = classes.count()
    ordered_class_list = classes.order_by("-timestamp").all()
    class_list = [classroom.serialize() for classroom in ordered_class_list]

    classroom_lookup = {c.id: c for c in classes}

    uid = request.user.id
    #following token can be regereated by creating a free account and free project in agora console: https://console.agora.io/ 
    app_id = '95c3c83fa4a34edc8ed24e22eed1bd82'
    app_certificate = '21bf9ec600454bd7954551057fa5581f'
    token_expiration_in_seconds = 3600
    privilege_expiration_in_seconds = 3600

    if not app_id or not app_certificate:
        print("Need to set environment variable AGORA_APP_ID and AGORA_APP_CERTIFICATE")
        return
    
    for classroom_data in class_list:
        cid = classroom_data.get('id')
        print('instructor name', classroom_data.get('instructor'))
        classroom_obj = classroom_lookup.get(cid)
        if not classroom_obj:
            classroom_data['token'] = None
            continue

        channel_name = classroom_obj.name
        try:
            token = RtcTokenBuilder.build_token_with_uid(
                app_id, app_certificate,
                channel_name, uid, Role_Publisher,
                token_expiration_in_seconds,
                privilege_expiration_in_seconds
            )
        except Exception as e:
            print(f"Error generating token for classroom {channel_name}: {e}")
            token = None

        classroom_data['token'] = token

    paginator = Paginator(class_list, 10)

    page_number= request.GET.get('page')
    class_obj = paginator.get_page(page_number)

    print(class_obj)


    profile = Profile.objects.get(user=request.user.id)
    print("freinds:", user_list, "Profile:",profile)

    return render (request, 'videochat/classes.html',{
        'myData': myData,
        'user_list': user_list,
        'profile': profile,
        'class_obj': class_obj,
        # 'token_list': token_list,
    })

@csrf_exempt
def edit_classroom(request, classroom_id):
    # Handle _method override for PUT via POST
    if request.method == 'POST' and request.POST.get('_method') == 'PUT':
        try:
            classroom = Classrooms.objects.get(pk=classroom_id)
        except Classrooms.DoesNotExist:
            return JsonResponse({"error": "Classroom not found."}, status=404)

        if classroom.instructor != request.user:
            return JsonResponse({
                "error": "Unauthorized edit attempt."
            }, status=403)

        name = request.POST.get('classroom_name')
        subject = request.POST.get('updated_subject')
        grade = request.POST.get('updated_grade')
        image = request.FILES.get('image')

        if name:
            classroom.name = name
        if subject:
            classroom.subject = subject
        if grade:
            classroom.grade = grade
        if image:
            classroom.thumbnail = image  # Only works if this is an ImageField or FileField

        classroom.save()
        return JsonResponse({'success': True})

    return JsonResponse({"error": "Invalid Request Type."}, status=400)

def available_classes(request):
    if not request.user.is_authenticated:
        return redirect('accounts/login')
    

    # Get classes where user is NOT a member
    classes = Classrooms.objects.exclude(members=request.user.id).order_by("-timestamp")
    class_list = [classroom.serialize() for classroom in classes]

    paginator = Paginator(class_list, 10)
    page_number = request.GET.get('page')
    class_obj = paginator.get_page(page_number)

    profile = Profile.objects.get(user=request.user.id)
    user_list = User.objects.all()

    return render(request, 'videochat/available_classes.html', {
        'myData': False,
        'user_list': user_list,
        'profile': profile,
        'class_obj': class_obj,
    })

@csrf_exempt
def enroll_classroom(request, classroom_id):
    if request.method == 'PUT':
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Unauthorized"}, status=403)

        try:
            classroom = Classrooms.objects.get(pk=classroom_id)
        except Classrooms.DoesNotExist:
            return JsonResponse({"error": "Classroom not found"}, status=404)

        classroom.members.add(request.user)
        classroom.save()
        return JsonResponse({'success': True, 'message': 'Enrolled successfully'})

    return JsonResponse({'error': 'Invalid request method'}, status=400)



def create_class(request):
    if not request.user.is_authenticated:
        return redirect('accounts/login')
    
    profile = Profile.objects.get(user=request.user.id)
    
    if request.method == 'POST':
        class_name = request.POST.get('classname')
        class_description = request.POST.get('description')
        class_grade = request.POST.get('grade')
        class_subject = request.POST.get('subject')
        
        if not class_name:
            return JsonResponse({'error': 'Class name is required'}, status=400)
        try:
            classroom = Classrooms.objects.create(name=class_name, description = class_description, grade=class_grade, subject=class_subject)

            thumbnail = request.FILES.get('thumbnail')

            print('thumbnail',thumbnail)
            
            try:
                if thumbnail:
                    classroom.thumbnail = thumbnail
                    classroom.save()

            except Exception as e:
                return render(request, "videochat/create_class.html", {
                    "message": e
                })

        except Exception as e:
            return render(request, "videochat/create_class.html", {
                "message": e
            })

            
        classroom.instructor = request.user
        classroom.members.add(request.user)
        classroom.save()
        
        print("register successful")
        return HttpResponseRedirect(reverse("index"))
    else: 
        return render(request, 'videochat/create_class.html',{
            'profile': profile,
        })
    
def chats(request):
    if not request.user.is_authenticated:
        return redirect('accounts/login')
    
    myData = True
    user_list = User.objects.all()
    
    profile = Profile.objects.get(user=request.user.id)
    print("freinds:", user_list, "Profile:",profile)
    
    return render (request, 'videochat/chats.html',{
        'myData': myData,
        'user_list': user_list,
        'profile': profile,
    })

def find_user(request):
    if not request.user.is_authenticated:
        return redirect('accounts/login')

    found_user = None
    error_message = None
    friendship_status = None

    # This part handles the form submission for finding a user
    if request.method == 'POST' and 'username' in request.POST:
        username_to_find = request.POST.get('username')
        if username_to_find:
            try:
                found_user = User.objects.get(username__iexact=username_to_find)
                if found_user == request.user:
                    friendship_status = 'self'
                elif found_user in request.user.profile.friends.all():
                    friendship_status = 'friends'
                elif FriendRequest.objects.filter(from_user=request.user, to_user=found_user).exists():
                    friendship_status = 'sent'
                elif FriendRequest.objects.filter(from_user=found_user, to_user=request.user).exists():
                    friendship_status = 'received'

            except User.DoesNotExist:
                error_message = f"No user found with the username '{username_to_find}'"
    
    # Fetch all pending friend requests for the logged-in user
    pending_requests = FriendRequest.objects.filter(to_user=request.user, is_accepted=False)

    profile = Profile.objects.get(user=request.user.id)

    return render(request, 'videochat/find_freind.html', {
        'profile': profile,
        'found_user': found_user,
        'error_message': error_message,
        'friendship_status': friendship_status,
        'pending_requests': pending_requests, # ✨ Pass requests to template
    })

@require_POST
@csrf_exempt
def send_friend_request(request, user_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    try:
        to_user = User.objects.get(id=user_id)
        from_user = request.user

        # Prevent sending request to self
        if to_user == from_user:
            return JsonResponse({"error": "You cannot send a friend request to yourself."}, status=400)

        # Prevent sending duplicate requests
        if FriendRequest.objects.filter(from_user=from_user, to_user=to_user).exists():
            return JsonResponse({"error": "Friend request already sent."}, status=400)
        
        # Prevent sending requests if already friends
        if to_user in from_user.profile.friends.all():
            return JsonResponse({"error": "You are already friends."}, status=400)

        friend_request = FriendRequest(from_user=from_user, to_user=to_user)
        friend_request.save()

        return JsonResponse({"success": "Friend request sent successfully."})

    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
@require_POST
@csrf_exempt
def accept_friend_request(request, request_id): # ✨ New View
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    try:
        friend_request = FriendRequest.objects.get(id=request_id)

        # Ensure the request is for the logged-in user
        if friend_request.to_user != request.user:
            return JsonResponse({"error": "Unauthorized action."}, status=403)
        
        # Add users to each other's friends list
        from_user = friend_request.from_user
        to_user = request.user
        
        to_user.profile.friends.add(from_user)
        from_user.profile.friends.add(to_user)
        
        # Mark as accepted or delete the request
        friend_request.is_accepted = True
        friend_request.save()
        # Alternatively, you can delete it: friend_request.delete()

        return JsonResponse({"success": "Friend request accepted."})

    except FriendRequest.DoesNotExist:
        return JsonResponse({"error": "Friend request not found."}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

class MessageView(CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = []

    def post(self, request, *args, **kwargs):
        
        user = User.objects.get(pk=1)
        return self.create(request, *args, **kwargs)
# Create your views here.

class UsersView(generics.ListAPIView):
    serializer_class = UsersWithMessageSerializer
    authentication_classes = [SessionAuthentication, BasicAuthentication, BearerAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # users = User.objects.exclude(pk=self.request.user.pk).order_by('-profile__online').all()
        profile = self.request.user.profile
        users = profile.friends.all().order_by('-profile__online').all()
        print(users)
        return users

class StartCallSerializer(serializers.Serializer):
    receiver = serializers.SlugField()
    sender = serializers.SlugField()
    peer_id = serializers.CharField()

class StartCall(APIView):
    print('came here')
    authentication_classes = [SessionAuthentication, BasicAuthentication, BearerAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        print("💬 Incoming request.data:", request.data)
        serializer = StartCallSerializer(data=request.data)
        if serializer.is_valid():
            print(serializer.validated_data['sender'])
            sender_user = User.objects.get(username=serializer.validated_data['sender'])
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'chat_%s' % serializer.validated_data['receiver'], {
                    'type': 'new_call',
                    'message': {
                        'data': serializer.validated_data,
                        'display': UserSerializer(sender_user, context={'request': request}).data
                    }
                }
            )
            print('all good')
            return Response({'hello': 'world'})
        print("❗️ Validation failed:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JoinCallSerializer(serializers.Serializer):
    peer_js = serializers.CharField()

class EndCall(APIView):
    authentication_classes = [SessionAuthentication, BasicAuthentication, BearerAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        serializer = StartCallSerializer(data=request.data)
        if serializer.is_valid():
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                'chat_%s' % serializer.validated_data['peer_id'], {
                    'type': 'end_call',
                    'message': {
                        'data': serializer.validated_data,
                    }
                }
            )
            return Response({'hello': 'world'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
#this file is not used and its functionality has been moved to index file to provide token for every class user has joined
# class CreateChannelView(APIView):
#     def post(self, request):
        
#         channel_name = request.data.get('channelName', 'testChannel' + os.urandom(8).hex())
#         print(channel_name)
        
#         uid = request.data.get('uid', 0) 
        
#         app_id = '95c3c83fa4a34edc8ed24e22eed1bd82'  
#         app_certificate = '21bf9ec600454bd7954551057fa5581f'
#         # token = '007eJxTYMjwYnfireo2MxRIVbgeve9c3NanGy/tO/lFagrrxah76boKDJamycbJFsZpiSaJxiapKckWqSlGJqlGRqmpKYZJKRZGa1uvpjUEMjKwuMezMDJAIIjPzJCRmcnAAAD9PR7O'   
        
#         # Token validity time in seconds
#         token_expiration_in_seconds = 3600

#         # The validity time of all permissions in seconds
#         privilege_expiration_in_seconds = 3600


#         if not app_id or not app_certificate:
#             print("Need to set environment variable AGORA_APP_ID and AGORA_APP_CERTIFICATE")
#             return
#         # Generate Token
#         token = RtcTokenBuilder.build_token_with_uid(app_id, app_certificate, channel_name, uid, Role_Publisher,
#                                                     token_expiration_in_seconds, privilege_expiration_in_seconds)
#         print("Token with int uid: {}".format(token))
        
#         return JsonResponse({
#             'status': 'success',
#             'token': token,
#             'channel_name': channel_name,
#             'uid': uid
#         })

@receiver(user_logged_in)
def user_logged_in_handler(sender, request, user, **kwargs):
    print(f"SIGNAL: User {user.username} just logged in.")
    _change_status(user,True)


@receiver(user_logged_out)
def user_logged_out_handler(sender, request, user, **kwargs):
    """
    Handles user logout by setting their profile to offline.
    """
    print(f"SIGNAL: User {user.username} just logged out.")
    if user:
        _change_status(user,False)
    


def _change_status(user: User, is_online: bool):
        """
        @param user:
        """
        profile = user.profile
        profile.online = is_online
        profile.save()
        notify_others(user)

def notify_others(user: User):
    """

    @param user:
    @return:
    """
    serializer = UserSerializer(user, many=False)
    channel_layer = get_channel_layer()
    print('came to notify_others')
    async_to_sync(channel_layer.group_send)(
        'notification', {
            'type': 'user_online',
            'message': serializer.data
        }
    )