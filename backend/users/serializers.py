from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser

# ─────────────────────────────────────────
# RegisterSerializer — handles user signup
# validates all signup form fields
# creates a new user in the database
# ─────────────────────────────────────────
class RegisterSerializer(serializers.ModelSerializer):

    # extra field — not in the model, only used for validation
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'confirm_password', 'is_company_admin', 'company_name']
        extra_kwargs = {
            # password will never be returned in any response
            'password': {'write_only': True},
            # company_name is optional
            'company_name': {'required': False}
        }

    def validate(self, data):
        # check passwords match
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})

        # if admin, company name is required
        if data.get('is_company_admin') and not data.get('company_name'):
            raise serializers.ValidationError({'company_name': 'Company name is required for admins'})

        return data

    def create(self, validated_data):
        # remove confirm_password — not a real field in the model
        validated_data.pop('confirm_password')

        # create the user with hashed password
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_company_admin=validated_data.get('is_company_admin', False),
            company_name=validated_data.get('company_name', '')
        )
        return user


# ─────────────────────────────────────────
# LoginSerializer — handles user login
# validates email and password
# returns the user object if valid
# ─────────────────────────────────────────
class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # authenticate checks email and password against the database
        user = authenticate(username=data['email'], password=data['password'])

        if not user:
            raise serializers.ValidationError({'error': 'Invalid email or password'})

        if not user.is_active:
            raise serializers.ValidationError({'error': 'This account is disabled'})

        # attach user to the serializer so the view can access it
        data['user'] = user
        return data


# ─────────────────────────────────────────
# UserSerializer — converts user object to JSON
# used when returning user info in responses
# ─────────────────────────────────────────
class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        # fields to include in the response
        fields = ['id', 'username', 'email', 'is_company_admin', 'company_name']