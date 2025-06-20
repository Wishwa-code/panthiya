from .forms import SignUpForm

from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
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
        print('🖼️ profile picture', profile_picture)

        if profile_picture:
            Profile.objects.create(user=user, photo=profile_picture)
        else:
            Profile.objects.create(user=user)

        login(self.request, user)

        return redirect('index')
    
@login_required
def profile(request):
    return render(request, 'profile.html') 



# class SignUpView(generic.CreateView):
#     form_class = UserCreationForm
#     success_url = reverse_lazy('accounts:login')  
#     template_name = 'registration/signup.html'
