import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class MessageConsumer(WebsocketConsumer):

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['username']
        self.room_group_name = 'chat_%s' % self.room_name

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        print("Attempting to connect ",self.room_name, "to ",self.room_group_name)

        self.accept()

    # This function will be user if client conneection are sending data from their end.
    # def receive(self, text_data):
    #     print("Broadcasting",json.loads(text_data)['status'], "to this group", self.room_group_name )

    #     async_to_sync(self.channel_layer.group_send)(
    #         self.room_group_name, {
    #             'type': 'new_message',
    #             'message': json.loads(text_data)['message']
    #         }
    #     )

    def new_message(self, event):
        message = event['message']
        self.send(text_data=json.dumps({
            'message': message,
            'status': 'new_message'
        }))

    def new_call(self, event):
        message = event['message']
        self.send(text_data=json.dumps({
            'message': message,
            'status': 'new_call'
        }))

    def end_call(self, event):
        message = event['message']
        self.send(text_data=json.dumps({
            'message': message,
            'status': 'end_call'
        }))

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )