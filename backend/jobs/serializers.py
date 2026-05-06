from rest_framework import serializers
from .models import Job, Application, SavedJob
from users.serializers import UserSerializer

# ─────────────────────────────────────────
# JobSerializer — converts Job object to/from JSON
# used in all job-related API endpoints
# ─────────────────────────────────────────
class JobSerializer(serializers.ModelSerializer):

    # nest the full user object instead of just the ID
    # read_only means it is only returned in responses, never accepted as input
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'company_name',
            'work_type',
            'salary',
            'years_of_experience',
            'status',
            'description',
            'created_at',
            'created_by'
        ]
        extra_kwargs = {
            # these fields are set automatically, never sent by the frontend
            'created_at': {'read_only': True},
            'created_by': {'read_only': True},
            'company_name': {'required': False},
        }

    def validate_salary(self, value):
        # salary must be a positive number
        if value <= 0:
            raise serializers.ValidationError('Salary must be greater than 0')
        return value

    def validate_years_of_experience(self, value):
        # years of experience cannot be negative
        if value < 0:
            raise serializers.ValidationError('Years of experience cannot be negative')
        return value


# ─────────────────────────────────────────
# ApplicationSerializer — converts Application object to/from JSON
# used when a user applies for a job or views their applications
# ─────────────────────────────────────────
class ApplicationSerializer(serializers.ModelSerializer):

    # nest the full job object so frontend gets all job details
    job = JobSerializer(read_only=True)

    # nest the full user object so admin can see who applied
    user = UserSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            'id',
            'user',
            'job',
            'applied_at'
        ]
        extra_kwargs = {
            # applied_at is set automatically
            'applied_at': {'read_only': True},
        }


# ─────────────────────────────────────────
# SavedJobSerializer — converts SavedJob object to/from JSON
# used when a user saves a job or views their saved jobs
# ─────────────────────────────────────────
class SavedJobSerializer(serializers.ModelSerializer):

    # nest the full job object so frontend gets all job details
    job = JobSerializer(read_only=True)

    # nest the full user object
    user = UserSerializer(read_only=True)

    class Meta:
        model = SavedJob
        fields = [
            'id',
            'user',
            'job',
            'saved_at'
        ]
        extra_kwargs = {
            # saved_at is set automatically
            'saved_at': {'read_only': True},
        }