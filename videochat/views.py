import os
from django.shortcuts import render
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import serializers, status
from django.http import HttpResponse, JsonResponse

from .models import Profile, User

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

from videochat.authentication import BearerAuthentication
from videochat.serializers import RegistrationSerializer, UsersWithMessageSerializer, UserSerializer
from django.shortcuts import redirect
from django.http import JsonResponse
import requests

import base64
import http.client
from src.RtcTokenBuilder2 import *



def index(request):
    if not request.user.is_authenticated:
        return redirect('accounts/login')
    
    myData = True
    user_list = User.objects.all()
    print(user_list)
    
    return render (request, 'videochat/react.html',{
        'myData': myData,
        'user_list': user_list,
    })
    

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