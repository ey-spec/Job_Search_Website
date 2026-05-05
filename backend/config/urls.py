from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # django admin panel
    path('admin/', admin.site.urls),

    # auth endpoints — /api/auth/
    # Any URL starting with /api/auth/ → goes to users/urls.py
    path('api/auth/', include('users.urls')),

    # jobs endpoints — /api/jobs/
    # Any URL starting with /api/jobs/ → goes to jobs/urls.py
    path('api/jobs/', include('jobs.urls')),
]