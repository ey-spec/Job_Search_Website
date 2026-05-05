from django.urls import path
from .views import (
    JobListCreateView,
    JobDetailView,
    AdminJobListView,
    ApplyJobView,
    MyApplicationsView,
    JobApplicantsView,
    SaveJobView,
    SavedJobsListView
)

urlpatterns = [
    # GET /api/jobs/ — list all jobs with search, filter, sort
    # POST /api/jobs/ — create a new job (admin only)
    path('', JobListCreateView.as_view(), name='job-list-create'),

    # GET /api/jobs/:id/ — get job details
    # PUT /api/jobs/:id/ — edit a job (admin only)
    # DELETE /api/jobs/:id/ — delete a job (admin only)
    path('<int:id>/', JobDetailView.as_view(), name='job-detail'),

    # GET /api/admin/jobs/ — get all jobs created by the logged in admin
    path('admin/', AdminJobListView.as_view(), name='admin-job-list'),

    # POST /api/jobs/:id/apply/ — apply for a job
    path('<int:id>/apply/', ApplyJobView.as_view(), name='apply-job'),

    # GET /api/applications/ — get all applications by the logged in user
    path('applications/', MyApplicationsView.as_view(), name='my-applications'),

    # GET /api/admin/jobs/:id/applicants/ — get all applicants for a job
    path('admin/<int:id>/applicants/', JobApplicantsView.as_view(), name='job-applicants'),

    # POST /api/jobs/:id/save/ — save a job
    # DELETE /api/jobs/:id/save/ — unsave a job
    path('<int:id>/save/', SaveJobView.as_view(), name='save-job'),

    # GET /api/saved-jobs/ — get all saved jobs
    path('saved/', SavedJobsListView.as_view(), name='saved-jobs'),
]