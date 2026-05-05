from django.db import models
from django.contrib.auth.models import AbstractUser

# ─────────────────────────────────────────
# CustomUser Model — represents a user in the system
# extends Django's built-in AbstractUser
# login is by email + password
# username is just a display name — can repeat
# ─────────────────────────────────────────
class CustomUser(AbstractUser):

    # override username — just a display name, can repeat
    username = models.CharField(max_length=150)

    # email is the unique identifier — no two users can have the same email
    email = models.EmailField(unique=True)

    # tell Django to use email as the login field instead of username
    USERNAME_FIELD = 'email'

    # required fields when creating a superuser
    REQUIRED_FIELDS = ['username']

    # is this user a company admin or a regular user?
    is_company_admin = models.BooleanField(default=False)

    # only filled in by admins
    company_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.email