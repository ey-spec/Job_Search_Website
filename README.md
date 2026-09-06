# JOB SEARCH WEBSITE

## A Full-Stack Job Search & Recruitment Platform

## TABLE OF CONTENTS

1. [Overview](#1-overview)
2. [Key Capabilities](#2-key-capabilities)
3. [System Architecture](#3-system-architecture)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Technology Stack](#5-technology-stack)
6. [Data Model Summary](#6-data-model-summary)
7. [Getting Started](#7-getting-started)
8. [API Reference](#8-api-reference)
9. [Project Structure](#9-project-structure)
10. [Contributors](#10-contributors)

## 1. OVERVIEW

The Job Search Website is a full-stack web application designed to
connect job seekers with companies through a centralized platform
for discovering job opportunities, managing applications, and
organizing recruitment activities.

The system provides separate experiences for regular users and
company administrators. Job seekers can browse available jobs,
view job details, apply for positions, save jobs for later, and
manage their account profile.

Company administrators can create and manage job postings, edit
existing jobs, control job availability, and review applicants who
have applied to their positions.

The application uses a Django REST API as the backend and a
decoupled HTML, CSS, and JavaScript frontend, allowing the platform
to maintain a clear separation between business logic, data
management, and user interface.

## 2. KEY CAPABILITIES

### User Authentication & Account Management

* User registration and login using email and password
* User logout functionality
* Current authenticated user information
* Password recovery functionality
* Profile viewing and editing
* Account deletion
* Email used as the unique user identifier

### Job Search & Discovery

* Browse available job opportunities
* View detailed job information
* Job categorization by employment type
* Support for Full Time, Part Time, Remote, and Internship jobs
* Job availability status
* Centralized job listings for job seekers

### Job Applications

* Apply for available jobs
* Prevent duplicate applications
* View submitted applications
* Track application information
* Associate each application with both a user and a job

### Saved Jobs

* Save jobs for later
* Remove saved jobs
* Maintain a personal collection of saved opportunities
* Prevent duplicate saved-job records

### Company Administration

* Dedicated company administrator functionality
* Create new job postings
* Edit existing job postings
* Delete job postings
* Manage job availability
* View applicants for company jobs
* Company name associated with company administrator accounts

### Applicant Management

* View applicants for jobs created by the company
* Access applicant information through the administration interface
* Restrict applicant management to the appropriate company administrator

### Frontend User Experience

* Separate user and administrator interfaces
* Shared frontend pages and components
* Dedicated administrator dashboard
* Job creation and editing interfaces
* Applicant management interface
* User-oriented job and application pages
* Multiple CSS themes and shared styling

## 3. SYSTEM ARCHITECTURE

```text
  Frontend                                Backend API
  HTML + CSS + JavaScript  -- REST -->    Django
                            <-- JSON --    Django REST Framework
                                                |
                                                | Django ORM
                                                v
                                          SQLite Database
```

The backend exposes REST API endpoints consumed by the frontend
application. Django handles authentication, business logic,
validation, database operations, and authorization, while the
frontend provides the user and administrator interfaces.

The backend is organized into separate Django applications for
users and jobs, while the frontend is divided into ADMIN, USER,
and SHARED sections.

## 4. USER ROLES & PERMISSIONS

### Regular User

Regular users can:

* Create an account
* Log in and log out
* Manage their profile
* Browse job opportunities
* View job information
* Apply for jobs
* View their applications
* Save jobs
* Remove saved jobs
* Recover their password

### Company Administrator

Company administrators can:

* Log in through the authentication system
* Manage company information
* Create job postings
* Edit their job postings
* Delete their job postings
* Manage job availability
* View applicants for their jobs

The user model explicitly distinguishes company administrators
through the `is_company_admin` field and stores the associated
`company_name`. Email addresses are unique and are used as the
authentication identifier.

## 5. TECHNOLOGY STACK

| Layer                     | Technology                   |
| ------------------------- | ---------------------------- |
| Frontend                  | HTML, CSS, JavaScript        |
| Backend                   | Django 6.0.4                 |
| API Framework             | Django REST Framework 3.17.1 |
| Database                  | SQLite                       |
| CORS                      | django-cors-headers          |
| Environment Configuration | python-dotenv                |
| Server Interface          | WSGI / ASGI                  |

The backend dependency versions are defined in `requirements.txt`,
including Django, Django REST Framework, django-cors-headers,
python-dotenv, sqlparse, asgiref, and tzdata.

## 6. DATA MODEL SUMMARY

```text
  CustomUser
      |
      | creates
      v
     Job
      |
      | receives
      v
  Application

  CustomUser
      |
      | saves
      v
   SavedJob
```

### CustomUser

The custom user model extends Django's `AbstractUser` and provides:

* Email as the unique login identifier
* Username as a display name
* Company administrator flag
* Company name for company administrators

### Job

A job represents a job opportunity posted through the platform
and is associated with the company administrator who created it.

Jobs contain information required for job discovery and
management, including employment type and availability.

### Application

An application connects a user with a job when the user applies
for an opportunity.

### SavedJob

A saved job connects a user with a job that they want to keep
available for later reference.

The job application and saved-job relationships are implemented
inside the Django jobs application.

## 7. GETTING STARTED

### Prerequisites

* Python
* pip
* Git

### Clone the Repository

```bash
git clone https://github.com/ey-spec/Job_Search_Website.git
cd Job_Search_Website
```

### Backend Setup

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv venv
```

On Windows:

```bash
venv\Scripts\activate
```

On macOS / Linux:

```bash
source venv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Run the database migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend will be available at:

```text
http://127.0.0.1:8000/
```

The Django project contains the `config`, `users`, and `jobs`
applications, with `manage.py` and `requirements.txt` located in
the backend directory.

### Frontend Setup

The frontend is contained in the `frontend` directory and is
organized into separate sections:

```text
frontend/
```

The frontend contains:

* ADMIN
* USER
* SHARED
* images
* main.js
* purple.css
* style.css
* white.css

Open the frontend entry pages through a local web server or the
development environment being used for the project.

Note: the backend must be running before using features that
communicate with the API.

## 8. API REFERENCE

Base URL:

```text
/api
```

### Authentication

| Resource        | Endpoints                           |
| --------------- | ----------------------------------- |
| Register        | POST /api/auth/register/            |
| Login           | POST /api/auth/login/               |
| Logout          | POST /api/auth/logout/              |
| Current User    | GET /api/auth/me/                   |
| Forgot Password | POST /api/auth/forgot-password/     |
| Profile         | GET, PUT, DELETE /api/auth/profile/ |

The authentication routes are defined in the users application.

### Jobs & Applications

The jobs application provides API functionality for:

* Job listings
* Job creation
* Job updates
* Job deletion
* Job availability
* Job applications
* Applicant management
* Saved jobs

The exact job-related routes and API behavior are implemented in
the jobs application's `urls.py`, `views.py`, and `serializers.py`
files.

## 9. PROJECT STRUCTURE

```text
  Job_Search_Website/
  |
  |-- backend/
  |     |-- Diagrams/
  |     |
  |     |-- config/
  |     |     |-- __init__.py
  |     |     |-- asgi.py
  |     |     |-- settings.py
  |     |     |-- urls.py
  |     |     |-- wsgi.py
  |     |
  |     |-- jobs/
  |     |     |-- migrations/
  |     |     |-- __init__.py
  |     |     |-- admin.py
  |     |     |-- apps.py
  |     |     |-- models.py
  |     |     |-- serializers.py
  |     |     |-- tests.py
  |     |     |-- urls.py
  |     |     |-- views.py
  |     |
  |     |-- users/
  |     |     |-- migrations/
  |     |     |-- __init__.py
  |     |     |-- admin.py
  |     |     |-- apps.py
  |     |     |-- models.py
  |     |     |-- serializers.py
  |     |     |-- tests.py
  |     |     |-- urls.py
  |     |     |-- views.py
  |     |
  |     |-- manage.py
  |     |-- requirements.txt
  |
  |-- frontend/
        |-- ADMIN/
        |     |-- add-job.html
        |     |-- admin-dashboard.html
        |     |-- applicants.html
        |     |-- edit-job.html
        |
        |-- SHARED/
        |
        |-- USER/
        |
        |-- images/
        |-- main.js
        |-- purple.css
        |-- style.css
        |-- white.css
```

The repository is organized into independent backend and frontend
directories. The backend contains the Django project configuration,
users application, jobs application, migrations, and dependency
definitions, while the frontend contains dedicated administrator,
user, and shared interfaces.

## 10. CONTRIBUTORS

Eyad   - Full-stack development
Karim  - Full-stack development
