from django.contrib import admin
from .models import Job, Application, SavedJob

# register Job in the admin panel
@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    # fields to show in the list view
    list_display = ('title', 'company_name', 'work_type', 'status', 'salary', 'years_of_experience', 'created_by', 'created_at')
    # add filters on the right side
    list_filter = ('status', 'company_name')
    # add search bar
    search_fields = ('title', 'company_name')

# register Application in the admin panel
@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'job', 'applied_at')


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ('user', 'job', 'saved_at')