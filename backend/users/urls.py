from django.urls import path
from .views import RegisterView, LoginView, LogoutView, CurrentUserView, ForgotPasswordView
from .views import RegisterView, LoginView, LogoutView, CurrentUserView, ForgotPasswordView, ProfileView

urlpatterns = [
    # POST /api/auth/register/
    path('register/', RegisterView.as_view(), name='register'),

    # POST /api/auth/login/
    path('login/', LoginView.as_view(), name='login'),

    # POST /api/auth/logout/
    path('logout/', LogoutView.as_view(), name='logout'),

    # GET /api/auth/me/
    path('me/', CurrentUserView.as_view(), name='current-user'),

    # POST /api/auth/forgot-password/
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),

    # GET /api/auth/profile/ — get profile
    # PUT /api/auth/profile/ — update profile
    # DELETE /api/auth/profile/ — delete account
    path('profile/', ProfileView.as_view(), name='profile'),
]