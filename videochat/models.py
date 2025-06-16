from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, related_name='profile', on_delete=models.CASCADE)
    photo = models.ImageField(null=True, blank=True, default='girl.svg',upload_to='images/')
    status = models.CharField(default="Hi i'm using dj chat", max_length=255)
    online = models.BooleanField(default=False)
    
    
    
class Message(models.Model):
    text = models.TextField()
    date_time = models.DateTimeField(auto_now_add=True, blank=True)
    sender = models.ForeignKey(User, related_name='sender', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='receiver', on_delete=models.CASCADE)

class Classrooms(models.Model):
    name = models.CharField(max_length=255)
    subject = models.CharField(max_length=255, blank=True, null=True)
    grade = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField()
    instructor = models.ForeignKey(User, related_name='classroom_instructor', on_delete=models.CASCADE,blank=True, null=True)
    members = models.ManyToManyField(User, related_name='classroom_members', blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    thumbnail = models.ImageField(upload_to='classroom_thumbnails/', blank=True, null=True)
    
    def __str__(self):
        return self.name
    
    def serialize(self):
        members_count= self.members.count()
        return {
            "id": self.id,
            "name": self.name,
            "instructor": self.instructor,
            "grade": self.grade,
            "subject": self.subject,
            "description": self.description,
            "members_count": members_count,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }