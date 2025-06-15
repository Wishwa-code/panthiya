from django.contrib import admin

# Register your models here.
from .models import Profile, Message, Classrooms
# Register your models here.
admin.site.register(Profile)
admin.site.register(Message)
admin.site.register(Classrooms)