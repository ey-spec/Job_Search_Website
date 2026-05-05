from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login, logout, get_user_model
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

# ─────────────────────────────────────────
# RegisterView — handles POST /api/auth/register/
# anyone can access this endpoint
# ─────────────────────────────────────────
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Account created successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────
# LoginView — handles POST /api/auth/login/
# anyone can access this endpoint
# ─────────────────────────────────────────
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────
# LogoutView — handles POST /api/auth/logout/
# must be logged in to logout
# ─────────────────────────────────────────
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────
# CurrentUserView — handles GET /api/auth/me/
# returns the currently logged in user's info
# used by frontend to update navbar
# ─────────────────────────────────────────
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ─────────────────────────────────────────
# ForgotPasswordView — handles POST /api/auth/forgot-password/
# user enters their email and new password
# no email is sent — simple reset for academic project
# ─────────────────────────────────────────
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # check all fields are provided
        if not email or not new_password or not confirm_password:
            return Response(
                {'error': 'Email, new password and confirm password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # check passwords match
        if new_password != confirm_password:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # check if user exists with this email
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'No account found with this email'},
                status=status.HTTP_404_NOT_FOUND
            )

        # set the new password
        user.set_password(new_password)
        user.save()

        return Response(
            {'message': 'Password reset successfully. You can now login with your new password.'},
            status=status.HTTP_200_OK
        )

# ─────────────────────────────────────────
# ProfileView — handles GET, PUT, DELETE /api/auth/profile/
# GET    → returns current user profile info
# PUT    → updates username, email, password
# DELETE → deletes the account
# ─────────────────────────────────────────
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # return current user info
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        data = request.data

        # update username if provided
        username = data.get('username', None)
        if username:
            if len(username) < 3:
                return Response(
                    {'error': 'Username must be at least 3 characters'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.username = username

        # update email if provided
        email = data.get('email', None)
        if email:
            # check if email is already taken by another user
            User = get_user_model()
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response(
                    {'error': 'Email already in use by another account'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = email

        # update password if provided
        current_password = data.get('current_password', None)
        new_password = data.get('new_password', None)
        confirm_password = data.get('confirm_password', None)

        if current_password or new_password or confirm_password:
            # all three fields required to change password
            if not current_password:
                return Response(
                    {'error': 'Current password is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # verify current password is correct
            if not user.check_password(current_password):
                return Response(
                    {'error': 'Current password is incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not new_password:
                return Response(
                    {'error': 'New password is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if len(new_password) < 8:
                return Response(
                    {'error': 'New password must be at least 8 characters'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if new_password != confirm_password:
                return Response(
                    {'error': 'Passwords do not match'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # set the new password
            user.set_password(new_password)

        user.save()

        return Response({
            'message': 'Profile updated successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

    def delete(self, request):
        user = request.user
        # logout first then delete
        logout(request)
        user.delete()
        return Response(
            {'message': 'Account deleted successfully'},
            status=status.HTTP_200_OK
        )