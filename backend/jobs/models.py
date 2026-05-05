from django.db import models
from django.conf import settings

# ─────────────────────────────────────────
# Job Model — represents a job posting
# maps to the "jobs_job" table in the database
# ─────────────────────────────────────────
class Job(models.Model):

    # allowed values for the status field
    # first value = stored in DB, second = displayed to humans
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]

    WORK_TYPE_CHOICES = [
    ('full_time', 'Full Time'),
    ('part_time', 'Part Time'),
    ('remote', 'Remote'),
    ('internship', 'Internship'),
]

    # job title e.g. "Software Engineer"
    title = models.CharField(max_length=255)

    # salary e.g. 15000.00
    salary = models.DecimalField(max_digits=10, decimal_places=2)

    # company that posted the job
    company_name = models.CharField(max_length=255)

    # job status — only allows "open" or "closed", defaults to "open"
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')

    work_type = models.CharField(max_length=20, choices=WORK_TYPE_CHOICES, default='full_time')
    
    # full job description — no length limit
    description = models.TextField()

    # minimum years of experience required
    years_of_experience = models.IntegerField()

    # automatically set to the date/time when the job was created
    created_at = models.DateTimeField(auto_now_add=True)

    # the admin who created this job — FK to CustomUser
    # if the admin is deleted, all their jobs are deleted too (CASCADE)
    # user.jobs.all() gives all jobs created by that admin
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jobs'
    )

    def __str__(self):
        # displayed in admin panel e.g. "Software Engineer"
        return self.title


# ─────────────────────────────────────────
# Application Model — represents a user applying to a job
# maps to the "jobs_application" table in the database
# ─────────────────────────────────────────
class Application(models.Model):

    # the user who applied — FK to CustomUser
    # if the user is deleted, their applications are deleted too (CASCADE)
    # user.applications.all() gives all applications by that user
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    # the job that was applied to — FK to Job
    # if the job is deleted, all its applications are deleted too (CASCADE)
    # job.applications.all() gives all applications for that job
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    # automatically set to the date/time when the application was submitted
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # prevents a user from applying to the same job twice
        # Django will throw an error if they try
        unique_together = ('user', 'job')

    def __str__(self):
        # displayed in admin panel e.g. "Eyad applied to Software Engineer"
        return f"{self.user.username} applied to {self.job.title}"
        



# ─────────────────────────────────────────
# SavedJob Model — represents a user saving a job
# maps to the "jobs_savedjob" table in the database
# ─────────────────────────────────────────
class SavedJob(models.Model):

    # the user who saved the job
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_jobs'
    )

    # the job that was saved
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='saved_by'
    )

    # automatically set when the job was saved
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # a user can only save the same job once
        unique_together = ('user', 'job')

    def __str__(self):
        return f"{self.user.email} saved {self.job.title}"