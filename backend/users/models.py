from django.db import models
from django.contrib.auth.models import AbstractUser

# ─────────────────────────────────────────
# CustomUser Model — represents a user in the system
# extends Django's built-in AbstractUser so we get
# username, email, password, is_active, date_joined etc. for free
# maps to the "users_customuser" table in the database
# ─────────────────────────────────────────
class CustomUser(AbstractUser):

    # is this user a company admin or a regular user?
    # default is False — every new user is a regular user unless they choose admin
    is_company_admin = models.BooleanField(default=False)

    # the company name — only filled in by admins
    # blank=True → allowed to be empty in forms
    # null=True  → allowed to be NULL in the database
    # both together make this field completely optional
    company_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        # displayed in admin panel e.g. "Eyad"
        return self.username