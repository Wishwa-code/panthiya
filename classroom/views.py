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
        print('🖼️ profile picture', profile_picture)

        if profile_picture:
            Profile.objects.create(user=user, photo=profile_picture)
        else:
            Profile.objects.create(user=user)

        login(self.request, user)

        return redirect('index')
    
# class CustomLoginView(LoginView):
#     # You can keep the template_name here or in the urls.py, it's your choice
#     template_name = 'registration/login.html'

#     def form_valid(self, form):
#         """
#         This method is called when valid form data has been POSTed.
#         It should return an HttpResponse.
#         The `form` object is the AuthenticationForm instance.
#         """
        
#         # --- THIS IS WHERE YOU ADD YOUR CUSTOM FUNCTION ---
#         print("Login was successful, executing my custom function!")
        
#         # Example: Get the user object that is about to log in
#         user = form.get_user()
#         print(f"The user logging in is: {user.username}")

#         # You can call any function you want here.
#         # my_custom_login_function(user)

#         # ---------------------------------------------------

#         # Now, let the original LoginView do the rest of the work.
#         # This will log the user in and redirect to the success URL.
#         # It's crucial to return this super() call.
#         return super().form_valid(form)
    
@login_required
def profile(request):
    return render(request, 'profile.html') 



# class SignUpView(generic.CreateView):
#     form_class = UserCreationForm
#     success_url = reverse_lazy('accounts:login')  
#     template_name = 'registration/signup.html'
