import os

import json
from django.shortcuts import render
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import serializers, status
from django.http import HttpResponse, JsonResponse

from .models import Profile, User, Classrooms

from django.contrib.auth.models import User
from rest_framework.generics import CreateAPIView

from videochat.serializers import MessageModelSerializer, MessageSerializer
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.authentication import TokenAuthentication, BasicAuthentication, SessionAuthentication
from django.core.paginator import Paginator

from videochat.authentication import BearerAuthentication
from videochat.serializers import RegistrationSerializer, UsersWithMessageSerializer, UserSerializer
from django.shortcuts import redirect,HttpResponseRedirect
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests

import base64
import http.client
from src.RtcTokenBuilder2 import *



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
    page_obj = paginator.get_page(page_number)

    print(page_obj)


    profile = Profile.objects.get(user=request.user.id)
    print("freinds:", user_list, "Profile:",profile)

    return render (request, 'videochat/classes.html',{
        'myData': myData,
        'user_list': user_list,
        'profile': profile,
        'page_obj': page_obj,
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

# @csrf_exempt  
# def edit_classroom(request, classroom_id):
#     if request.method == 'PUT': 
#         try:
#             classroom = Classrooms.objects.get(pk=classroom_id)
#             print('received request to edit',  classroom.name)
            
#         except Classrooms.DoesNotExist:
#             return JsonResponse({"error": "Classroom not found."}, status=404)
        
#         print(classroom_id, classroom.name, request.user)
#         if classroom.instructor == request.user:
#             data = json.loads(request.body)
#             if data.get("classroom_name") is not None:
#                 classroom.name = data["classroom_name"]
#             if data.get("updated_subject") is not None:
#                 classroom.subject = data["updated_subject"]
#             if data.get("updated_grade") is not None:
#                 classroom.grade = data["updated_grade"]
#             classroom.save()
#             return JsonResponse({'success': True}, status=200)
#         else:
#             return JsonResponse({"error": "Restrcited attempt to edit other users classroom data has been noticed."}, status=404)
        

#     # must be via GET or PUT
#     else:
#         return JsonResponse({
#             "error": "Invalid Request Type."
#         }, status=400)

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

def create_class(request):
    if not request.user.is_authenticated:
        return redirect('accounts/login')
    
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
        return render(request, 'videochat/create_class.html',)
    

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
        users = User.objects.exclude(pk=self.request.user.pk).order_by('-profile__online').all()
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
    


class CreateChannelView(APIView):
    def post(self, request):
        
        channel_name = request.data.get('channelName', 'testChannel' + os.urandom(8).hex())
        print(channel_name)
        
        uid = request.data.get('uid', 0) 
        
        app_id = '95c3c83fa4a34edc8ed24e22eed1bd82'  
        app_certificate = '21bf9ec600454bd7954551057fa5581f'
        token = '007eJxTYMjwYnfireo2MxRIVbgeve9c3NanGy/tO/lFagrrxah76boKDJamycbJFsZpiSaJxiapKckWqSlGJqlGRqmpKYZJKRZGa1uvpjUEMjKwuMezMDJAIIjPzJCRmcnAAAD9PR7O'   
        
        # Token validity time in seconds
        token_expiration_in_seconds = 3600

        # The validity time of all permissions in seconds
        privilege_expiration_in_seconds = 3600


        if not app_id or not app_certificate:
            print("Need to set environment variable AGORA_APP_ID and AGORA_APP_CERTIFICATE")
            return
        # Generate Token
        token = RtcTokenBuilder.build_token_with_uid(app_id, app_certificate, channel_name, uid, Role_Publisher,
                                                    token_expiration_in_seconds, privilege_expiration_in_seconds)
        print("Token with int uid: {}".format(token))
        
        return JsonResponse({
            'status': 'success',
            'token': token,
            'channel_name': channel_name,
            'uid': uid
        })
    
        #url = f'https://api.agora.io/v1/projects/{app_id}/channels'  

        #headers = {  
            #'Authorization': f'Bearer {token}',  
            #'Content-Type': 'application/json'  
        #}  

        #data = {  
            #'name': channel_name  
        #}  

        #response = requests.post(url, headers=headers, json=data)  

        #if response.status_code == 200:  
            #print(response.json())  
        #else:  
            #print(f'Error: {response.status_code}')  
            #rint(response.text)