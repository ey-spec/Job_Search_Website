from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

# register CustomUser in the admin panel
# UserAdmin gives us the full user management interface
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # extra fields to show in the admin panel list view
    list_display = ('username', 'email', 'is_company_admin', 'company_name', 'is_staff')
    
    # add our custom fields to the admin edit form
    fieldsets = UserAdmin.fieldsets + (
        ('Company Info', {'fields': ('is_company_admin', 'company_name')}),
    )