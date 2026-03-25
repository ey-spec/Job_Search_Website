/* ════════════════════════════════════════
   CareerLink — main.js
   Complete frontend JavaScript.
   No hardcoded values — everything is
   stored and read dynamically via
   sessionStorage.
════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

    /* ─────────────────────────────────────
       UTILITY — page detection & paths
    ───────────────────────────────────── */
    const page   = window.location.pathname.split('/').pop();
    const folder = window.location.pathname.split('/').slice(-2, -1)[0];

    function path(to) {
        if (folder === 'SHARED' || folder === 'ADMIN' || folder === 'USER') {
            return '../' + to;
        }
        return to;
    }

    /* ─────────────────────────────────────
       STORAGE HELPERS
    ───────────────────────────────────── */
    function getJobs() {
        return JSON.parse(sessionStorage.getItem('jobs') || '[]');
    }

    function saveJobs(jobs) {
        sessionStorage.setItem('jobs', JSON.stringify(jobs));
    }

    function getAppliedJobs() {
        return JSON.parse(sessionStorage.getItem('appliedJobs') || '[]');
    }

    function saveAppliedJobs(jobs) {
        sessionStorage.setItem('appliedJobs', JSON.stringify(jobs));
    }

    function getUsers() {
        return JSON.parse(sessionStorage.getItem('users') || '[]');
    }

    function saveUsers(users) {
        sessionStorage.setItem('users', JSON.stringify(users));
    }

    // ── Seed default jobs if none exist yet ──
    function seedJobs() {
        if (sessionStorage.getItem('jobsSeeded')) return;
        sessionStorage.setItem('jobsSeeded', 'true');
        const defaults = [
            {
                id:          1,
                title:       'Software Engineer',
                company:     'Google',
                salary:      '$120,000',
                experience:  '3',
                status:      'open',
                description: 'We are looking for a skilled Software Engineer to join our team at Google. You will design and develop scalable web applications, collaborate with cross-functional teams, and deliver high quality software solutions.',
            },
            {
                id:          2,
                title:       'Product Manager',
                company:     'Amazon',
                salary:      '$130,000',
                experience:  '5',
                status:      'closed',
                description: 'Amazon is seeking an experienced Product Manager to lead product strategy and roadmap. You will work closely with engineering, design, and business teams to define and ship great products.',
            },
            {
                id:          3,
                title:       'UI Designer',
                company:     'Apple',
                salary:      '$90,000',
                experience:  '2',
                status:      'open',
                description: 'Join Apple as a UI Designer and craft beautiful, intuitive interfaces used by millions. You will create high-fidelity mockups, design systems, and collaborate with product and engineering teams.',
            },
            {
                id:          4,
                title:       'AI Engineer',
                company:     'Microsoft',
                salary:      '$190,000',
                experience:  '7',
                status:      'open',
                description: 'Microsoft is hiring an AI Engineer to build and deploy machine learning models at scale. You will work on cutting-edge AI products and contribute to the next generation of intelligent software.',
            },
        ];
        saveJobs(defaults);
    }

    seedJobs();


    /* ════════════════════════════════════
       1. NAVBAR
       - Dynamic links based on role
       - Active link highlight
       - Route protection
       - Logout
    ════════════════════════════════════ */
    (function initNavbar() {
        const role     = sessionStorage.getItem('role');
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        // ── Route protection ──
        const adminPages = ['admin-dashboard.html', 'add-job.html', 'edit-job.html', 'applicants.html'];
       const userPages  = ['jobs.html', 'saved-jobs.html', 'applied-jobs.html', 'job-details.html', 'profile.html'];

        if (adminPages.includes(page) && role !== 'admin') {
            window.location.href = path('SHARED/login.html');
            return;
        }
        if (userPages.includes(page) && role !== 'user' && role !== 'admin') {
            window.location.href = path('SHARED/login.html');
            return;
        }

        // ── Build nav based on role ──
        if (role === 'admin') {
            navLinks.innerHTML = `
                <a href="${path('ADMIN/admin-dashboard.html')}">My Jobs</a>
                <a href="${path('ADMIN/add-job.html')}">Add Job</a>
                <a href="${path('USER/profile.html')}">Profile</a>
                <a href="${path('SHARED/index.html')}" id="logout-btn">Logout</a>
            `;
            } else if (role === 'user') {
            navLinks.innerHTML = `
                <a href="${path('USER/jobs.html')}">Browse Jobs</a>
                <a href="${path('USER/saved-jobs.html')}">Saved Jobs</a>
                <a href="${path('USER/applied-jobs.html')}">Applied Jobs</a>
                <a href="${path('USER/profile.html')}">Profile</a>
                <a href="${path('SHARED/index.html')}" id="logout-btn">Logout</a>
            `;
        } else {
            navLinks.innerHTML = `
                <a href="${path('USER/jobs.html')}">Browse Jobs</a>
                <a href="${path('SHARED/about.html')}">About</a>
                <a href="${path('SHARED/login.html')}">Login</a>
                <a href="${path('SHARED/signup.html')}">Sign Up</a>
            `;
        }

        // ── Active link highlight ──
        navLinks.querySelectorAll('a').forEach(function (link) {
            if (link.href.split('/').pop() === page) {
                link.classList.add('active');
            }
        });

        // ── Logout ──
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                sessionStorage.removeItem('role');
                sessionStorage.removeItem('username');
                sessionStorage.removeItem('selectedJob');
                sessionStorage.removeItem('editJobId');
                sessionStorage.removeItem('viewJobId');
                sessionStorage.removeItem('appliedJobs');
                window.location.href = path('SHARED/index.html');
            });
        }
    })();


    /* ════════════════════════════════════
    2. LOGIN PAGE
    File: SHARED/login.html
    ════════════════════════════════════ */
    if (page === 'login.html') {
        const form = document.querySelector('form');
        if (!form) return;

        const role = sessionStorage.getItem('role');
        if (role === 'admin') { window.location.href = path('ADMIN/admin-dashboard.html'); return; }
        if (role === 'user')  { window.location.href = path('USER/jobs.html'); return; }

        function seedUsers() {
            if (getUsers().length > 0) return;
            saveUsers([
                { username: 'admin', password: 'admin123', role: 'admin', company: 'CareerLink', email: 'admin@careerlink.com' },
                { username: 'user',  password: 'user1234', role: 'user',  company: '',            email: 'user@careerlink.com'  },
            ]);
        }
        seedUsers();

        document.querySelectorAll('.social-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                alert('Social login requires a backend. Coming soon!');
            });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearAllErrors();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            let valid      = true;

            if (!username) { showError('username', 'Username is required.'); valid = false; }
            if (!password) {
                showError('password', 'Password is required.'); valid = false;
            } else if (password.length < 8) {
                showError('password', 'Password must be at least 8 characters.'); valid = false;
            }
            if (!valid) return;

            const users = getUsers();
            const match = users.find(function (u) {
                return u.username === username && u.password === password;
            });

            if (!match) { showError('password', 'Invalid username or password.'); return; }

            sessionStorage.setItem('role',     match.role);
            sessionStorage.setItem('username', match.username);

            if (match.role === 'admin') {
                window.location.href = path('ADMIN/admin-dashboard.html');
            } else {
                window.location.href = path('USER/jobs.html');
            }
        });
    }


    /* ════════════════════════════════════
       3. SIGNUP PAGE
       File: SHARED/signup.html
    ════════════════════════════════════ */
    if (page === 'signup.html') {
        const form = document.querySelector('form');
        if (!form) return;

        const role = sessionStorage.getItem('role');
        if (role === 'admin') { window.location.href = path('ADMIN/admin-dashboard.html'); return; }
        if (role === 'user')  { window.location.href = path('USER/jobs.html'); return; }

        const radios       = document.querySelectorAll('input[name="is_company_admin"]');
        const companyGroup = document.getElementById('company-name-group');
        const companyInput = document.getElementById('company-name');

        radios.forEach(function (radio) {
            radio.addEventListener('change', function () {
                if (this.value === 'yes') {
                    companyGroup.style.display = 'block';
                    companyInput.setAttribute('required', 'required');
                } else {
                    companyGroup.style.display = 'none';
                    companyInput.removeAttribute('required');
                    companyInput.value = '';
                    clearError('company-name');
                }
            });
        });

        document.querySelectorAll('.social-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                alert('Social signup requires a backend. Coming soon!');
            });
        });

        const passwordInput = document.getElementById('password');
        const confirmInput  = document.getElementById('confirm-password');

        passwordInput.addEventListener('input', function () {
            if (this.value === '') { clearError('password'); return; }
            const strength = getPasswordStrength(this.value);
            if (strength === 'weak') {
                showError('password', 'Weak — add uppercase, numbers or symbols.');
            } else if (strength === 'medium') {
                showSuccess('password', 'Medium strength.');
            } else {
                showSuccess('password', 'Strong password.');
            }
        });

        confirmInput.addEventListener('input', function () {
            if (this.value === '') { clearError('confirm-password'); return; }
            if (this.value !== passwordInput.value) {
                showError('confirm-password', 'Passwords do not match.');
            } else {
                showSuccess('confirm-password', 'Passwords match.');
            }
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearAllErrors();

            const username        = document.getElementById('username').value.trim();
            const email           = document.getElementById('email').value.trim();
            const password        = passwordInput.value;
            const confirmPassword = confirmInput.value;
            const isAdmin         = document.querySelector('input[name="is_company_admin"]:checked').value;
            const companyName     = companyInput.value.trim();
            let valid             = true;

            if (!username) {
                showError('username', 'Username is required.'); valid = false;
            } else if (username.length < 3) {
                showError('username', 'Username must be at least 3 characters.'); valid = false;
            }

            const users = getUsers();
            if (users.some(function (u) { return u.username === username; })) {
                showError('username', 'Username already exists.'); valid = false;
            }
            if (!email) {
                showError('email', 'Email is required.'); valid = false;
            } else if (!isValidEmail(email)) {
                showError('email', 'Please enter a valid email address.'); valid = false;
            }
            if (users.some(function (u) { return u.email === email; })) {
                showError('email', 'Email already registered.'); valid = false;
            }
            if (!password) {
                showError('password', 'Password is required.'); valid = false;
            } else if (password.length < 8) {
                showError('password', 'Password must be at least 8 characters.'); valid = false;
            }
            if (!confirmPassword) {
                showError('confirm-password', 'Please confirm your password.'); valid = false;
            } else if (password !== confirmPassword) {
                showError('confirm-password', 'Passwords do not match.'); valid = false;
            }
            if (isAdmin === 'yes' && !companyName) {
                showError('company-name', 'Company name is required.'); valid = false;
            }
            if (!valid) return;

            users.push({
                username: username,
                email:    email,
                password: password,
                role:     isAdmin === 'yes' ? 'admin' : 'user',
                company:  companyName,
            });
            saveUsers(users);

            sessionStorage.setItem('role',     isAdmin === 'yes' ? 'admin' : 'user');
            sessionStorage.setItem('username', username);
            window.location.href = path('SHARED/login.html');
        });
    }


    /* ════════════════════════════════════
       4. INDEX PAGE
       File: SHARED/index.html
    ════════════════════════════════════ */
    if (page === 'index.html') {

        const heroBtn   = document.getElementById('search-btn');
        const heroInput = document.getElementById('search-input');

        if (heroBtn && heroInput) {
            heroBtn.addEventListener('click', function () {
                const query = heroInput.value.trim();
                if (!query) {
                    heroInput.classList.add('input-error-shake');
                    setTimeout(function () {
                        heroInput.style.borderColor = '';
                        heroInput.placeholder       = 'Search for jobs...';
                    }, 2000);
                    return;
                }
                window.location.href = path('USER/jobs.html') + '?q=' + encodeURIComponent(query);
            });

            heroInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') heroBtn.click();
            });
        }

        // ── Stats counter animation ──
        document.querySelectorAll('.stat-number').forEach(function (el) {
            const raw    = el.textContent.trim();
            const target = parseInt(raw.replace(/\D/g, ''));
            const suffix = raw.replace(/[\d]/g, '');
            let current  = 0;
            const step   = Math.ceil(target / 60);

            const timer = setInterval(function () {
                current += step;
                if (current >= target) { current = target; clearInterval(timer); }
                el.textContent = current + suffix;
            }, 20);
        });

        // ── Dynamic featured jobs ──
        const featuredGrid = document.querySelector('.featured-jobs .jobs-grid');
        if (featuredGrid) {
            const jobs     = getJobs();
            const openJobs = jobs.filter(function (j) { return j.status === 'open'; }).slice(0, 4);
            featuredGrid.innerHTML = '';

            if (openJobs.length === 0) {
                featuredGrid.innerHTML = '<p style="color:#9ca3af;text-align:center;width:100%;">No open jobs available right now.</p>';
            } else {
                openJobs.forEach(function (job) {
                    featuredGrid.innerHTML += buildJobCard(job, '../USER/job-details.html', false);
                });

                featuredGrid.querySelectorAll('.job-card').forEach(function (card) {
                    card.querySelector('a').addEventListener('click', function (e) {
                        e.preventDefault();
                        const jobId = parseInt(card.dataset.id);
                        const job   = getJobs().find(function (j) { return j.id === jobId; });
                        if (job) sessionStorage.setItem('selectedJob', JSON.stringify(job));
                        window.location.href = '../USER/job-details.html';
                    });
                });
            }
        }
    }


    /* ════════════════════════════════════
    5. JOBS PAGE
    File: USER/jobs.html
    ════════════════════════════════════ */
    if (page === 'jobs.html') {
        const searchInput  = document.getElementById('search-input');
        const searchFilter = document.getElementById('search-filter');
        const searchBtn    = document.getElementById('search-btn');
        const resultsInfo  = document.getElementById('search-results-info');
        const jobsGrid     = document.getElementById('jobs-grid');

        if (!jobsGrid) return;

        function renderJobs(jobsList) {
            jobsGrid.innerHTML = '';
            if (jobsList.length === 0) {
                jobsGrid.innerHTML = '<p style="color:#9ca3af;text-align:center;width:100%;padding:40px;">No jobs found.</p>';
                return;
            }
            jobsList.forEach(function (job) {
                jobsGrid.innerHTML += buildJobCard(job, 'job-details.html', false);
            });

            jobsGrid.querySelectorAll('.job-card').forEach(function (card) {
                card.querySelector('a').addEventListener('click', function (e) {
                    e.preventDefault();
                    const jobId = parseInt(card.dataset.id);
                    const job   = getJobs().find(function (j) { return j.id === jobId; });
                    if (job) sessionStorage.setItem('selectedJob', JSON.stringify(job));
                    window.location.href = 'job-details.html';
                });
            });
        }

        renderJobs(getJobs());

        function runSearch() {
            const query      = searchInput.value.trim().toLowerCase();
            const filterType = searchFilter.value;
            const allJobs    = getJobs();

            const filtered = allJobs.filter(function (job) {
                if (!query) return true;
                if (filterType === 'title')      return job.title.toLowerCase().includes(query);
                if (filterType === 'experience') return job.experience.trim() === query.trim();
                return true;
            });

            renderJobs(filtered);

            if (!query) {
                resultsInfo.innerHTML = '';
            } else if (filtered.length === 0) {
                resultsInfo.innerHTML = 'No jobs found for <strong>"' + escapeHTML(query) + '"</strong>.';
            } else {
                resultsInfo.innerHTML = 'Showing <strong>' + filtered.length + '</strong> result(s) for <strong>"' + escapeHTML(query) + '"</strong>.';
            }
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', runSearch);
            searchInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') runSearch(); });
            searchInput.addEventListener('input',   function ()  { if (this.value === '') runSearch(); });
        }

        const heroQuery = new URLSearchParams(window.location.search).get('q');
        if (heroQuery) { searchInput.value = heroQuery; runSearch(); }
    }


    /* ════════════════════════════════════
    6. JOB DETAILS PAGE
    File: USER/job-details.html
    ════════════════════════════════════ */
    if (page === 'job-details.html') {
        const jobData = JSON.parse(sessionStorage.getItem('selectedJob') || 'null');

        if (!jobData) { window.location.href = 'jobs.html'; return; }

        document.getElementById('job-title').textContent       = jobData.title;
        document.getElementById('job-company').textContent     = jobData.company;
        document.getElementById('job-salary').textContent      = jobData.salary;
        document.getElementById('job-experience').textContent  = jobData.experience + ' years';
        document.getElementById('job-description').textContent = jobData.description;

        const statusEl       = document.getElementById('job-status');
        statusEl.textContent = jobData.status === 'open' ? 'Open' : 'Closed';
        statusEl.className   = jobData.status === 'open' ? 'badge-open' : 'badge-closed';

        const applyBtn    = document.getElementById('apply-btn');
        if (!applyBtn) return;
                // Save job functionality
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            const saved = JSON.parse(sessionStorage.getItem('savedJobs') || '[]');
            const alreadySaved = saved.some(function (j) { return j.id === jobData.id; });
            
            if (alreadySaved) {
                saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
                saveBtn.classList.add('btn-saved');
            } else {
                saveBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    saved.push(jobData);
                    sessionStorage.setItem('savedJobs', JSON.stringify(saved));
                    this.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
                    this.style.pointerEvents = 'none';
                    this.style.opacity = '0.6';
                    showToast('Job saved!');
                });
            }
        }
        const applied        = getAppliedJobs();
        const alreadyApplied = applied.some(function (j) { return j.id === jobData.id; });
        const currentRole    = sessionStorage.getItem('role');
        const backBtn = document.getElementById('back-btn');
        if (backBtn && currentRole === 'admin') {
            backBtn.textContent = 'Back to Home';
            backBtn.href = '../SHARED/index.html';
        }

        function disableApplyBtn(text) {
            applyBtn.classList.add('btn-disabled');
            applyBtn.textContent = text;  
        }

        if (currentRole === 'admin') {
        if (saveBtn) {
            saveBtn.innerHTML = 'Admins cannot save';
            saveBtn.classList.add('btn-disabled');
            saveBtn.style.pointerEvents = 'none';
            saveBtn.style.opacity = '0.6';
        }
        disableApplyBtn('Admins cannot apply');
        return;
        }
        if (jobData.status === 'closed') { disableApplyBtn('Position Closed');     return; }
        if (alreadyApplied)              { disableApplyBtn('Already Applied');      return; }

        applyBtn.addEventListener('click', function (e) {
            e.preventDefault();

            const username = sessionStorage.getItem('username');
            const users    = getUsers();
            const me       = users.find(function (u) { return u.username === username; });

            // ── Save to appliedJobs (user side) ──
            applied.push(jobData);
            saveAppliedJobs(applied);

            // ── Save to jobApplications (admin side) ──
            const allApplications = JSON.parse(sessionStorage.getItem('jobApplications') || '[]');
            allApplications.push({
                jobId:    jobData.id,
                username: username,
                email:    me ? (me.email || '') : '',
                jobTitle: jobData.title,
            });
            sessionStorage.setItem('jobApplications', JSON.stringify(allApplications));

            applyBtn.textContent         = '✓ Applied Successfully!';
            applyBtn.style.background    = 'linear-gradient(135deg, #1D9E75, #0F6E56)';
            applyBtn.style.cursor        = 'not-allowed';
            applyBtn.style.pointerEvents = 'none';

            showToast('Application submitted! Redirecting...');

            setTimeout(function () {
                window.location.href = 'applied-jobs.html';
            }, 1500);
        });
    }


    /* ════════════════════════════════════
       7. APPLIED JOBS PAGE
       File: USER/applied-jobs.html
    ════════════════════════════════════ */
    if (page === 'applied-jobs.html') {
        const grid     = document.getElementById('applied-jobs-grid');
        const emptyMsg = document.getElementById('no-applied-jobs');
        if (!grid || !emptyMsg) return;

        const applied = getAppliedJobs();

        if (applied.length === 0) {
            grid.style.display     = 'none';
            emptyMsg.style.display = 'block';
        } else {
            grid.style.display     = 'flex';
            emptyMsg.style.display = 'none';
            grid.innerHTML         = '';
            applied.forEach(function (job) {
                grid.innerHTML += buildJobCard(job, null, false);
            });
        }
    }


    /* ════════════════════════════════════
       8. ADMIN DASHBOARD
       File: ADMIN/admin-dashboard.html
    ════════════════════════════════════ */
    if (page === 'admin-dashboard.html') {
        const jobsGrid = document.querySelector('.jobs-grid');
        if (!jobsGrid) return;

        function renderAdminJobs() {
            const jobs = getJobs();
            jobsGrid.innerHTML = '';

            if (jobs.length === 0) {
                jobsGrid.innerHTML = `
                    <p style="color:#9ca3af;text-align:center;padding:40px;width:100%;">
                        No jobs posted yet.
                        <a href="add-job.html" style="color:#818cf8;">Add one</a>.
                    </p>
                `;
                updateDashboardStats(0, 0);
                return;
            }

            jobs.forEach(function (job) {
                jobsGrid.innerHTML += buildJobCard(job, null, true);
            });

            updateDashboardStats(
                jobs.filter(function (j) { return j.status === 'open'; }).length,
                jobs.filter(function (j) { return j.status === 'closed'; }).length
            );
        }

        renderAdminJobs();

        jobsGrid.addEventListener('click', function (e) {

            // ── Delete ──
            if (e.target.classList.contains('delete-btn')) {
                const card  = e.target.closest('.job-card');
                const jobId = parseInt(card.dataset.id);
                const jobs  = getJobs();
                const job   = jobs.find(function (j) { return j.id === jobId; });

                showConfirmModal('Delete "' + (job ? job.title : 'this job') + '"? This cannot be undone.', function () {
                    card.style.transition = 'opacity 0.3s, transform 0.3s';
                    card.style.opacity    = '0';
                    card.classList.add('fade-out');
                    setTimeout(function () {
                        saveJobs(jobs.filter(function (j) { return j.id !== jobId; }));
                        renderAdminJobs();
                    }, 300);
                });
            }

            // ── Edit ──
            if (e.target.classList.contains('edit-link')) {
                e.preventDefault();
                const card  = e.target.closest('.job-card');
                const jobId = parseInt(card.dataset.id);
                sessionStorage.setItem('editJobId', jobId);
                window.location.href = 'edit-job.html';
            }

            // ── View Applicants ──
            if (e.target.classList.contains('view-applicants-btn')) {
                e.preventDefault();
                const card  = e.target.closest('.job-card');
                const jobId = parseInt(card.dataset.id);
                sessionStorage.setItem('viewJobId', jobId);
                window.location.href = 'applicants.html';
            }
        });

        function updateDashboardStats(open, closed) {
            let statsEl = document.getElementById('dashboard-stats');
            if (!statsEl) {
                statsEl = document.createElement('p');
                statsEl.id = 'dashboard-stats';
                statsEl.style.cssText = 'color:#6b7280;margin-bottom:20px;font-size:14px;font-weight:500;';
                const h1 = document.querySelector('.dashboard-container h1');
                if (h1) h1.insertAdjacentElement('afterend', statsEl);
            }
            if (statsEl) {
                statsEl.innerHTML = '<span style="color:#7c3aed;font-weight:700;">' + open + '</span> Open &nbsp;·&nbsp; <span style="color:#6b7280;">' + closed + '</span> Closed';
            }
        }
    }


    /* ════════════════════════════════════
    9. ADD JOB PAGE
    File: ADMIN/add-job.html
    ════════════════════════════════════ */
    if (page === 'add-job.html') {
        const form = document.querySelector('form');
        if (!form) return;

        attachCharCounter();

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearAllErrors();

            const values = getJobFormValues();
            if (!validateJobForm(values)) return;

            const jobs  = getJobs();
            const newId = jobs.length > 0 ? Math.max.apply(null, jobs.map(function (j) { return j.id; })) + 1 : 1;

            jobs.push({
                id:          newId,
                title:       values.title,
                company:     sessionStorage.getItem('username') || 'My Company',
                salary:      '$' + Number(values.salary).toLocaleString(),
                experience:  values.experience,
                status:      values.status,
                description: values.desc,
            });
            saveJobs(jobs);

            showSubmitSuccess('Job Added!');
            showToast('Job posted successfully!');
            setTimeout(function () {
                window.location.href = path('ADMIN/admin-dashboard.html');
            }, 800);
        });
    }


    /* ════════════════════════════════════
       10. EDIT JOB PAGE
       File: ADMIN/edit-job.html
    ════════════════════════════════════ */
    if (page === 'edit-job.html') {
        const form = document.querySelector('form');
        if (!form) return;

        const editJobId = parseInt(sessionStorage.getItem('editJobId'));
        const jobs      = getJobs();
        const jobToEdit = jobs.find(function (j) { return j.id === editJobId; });

        if (!jobToEdit) { window.location.href = path('ADMIN/admin-dashboard.html'); return; }

        document.getElementById('job-title').value           = jobToEdit.title;
        document.getElementById('salary').value              = jobToEdit.salary.replace(/[^0-9]/g, '');
        document.getElementById('years-of-experience').value = jobToEdit.experience;
        document.getElementById('job-status').value          = jobToEdit.status;
        document.getElementById('description').value         = jobToEdit.description;

        attachCharCounter();

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearAllErrors();

            const values = getJobFormValues();
            if (!validateJobForm(values)) return;

            const updatedJobs = jobs.map(function (j) {
                if (j.id !== editJobId) return j;
                return {
                    id:          j.id,
                    title:       values.title,
                    company:     j.company,
                    salary:      '$' + Number(values.salary).toLocaleString(),
                    experience:  values.experience,
                    status:      values.status,
                    description: values.desc,
                };
            });
            saveJobs(updatedJobs);

            showSubmitSuccess('Changes Saved!');
            showToast('Job updated successfully!');
            setTimeout(function () {
                window.location.href = path('ADMIN/admin-dashboard.html');
            }, 800);
        });
    }


    /* ════════════════════════════════════
    11. APPLICANTS PAGE
    File: ADMIN/applicants.html
    ════════════════════════════════════ */
    if (page === 'applicants.html') {
        const viewJobId = parseInt(sessionStorage.getItem('viewJobId'));
        const jobs      = getJobs();
        const job       = jobs.find(function (j) { return j.id === viewJobId; });

        if (!job) { window.location.href = path('ADMIN/admin-dashboard.html'); return; }

        const titleEl = document.getElementById('applicants-job-title');
        const metaEl  = document.getElementById('applicants-job-meta');
        if (titleEl) titleEl.textContent = job.title;
        if (metaEl)  metaEl.textContent  = job.company + ' · ' + (job.status === 'open' ? 'Open' : 'Closed');

        const allApplications = JSON.parse(sessionStorage.getItem('jobApplications') || '[]');
        const jobApplicants   = allApplications.filter(function (a) { return a.jobId === viewJobId; });

        const noApplicants = document.getElementById('no-applicants');
        const tableWrap    = document.getElementById('applicants-table-wrap');
        const tbody        = document.getElementById('applicants-tbody');
        const countEl      = document.getElementById('applicants-count');

        if (jobApplicants.length === 0) {
            noApplicants.style.display = 'block';
            tableWrap.style.display    = 'none';
        } else {
            noApplicants.style.display = 'none';
            tableWrap.style.display    = 'block';

            if (countEl) {
                countEl.innerHTML = '<strong>' + jobApplicants.length + '</strong> applicant' + (jobApplicants.length !== 1 ? 's' : '');
            }

            jobApplicants.forEach(function (applicant, index) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${escapeHTML(applicant.username)}</td>
                    <td>${escapeHTML(applicant.email || '—')}</td>
                    <td>${escapeHTML(applicant.jobTitle)}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }


    /* ════════════════════════════════════
    12. FORGOT PASSWORD PAGE
    File: SHARED/forgot-password.html
    ════════════════════════════════════ */
    if (page === 'forgot-password.html') {
        const form        = document.getElementById('forgot-form');
        const stepEmail   = document.getElementById('step-email');
        const stepSuccess = document.getElementById('step-success');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearAllErrors();

            const email = document.getElementById('email').value.trim();
            if (!email)              { showError('email', 'Email is required.'); return; }
            if (!isValidEmail(email)) { showError('email', 'Please enter a valid email address.'); return; }

            stepEmail.style.display   = 'none';
            stepSuccess.style.display = 'block';
        });
    }


    /* ════════════════════════════════════
    13. PROFILE PAGE
    File: USER/profile.html
    ════════════════════════════════════ */
    if (page === 'profile.html') {
        const username = sessionStorage.getItem('username');
        const role     = sessionStorage.getItem('role');

        const displayName = document.getElementById('profile-display-name');
        const displayRole = document.getElementById('profile-display-role');
        if (displayName) displayName.textContent = username || 'User';
        if (displayRole) displayRole.textContent  = role === 'admin' ? 'Company Admin' : 'Job Seeker';

        const users       = getUsers();
        const currentUser = users.find(function (u) { return u.username === username; });

        if (currentUser) {
            document.getElementById('profile-username').value = currentUser.username;
            document.getElementById('profile-email').value    = currentUser.email || '';
        }

        const appliedCount = document.getElementById('applied-count');
        if (appliedCount) appliedCount.textContent = getAppliedJobs().length;

        if (role === 'admin') {
            const statsCard = document.getElementById('profile-stats-card');
            if (statsCard) statsCard.style.display = 'none';
        }

        const form = document.getElementById('profile-form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearAllErrors();

            const newUsername    = document.getElementById('profile-username').value.trim();
            const newEmail       = document.getElementById('profile-email').value.trim();
            const currentPass    = document.getElementById('current-password').value;
            const newPass        = document.getElementById('new-password').value;
            const confirmNewPass = document.getElementById('confirm-new-password').value;
            let valid            = true;

            if (!newUsername || newUsername.length < 3) {
                showError('profile-username', 'Username must be at least 3 characters.'); valid = false;
            }
            if (!newEmail || !isValidEmail(newEmail)) {
                showError('profile-email', 'Please enter a valid email address.'); valid = false;
            }

            if (currentPass || newPass || confirmNewPass) {
                if (!currentPass) {
                    showError('current-password', 'Enter your current password to change it.'); valid = false;
                } else if (currentUser && currentPass !== currentUser.password) {
                    showError('current-password', 'Current password is incorrect.'); valid = false;
                }
                if (newPass && newPass.length < 8) {
                    showError('new-password', 'New password must be at least 8 characters.'); valid = false;
                }
                if (newPass !== confirmNewPass) {
                    showError('confirm-new-password', 'Passwords do not match.'); valid = false;
                }
            }
            if (!valid) return;

            const updatedUsers = users.map(function (u) {
                if (u.username !== username) return u;
                return {
                    username: newUsername,
                    email:    newEmail,
                    password: newPass || u.password,
                    role:     u.role,
                    company:  u.company,
                };
            });
            saveUsers(updatedUsers);
            sessionStorage.setItem('username', newUsername);

            if (displayName) displayName.textContent = newUsername;

            // ── Update navbar if it shows username ──
            document.querySelectorAll('.nav-links a').forEach(function (link) {
                if (link.href.split('/').pop() === 'profile.html') {
                    link.textContent = 'Profile';
                }
            });

            const submitBtn = document.querySelector('#profile-form input[type="submit"]');
            if (submitBtn) {
                submitBtn.value            = 'Saved!';
                submitBtn.classList.add('btn-success');
                setTimeout(function () {
                    submitBtn.value            = 'Save Changes';
                    submitBtn.style.background = '';
                }, 2000);
            }

            document.getElementById('current-password').value     = '';
            document.getElementById('new-password').value         = '';
            document.getElementById('confirm-new-password').value = '';
        });
    }


    /* ════════════════════════════════════
    SHARED — JOB FORM HELPERS
    ════════════════════════════════════ */
    function getJobFormValues() {
        return {
            title:      document.getElementById('job-title').value.trim(),
            salary:     document.getElementById('salary').value,
            experience: document.getElementById('years-of-experience').value,
            status:     document.getElementById('job-status').value,
            desc:       document.getElementById('description').value.trim(),
        };
    }

    function validateJobForm(v) {
        let valid = true;
        if (!v.title) {
            showError('job-title', 'Job title is required.'); valid = false;
        } else if (v.title.length < 3) {
            showError('job-title', 'Job title must be at least 3 characters.'); valid = false;
        }
        if (v.salary === '' || Number(v.salary) < 0) {
            showError('salary', 'Please enter a valid salary.'); valid = false;
        }
        if (v.experience === '' || Number(v.experience) < 0) {
            showError('years-of-experience', 'Please enter valid years of experience.'); valid = false;
        }
        if (!v.status) {
            showError('job-status', 'Please select a job status.'); valid = false;
        }
        if (!v.desc) {
            showError('description', 'Job description is required.'); valid = false;
        } else if (v.desc.length < 20) {
            showError('description', 'Description must be at least 20 characters.'); valid = false;
        }
        return valid;
    }

    function attachCharCounter() {
        const textarea = document.getElementById('description');
        if (!textarea) return;

        const counter         = document.createElement('p');
        counter.className = 'char-counter';
        // and for warning:
        counter.classList.add('warning');
        counter.textContent   = textarea.value.length + ' characters';
        textarea.parentNode.insertAdjacentElement('afterend', counter);

        textarea.addEventListener('input', function () {
            counter.textContent = this.value.length + ' characters';
            counter.style.color = this.value.length < 20 ? '#ff6b6b' : '#9ca3af';
        });
    }

    function showSubmitSuccess(text) {
        const submitBtn = document.querySelector('form input[type="submit"]');
        if (!submitBtn) return;
        submitBtn.value            = text;
        submitBtn.classList.add('btn-success');
    }


    /* ════════════════════════════════════
       SHARED — BUILD JOB CARD HTML
    ════════════════════════════════════ */
    function buildJobCard(job, detailsHref, showActions) {
        const badgeClass = job.status === 'open' ? 'badge-open' : 'badge-closed';
        const badgeText  = job.status === 'open' ? 'Open' : 'Closed';

        const allApplications = JSON.parse(sessionStorage.getItem('jobApplications') || '[]');
        const applicantCount  = allApplications.filter(function (a) { return a.jobId === job.id; }).length;

        let actionsHTML = '';
        if (showActions) {
            actionsHTML = `
                <div class="card-actions">
                    <a href="#" class="edit-link">Edit</a>
                    <button type="button" class="delete-btn">Delete</button>
                </div>
                <button type="button" class="view-applicants-btn">
                    <i class="fa-solid fa-users"></i>
                    View Applicants (${applicantCount})
                </button>
            `;
        } else if (detailsHref) {
            actionsHTML = `<a href="${detailsHref}">View Details</a>`;
        }

        return `
            <article class="job-card" data-id="${job.id}">
                <h3>${escapeHTML(job.title)}</h3>
                <p><strong>Company:</strong> ${escapeHTML(job.company)}</p>
                <p><strong>Salary:</strong> ${escapeHTML(job.salary)}</p>
                <p><strong>Experience:</strong> ${escapeHTML(job.experience)} years</p>
                <p><strong>Status:</strong> <span class="${badgeClass}">${badgeText}</span></p>
                ${actionsHTML}
            </article>
        `;
    }


    /* ════════════════════════════════════
       SHARED UTILITIES
    ════════════════════════════════════ */
    function showConfirmModal(message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-box">
                <h3>Are you sure?</h3>
                <p>${escapeHTML(message)}</p>
                <div class="modal-actions">
                    <button class="modal-confirm">Delete</button>
                    <button class="modal-cancel">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector('.modal-confirm').addEventListener('click', function () {
            overlay.remove();
            onConfirm();
        });
        overlay.querySelector('.modal-cancel').addEventListener('click', function () {
            overlay.remove();
        });
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.remove();
        });
    }

    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;
        clearError(inputId);

        input.classList.add('input-error');
        input.classList.remove('input-success');

        const error         = document.createElement('p');
        error.className     = 'input-error';
        error.textContent   = message;
        error.style.cssText = 'color:#ff6b6b;font-size:12px;margin-top:6px;margin-bottom:0;';

        const parent = input.closest('.input-icon') || input.parentNode;
        parent.insertAdjacentElement('afterend', error);

        input.addEventListener('input', function () { clearError(inputId); }, { once: true });
    }

    function showSuccess(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;
        clearError(inputId);

        input.classList.add('input-success');
        input.classList.remove('input-error');

        const msg         = document.createElement('p');
        msg.className     = 'input-error';
        msg.textContent   = message;
        msg.style.cssText = 'color:#00c864;font-size:12px;margin-top:6px;margin-bottom:0;';

        const parent = input.closest('.input-icon') || input.parentNode;
        parent.insertAdjacentElement('afterend', msg);
    }

    function clearError(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.classList.remove('input-error', 'input-success');
        const parent   = input.closest('.input-icon') || input.parentNode;
        const existing = parent.nextElementSibling;
        if (existing && existing.classList.contains('input-error')) existing.remove();
    }

    function clearAllErrors() {
        document.querySelectorAll('.input-error').forEach(function (el) { el.remove(); });
        document.querySelectorAll('input, select, textarea').forEach(function (el) {
            el.style.borderColor = '';
            el.style.boxShadow   = '';
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function getPasswordStrength(password) {
        const score = [
            /[A-Z]/.test(password),
            /[a-z]/.test(password),
            /[0-9]/.test(password),
            /[^A-Za-z0-9]/.test(password),
        ].filter(Boolean).length;

        if (password.length < 8) return 'weak';
        if (score <= 2)          return 'weak';
        if (score === 3)         return 'medium';
        return 'strong';
    }

    /* ────────────────────────────────────
       TOAST NOTIFICATIONS
    ──────────────────────────────────── */
    function showToast(message, duration) {
        duration = duration || 3000;
        var existing = document.getElementById('cl-toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.id = 'cl-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(function () {
            if (toast.parentNode) toast.remove();
        }, duration);
    }

    function escapeHTML(str) {
        return String(str)
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;')
            .replace(/'/g,  '&#039;');
    }
    /* ════════════════════════════════════
    SAVED JOBS PAGE
    File: USER/saved-jobs.html
    ════════════════════════════════════ */
    if (page === 'saved-jobs.html') {
        const grid     = document.getElementById('saved-jobs-grid');
        const emptyMsg = document.getElementById('no-saved-jobs');
        if (!grid || !emptyMsg) return;

        function renderSavedJobs() {
            const saved = JSON.parse(sessionStorage.getItem('savedJobs') || '[]');
            
            if (saved.length === 0) {
                grid.style.display     = 'none';
                emptyMsg.style.display = 'block';
            } else {
                grid.style.display     = 'flex';
                emptyMsg.style.display = 'none';
                grid.innerHTML         = '';
                saved.forEach(function (job) {
                    grid.innerHTML += buildSavedJobCard(job);
                });

                // Unsave functionality
                grid.querySelectorAll('.unsave-btn').forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        const card  = this.closest('.job-card');
                        const jobId = parseInt(card.dataset.id);
                        const updated = saved.filter(function (j) { return j.id !== jobId; });
                        sessionStorage.setItem('savedJobs', JSON.stringify(updated));
                        
                        card.style.transition = 'opacity 0.3s, transform 0.3s';
                        card.style.opacity    = '0';
                        card.classList.add('fade-out');
                        setTimeout(function () {
                            renderSavedJobs();
                        }, 300);
                        
                        showToast('Job removed from saved');
                    });
                });

                // View details links
                grid.querySelectorAll('.view-details-link').forEach(function (link) {
                    link.addEventListener('click', function (e) {
                        e.preventDefault();
                        const card  = this.closest('.job-card');
                        const jobId = parseInt(card.dataset.id);
                        const job   = saved.find(function (j) { return j.id === jobId; });
                        if (job) sessionStorage.setItem('selectedJob', JSON.stringify(job));
                        window.location.href = 'job-details.html';
                    });
                });
            }
        }

        function buildSavedJobCard(job) {
            const badgeClass = job.status === 'open' ? 'badge-open' : 'badge-closed';
            const badgeText  = job.status === 'open' ? 'Open' : 'Closed';
            return `
                <article class="job-card" data-id="${job.id}">
                    <span class="saved-badge"><i class="fa-solid fa-bookmark"></i> Saved</span>
                    <h3>${escapeHTML(job.title)}</h3>
                    <p><strong>Company:</strong> ${escapeHTML(job.company)}</p>
                    <p><strong>Salary:</strong> ${escapeHTML(job.salary)}</p>
                    <p><strong>Experience:</strong> ${escapeHTML(job.experience)} years</p>
                    <p><strong>Status:</strong> <span class="${badgeClass}">${badgeText}</span></p>
                    <a href="job-details.html" class="view-details-link">View Details</a>
                    <button type="button" class="unsave-btn"><i class="fa-solid fa-trash"></i> Remove</button>
                </article>
            `;
        }

        renderSavedJobs();
    }


});

    