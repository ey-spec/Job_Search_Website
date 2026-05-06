from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Job, Application, SavedJob
from .serializers import JobSerializer, ApplicationSerializer, SavedJobSerializer

# ─────────────────────────────────────────
# JobListCreateView — handles GET and POST /api/jobs/
# GET  → returns jobs with search, filter, sort
# POST → creates a new job (admin only)
# ─────────────────────────────────────────
class JobListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # ── search params ──────────────────
        # what the user typed in the search box
        search = request.query_params.get('search', None)
        # whether to search by title or experience
        search_by = request.query_params.get('search_by', 'title')

        # ── filter params ──────────────────
        # filter by status: open or closed
        filter_status = request.query_params.get('status', None)

        # ── sort params ────────────────────
        # salary_high, salary_low, experience_high, experience_low
        sort_by = request.query_params.get('sort_by', None)

        # start with all jobs
        jobs = Job.objects.all()

        # ── apply search ───────────────────
        if search:
            if search_by == 'experience':
                # exact match for years of experience
                jobs = jobs.filter(years_of_experience=search)
            else:
                # partial case-insensitive match for title
                jobs = jobs.filter(title__icontains=search)

        # ── apply filter ───────────────────
        if filter_status in ['open', 'closed']:
            jobs = jobs.filter(status=filter_status)

        # ── apply sort ─────────────────────
        if sort_by == 'salary_high':
            # salary descending (high to low)
            jobs = jobs.order_by('-salary')
        elif sort_by == 'salary_low':
            # salary ascending (low to high)
            jobs = jobs.order_by('salary')
        elif sort_by == 'experience_high':
            # experience descending (high to low)
            jobs = jobs.order_by('-years_of_experience')
        elif sort_by == 'experience_low':
            # experience ascending (low to high)
            jobs = jobs.order_by('years_of_experience')

        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # only admins can create jobs
        if not request.user.is_company_admin:
            return Response(
                {'error': 'Only company admins can post jobs'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = JobSerializer(data=request.data)
        if serializer.is_valid():
            # automatically set created_by to the logged in admin
            serializer.save(
                created_by=request.user,
                company_name=request.user.company_name
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────
# JobDetailView — handles GET, PUT, DELETE /api/jobs/:id/
# GET    → returns full details of one job
# PUT    → edits a job (admin only, must be owner)
# DELETE → deletes a job (admin only, must be owner)
# ─────────────────────────────────────────
class JobDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_job(self, id):
        # helper method to get a job by id
        try:
            return Job.objects.get(id=id)
        except Job.DoesNotExist:
            return None

    def get(self, request, id):
        job = self.get_job(id)
        if not job:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = JobSerializer(job)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id):
        # only admins can edit jobs
        if not request.user.is_company_admin:
            return Response(
                {'error': 'Only company admins can edit jobs'},
                status=status.HTTP_403_FORBIDDEN
            )

        job = self.get_job(id)
        if not job:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        
        # only admins who created the job can edit it
        if job.created_by != request.user:
            return Response(
                {'error': 'You can only edit jobs you created'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = JobSerializer(job, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        # only admins can delete jobs
        if not request.user.is_company_admin:
            return Response(
                {'error': 'Only company admins can delete jobs'},
                status=status.HTTP_403_FORBIDDEN
            )

        job = self.get_job(id)
        if not job:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # only admins who created the job can delete it
        if job.created_by != request.user:
            return Response(
                {'error': 'You can only delete jobs you created'},
                status=status.HTTP_403_FORBIDDEN
            )

        job.delete()
        return Response(
            {'message': 'Job deleted successfully'},
            status=status.HTTP_200_OK
        )


# ─────────────────────────────────────────
# AdminJobListView — handles GET /api/admin/jobs/
# returns only jobs created by the logged in admin
# ─────────────────────────────────────────
class AdminJobListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # only admins can access this
        if not request.user.is_company_admin:
            return Response(
                {'error': 'Only company admins can access this'},
                status=status.HTTP_403_FORBIDDEN
            )

        # return only jobs created by this admin
        jobs = Job.objects.filter(created_by=request.user)
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ─────────────────────────────────────────
# ApplyJobView — handles POST /api/jobs/:id/apply/
# logged in user applies for a job
# ─────────────────────────────────────────
class ApplyJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        # admins cannot apply for jobs
        if request.user.is_company_admin:
            return Response(
                {'error': 'Company admins cannot apply for jobs'},
                status=status.HTTP_403_FORBIDDEN
            )

        # get the job
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # check if job is still open
        if job.status != 'open':
            return Response(
                {'error': 'This job is no longer accepting applications'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # check if user already applied
        if Application.objects.filter(user=request.user, job=job).exists():
            return Response(
                {'error': 'You have already applied for this job'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # create the application
        application = Application.objects.create(
            user=request.user,
            job=job
        )
        serializer = ApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────
# MyApplicationsView — handles GET /api/applications/
# returns all jobs the logged in user has applied to
# ─────────────────────────────────────────
class MyApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # get all applications by the logged in user
        applications = Application.objects.filter(user=request.user)
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ─────────────────────────────────────────
# JobApplicantsView — handles GET /api/admin/jobs/:id/applicants/
# admin sees who applied to their job
# ─────────────────────────────────────────
class JobApplicantsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        # only admins can see applicants
        if not request.user.is_company_admin:
            return Response(
                {'error': 'Only company admins can view applicants'},
                status=status.HTTP_403_FORBIDDEN
            )

        # get the job
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # only the admin who created the job can see its applicants
        if job.created_by != request.user:
            return Response(
                {'error': 'You can only view applicants for jobs you created'},
                status=status.HTTP_403_FORBIDDEN
            )

        # get all applications for this job
        applications = Application.objects.filter(job=job)
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



# ─────────────────────────────────────────
# SaveJobView — handles POST /api/jobs/:id/save/
# logged in user saves a job
# ─────────────────────────────────────────
class SaveJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        # admins cannot save jobs
        if request.user.is_company_admin:
            return Response(
                {'error': 'Company admins cannot save jobs'},
                status=status.HTTP_403_FORBIDDEN
            )

        # get the job
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # check if already saved
        if SavedJob.objects.filter(user=request.user, job=job).exists():
            return Response(
                {'error': 'You have already saved this job'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # save the job
        saved_job = SavedJob.objects.create(
            user=request.user,
            job=job
        )
        serializer = SavedJobSerializer(saved_job)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, id):
        # get the job
        try:
            job = Job.objects.get(id=id)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # get the saved job
        try:
            saved_job = SavedJob.objects.get(user=request.user, job=job)
        except SavedJob.DoesNotExist:
            return Response(
                {'error': 'You have not saved this job'},
                status=status.HTTP_404_NOT_FOUND
            )

        # unsave the job
        saved_job.delete()
        return Response(
            {'message': 'Job removed from saved jobs'},
            status=status.HTTP_200_OK
        )


# ─────────────────────────────────────────
# SavedJobsListView — handles GET /api/saved-jobs/
# returns all jobs the logged in user has saved
# ─────────────────────────────────────────
class SavedJobsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # get all saved jobs by the logged in user
        saved_jobs = SavedJob.objects.filter(user=request.user)
        serializer = SavedJobSerializer(saved_jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)