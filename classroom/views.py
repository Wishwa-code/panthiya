#*This file has the class based view for Sign up feature,
# This view deliveres signup form to user and validates its inputs and create 
# new user object and redirect user to index page if the signup succesfull or else will follow 
# django default procedure when invalid form is submitted. Also whenever user signup
# view is called succesfully new profile object with users profile image is created.

from .forms import SignUpForm

from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.views import LoginView
from django.shortcuts import redirect
from django.shortcuts import render
from django.views import generic
from django.urls import reverse_lazy

from videochat.models import Profile

class SignUpView(generic.CreateView):
    form_class = SignUpForm
    success_url = reverse_lazy('accounts:login')  
    template_name = 'registration/signup.html'

    def form_valid(self, form):
        response = super().form_valid(form)
        user = self.object
        profile_picture = form.cleaned_data.get('profile_picture')

        if profile_picture:
            Profile.objects.create(user=user, photo=profile_picture)
        else:
            Profile.objects.create(user=user)

        login(self.request, user)

        return redirect('index')
    




