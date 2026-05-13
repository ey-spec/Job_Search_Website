/* ════════════════════════════════════════
   CareerLink — main.js
   All pages connected to Django backend.
════════════════════════════════════════ */

/* ─────────────────────────────────────
   API CONFIG
───────────────────────────────────── */
const API = "http://127.0.0.1:8000/api";

// Gets the CSRF cookie that Django sets — needed for POST/PUT/DELETE requests
function getCSRF() {
  const value = "; " + document.cookie;
  const parts = value.split("; csrftoken=");
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// Runs once when the page loads — asks Django to set the CSRF cookie
async function initCSRF() {
  try {
    await fetch(API + "/auth/me/", { credentials: "include" });
  } catch (err) {
    // Server might not be running — ignore
  }
}
initCSRF();

document.addEventListener("DOMContentLoaded", function () {
  /* ─────────────────────────────────────
     THEME TOGGLE (dark/light mode)
  ───────────────────────────────────── */
  const themeToggle = document.getElementById("theme-toggle");
  const logoImg = document.getElementById("nav-logo-logo");

  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
    if (themeToggle) themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    if (logoImg) logoImg.src = logoImg.src.replace("logo.png", "logo1.png");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      document.body.classList.toggle("light-mode");
      const isLight = document.body.classList.contains("light-mode");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      themeToggle.innerHTML = isLight
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
      if (logoImg) {
        logoImg.src = isLight
          ? logoImg.src.replace("logo.png", "logo1.png")
          : logoImg.src.replace("logo1.png", "logo.png");
      }
    });
  }

  // Show any toast message that was queued before a page redirect
  const pendingToast = localStorage.getItem("showToast");
  if (pendingToast) {
    localStorage.removeItem("showToast");
    showToast(pendingToast);
  }

  /* ─────────────────────────────────────
     PAGE & PATH DETECTION
     Figures out which HTML file we are on
     and builds relative paths correctly
  ───────────────────────────────────── */
  const page = window.location.pathname.split("/").pop();
  const folder = window.location.pathname.split("/").slice(-2, -1)[0];

  // Builds a path that works from any subfolder (SHARED, USER, ADMIN)
  function path(to) {
    if (folder === "SHARED" || folder === "ADMIN" || folder === "USER") {
      return "../" + to;
    }
    return to;
  }

  /* ─────────────────────────────────────
     CURRENT USER HELPER
     currentUser is stored in localStorage after login.
     It looks like: { id, username, email, is_company_admin, company_name }
  ───────────────────────────────────── */
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  }

  /* ════════════════════════════════════
     1. NAVBAR
     Builds navigation links based on whether
     the user is logged in and their role.
  ════════════════════════════════════ */
  (function initNavbar() {
    const currentUser = getCurrentUser();
    const isAdmin = currentUser && currentUser.is_company_admin;
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks) return;

    // ── Route protection ──
    // These pages require admin login
    const adminPages = [
      "admin-dashboard.html",
      "add-job.html",
      "edit-job.html",
      "applicants.html",
    ];
    // These pages require any login
    const userPages = [
      "jobs.html",
      "saved-jobs.html",
      "applied-jobs.html",
      "job-details.html",
      "profile.html",
    ];

    if (adminPages.includes(page) && !isAdmin) {
      window.location.href = path("SHARED/login.html");
      return;
    }
    if (userPages.includes(page) && !currentUser) {
      window.location.href = path("SHARED/login.html");
      return;
    }

    // ── Build nav links based on role ──
    if (isAdmin) {
      navLinks.innerHTML = `
        <a href="${path("ADMIN/admin-dashboard.html")}">My Jobs</a>
        <a href="${path("ADMIN/add-job.html")}">Add Job</a>
        <a href="${path("USER/profile.html")}">Profile</a>
        <a href="#" id="logout-btn">Logout</a>
      `;
    } else if (currentUser) {
      navLinks.innerHTML = `
        <a href="${path("USER/jobs.html")}">Browse Jobs</a>
        <a href="${path("USER/saved-jobs.html")}">Saved Jobs</a>
        <a href="${path("USER/applied-jobs.html")}">Applied Jobs</a>
        <a href="${path("USER/profile.html")}">Profile</a>
        <a href="#" id="logout-btn">Logout</a>
      `;
    } else {
      navLinks.innerHTML = `
        <a href="${path("USER/jobs.html")}">Browse Jobs</a>
        <a href="${path("SHARED/about.html")}">About</a>
        <a href="${path("SHARED/login.html")}">Login</a>
        <a href="${path("SHARED/signup.html")}">Sign Up</a>
      `;
    }

    // ── Highlight the current page link ──
    navLinks.querySelectorAll("a").forEach(function (link) {
      if (link.href.split("/").pop() === page) link.classList.add("active");
    });

    // ── Logout button ──
    // Calls the backend to end the session, then clears local storage
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        try {
          await fetch(API + "/auth/logout/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCSRF(),
            },
            credentials: "include",
          });
        } catch (err) {
          /* ignore */
        }
        localStorage.removeItem("currentUser");
        localStorage.removeItem("selectedJobId");
        localStorage.removeItem("editJobId");
        localStorage.removeItem("viewJobId");
        window.location.href = path("SHARED/index.html");
      });
    }
  })();

  /* ────────────────────────────────────
     FOOTER AUTH LINKS
     Hide Login/Sign Up in the footer when user is already logged in
  ──────────────────────────────────── */
  (function initFooterAuthLinks() {
    const currentUser = getCurrentUser();
    const footerLoginLink = document.getElementById("footer-login-link");
    const footerSignupLink = document.getElementById("footer-signup-link");
    if (currentUser) {
      if (footerLoginLink) footerLoginLink.style.display = "none";
      if (footerSignupLink) footerSignupLink.style.display = "none";
    }
  })();

  /* ════════════════════════════════════
     2. LOGIN PAGE
     File: SHARED/login.html
     Sends email + password to backend.
     On success: saves user to localStorage, redirects.
  ════════════════════════════════════ */
  if (page === "login.html") {
    const form = document.querySelector("form");
    if (!form) return;

    // If already logged in, redirect away from login page
    const currentUser = getCurrentUser();
    if (currentUser) {
      window.location.href = currentUser.is_company_admin
        ? path("ADMIN/admin-dashboard.html")
        : path("USER/jobs.html");
      return;
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearAllErrors();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      let valid = true;

      if (!email || !isValidEmail(email)) {
        showError("email", "Please enter a valid email.");
        valid = false;
      }
      if (!password || password.length < 8) {
        showError("password", "Password must be at least 8 characters.");
        valid = false;
      }
      if (!valid) return;

      try {
        // Send login request to Django
        const response = await fetch(API + "/auth/login/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRF(),
          },
          credentials: "include", // important: sends/receives session cookies
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Save the user object so navbar and pages know who is logged in
          localStorage.setItem("currentUser", JSON.stringify(data.user));
          localStorage.setItem("showToast", "✓ Logged in successfully!");
          window.location.href = data.user.is_company_admin
            ? path("ADMIN/admin-dashboard.html")
            : path("USER/jobs.html");
        } else {
          const errMsg =
            data.error ||
            (data.non_field_errors && data.non_field_errors[0]) ||
            "Invalid email or password.";
          showError("password", errMsg);
        }
      } catch (err) {
        showToast("Connection error. Is the server running?");
      }
    });
  }

  /* ════════════════════════════════════
     3. SIGNUP PAGE
     File: SHARED/signup.html
     Sends registration data to backend.
     On success: redirects to login.
  ════════════════════════════════════ */
  if (page === "signup.html") {
    const form = document.querySelector("form");
    if (!form) return;

    const currentUser = getCurrentUser();
    if (currentUser) {
      window.location.href = currentUser.is_company_admin
        ? path("ADMIN/admin-dashboard.html")
        : path("USER/jobs.html");
      return;
    }

    // Show/hide company name field based on admin radio button
    const radios = document.querySelectorAll('input[name="is_company_admin"]');
    const companyGroup = document.getElementById("company-name-group");
    const companyInput = document.getElementById("company-name");

    radios.forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (this.value === "yes") {
          companyGroup.style.display = "block";
          companyInput.setAttribute("required", "required");
        } else {
          companyGroup.style.display = "none";
          companyInput.removeAttribute("required");
          companyInput.value = "";
        }
      });
    });

    // Password strength checker
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirm-password");

    passwordInput.addEventListener("input", function () {
      if (!this.value) {
        clearError("password");
        return;
      }
      const s = getPasswordStrength(this.value);
      if (s === "weak")
        showError("password", "Weak — add uppercase, numbers or symbols.");
      else if (s === "medium") showSuccess("password", "Medium strength.");
      else showSuccess("password", "Strong password.");
    });

    confirmInput.addEventListener("input", function () {
      if (!this.value) {
        clearError("confirm-password");
        return;
      }
      if (this.value !== passwordInput.value)
        showError("confirm-password", "Passwords do not match.");
      else showSuccess("confirm-password", "Passwords match.");
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearAllErrors();

      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmInput.value;
      const isAdminVal = document.querySelector(
        'input[name="is_company_admin"]:checked',
      ).value;
      const companyName = companyInput.value.trim();
      let valid = true;

      if (!username || username.length < 3) {
        showError("username", "Username must be at least 3 characters.");
        valid = false;
      }
      if (!email || !isValidEmail(email)) {
        showError("email", "Please enter a valid email.");
        valid = false;
      }
      if (!password || password.length < 8) {
        showError("password", "Password must be at least 8 characters.");
        valid = false;
      }
      if (!confirmPassword) {
        showError("confirm-password", "Please confirm your password.");
        valid = false;
      } else if (password !== confirmPassword) {
        showError("confirm-password", "Passwords do not match.");
        valid = false;
      }
      if (isAdminVal === "yes" && !companyName) {
        showError("company-name", "Company name is required.");
        valid = false;
      }
      if (!valid) return;

      try {
        const response = await fetch(API + "/auth/register/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRF(),
          },
          credentials: "include",
          body: JSON.stringify({
            username,
            email,
            password,
            confirm_password: confirmPassword,
            is_company_admin: isAdminVal === "yes",
            company_name: companyName,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem(
            "showToast",
            "✓ Account created! Please log in.",
          );
          window.location.href = path("SHARED/login.html");
        } else {
          if (data.email) showError("email", data.email[0]);
          if (data.username) showError("username", data.username[0]);
          if (data.password) showError("password", data.password[0]);
          if (data.company_name)
            showError("company-name", data.company_name[0]);
          if (data.non_field_errors)
            showError("confirm-password", data.non_field_errors[0]);
        }
      } catch (err) {
        showToast("Connection error. Is the server running?");
      }
    });
  }

  /* ════════════════════════════════════
     4. INDEX PAGE (Home)
     File: SHARED/index.html
     Shows hero animation, stats counter,
     and featured jobs loaded from backend.
  ════════════════════════════════════ */
  if (page === "index.html") {
    // Hide Login/Sign Up hero buttons if already logged in
    const currentUser = getCurrentUser();
    const heroAuthButtons = document.getElementById("hero-auth-buttons");
    if (currentUser && heroAuthButtons) heroAuthButtons.style.display = "none";

    // ── Hero canvas animation ──
    const canvas = document.getElementById("hero-canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      let width,
        height,
        tick = 0;
      function resizeCanvas() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      function getAccentColor() {
        return (
          getComputedStyle(document.documentElement)
            .getPropertyValue("--accent")
            .trim() || "#818cf8"
        );
      }
      function hexToRgba(hex, alpha) {
        hex = hex.replace("#", "");
        if (hex.length === 3)
          hex = hex
            .split("")
            .map((c) => c + c)
            .join("");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
      }
      function drawGrid() {
        ctx.clearRect(0, 0, width, height);
        const step = 28,
          accent = getAccentColor();
        const light = document.body.classList.contains("light-mode");
        for (var x = 0; x <= width; x += step) {
          for (var y = 0; y <= height; y += step) {
            var dx = Math.sin(x * 0.04 + tick * 0.02) * 7;
            var dy = Math.cos(y * 0.04 + tick * 0.015) * 7;
            var base = light ? 0.25 : 0.35;
            var alpha =
              base +
              Math.sin(x * 0.05 + y * 0.05 + tick * 0.02) *
                (light ? 0.15 : 0.2);
            ctx.beginPath();
            ctx.arc(x + dx, y + dy, 1.6, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(accent, alpha);
            ctx.fill();
          }
        }
        tick++;
        requestAnimationFrame(drawGrid);
      }
      drawGrid();
    }

    // ── Hero search bar ──
    const heroBtn = document.getElementById("search-btn");
    const heroInput = document.getElementById("search-input");
    if (heroBtn && heroInput) {
      heroBtn.addEventListener("click", function () {
        const q = heroInput.value.trim();
        if (!q) {
          heroInput.classList.add("input-error-shake");
          return;
        }
        window.location.href =
          path("USER/jobs.html") + "?q=" + encodeURIComponent(q);
      });
      heroInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") heroBtn.click();
      });
    }

    // ── Animated stats counter ──
    document.querySelectorAll(".stat-number").forEach(function (el) {
      const raw = el.textContent.trim();
      const target = parseInt(raw.replace(/\D/g, ""));
      const suffix = raw.replace(/[\d]/g, "");
      let current = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(function () {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = current + suffix;
      }, 20);
    });

    // ── Featured Jobs — loaded from backend ──
    const featuredGrid = document.querySelector(".featured-jobs .jobs-grid");
    if (featuredGrid) {
      featuredGrid.innerHTML =
        '<p style="color:#9ca3af;text-align:center;width:100%;">Loading...</p>';
      fetch(API + "/jobs/?status=open", { credentials: "include" })
        .then((r) => r.json())
        .then(function (jobs) {
          featuredGrid.innerHTML = "";
          // Show only first 4 open jobs
          const featured = jobs.filter((j) => j.status === "open").slice(0, 4);
          if (featured.length === 0) {
            featuredGrid.innerHTML =
              '<p style="color:#9ca3af;text-align:center;width:100%;">No open jobs available right now.</p>';
            return;
          }
          featured.forEach(function (job) {
            featuredGrid.innerHTML += buildJobCard(
              job,
              "../USER/job-details.html",
              false,
            );
          });
          featuredGrid.querySelectorAll(".job-card a").forEach(function (link) {
            link.addEventListener("click", function (e) {
              e.preventDefault();
              const jobId = parseInt(link.closest(".job-card").dataset.id);
              localStorage.setItem("selectedJobId", jobId);
              window.location.href = "../USER/job-details.html";
            });
          });
        })
        .catch(function () {
          featuredGrid.innerHTML =
            '<p style="color:#9ca3af;text-align:center;width:100%;">Must be loggedin to load jobs.</p>';
        });
    }
  }

  /* ════════════════════════════════════
     5. JOBS PAGE
     File: USER/jobs.html
     Loads all jobs from backend with
     search, filter, and sort support.
  ════════════════════════════════════ */
  if (page === "jobs.html") {
    const searchInput = document.getElementById("search-input");
    const searchFilter = document.getElementById("search-filter");
    const sortFilter = document.getElementById("sort-filter");
    const statusFilter = document.getElementById("status-filter");
    const searchBtn = document.getElementById("search-btn");
    const resultsInfo = document.getElementById("search-results-info");
    const jobsGrid = document.getElementById("jobs-grid");
    if (!jobsGrid) return;

    // Fetch jobs from backend with query parameters
    // Example: GET /api/jobs/?search=engineer&search_by=title&sort_by=salary_high&status=open
    async function loadJobs() {
      const search = searchInput ? searchInput.value.trim() : "";
      const searchBy = searchFilter ? searchFilter.value : "title";
      const sortBy = sortFilter ? sortFilter.value : "";
      const statusVal = statusFilter ? statusFilter.value : "all";

      // Build URL with query params to match what the backend expects
      let url = API + "/jobs/?";
      if (search)
        url +=
          "search=" +
          encodeURIComponent(search) +
          "&search_by=" +
          searchBy +
          "&";
      if (sortBy) {
        // Convert HTML option values to backend format
        const sortMap = {
          "salary-high": "salary_high",
          "salary-low": "salary_low",
          "experience-high": "experience_high",
          "experience-low": "experience_low",
        };
        url += "sort_by=" + (sortMap[sortBy] || sortBy) + "&";
      }
      if (statusVal && statusVal !== "all") url += "status=" + statusVal + "&";

      jobsGrid.innerHTML =
        '<p style="color:#9ca3af;text-align:center;width:100%;padding:40px;">Loading...</p>';

      try {
        const response = await fetch(url, { credentials: "include" });
        const jobs = await response.json();

        jobsGrid.innerHTML = "";
        if (!jobs.length) {
          jobsGrid.innerHTML =
            '<p style="color:#9ca3af;text-align:center;width:100%;padding:40px;">No jobs found.</p>';
          if (resultsInfo) resultsInfo.innerHTML = "";
          return;
        }

        jobs.forEach(function (job) {
          jobsGrid.innerHTML += buildJobCard(job, "job-details.html", false);
        });

        // Make job cards clickable — save the job ID and go to details page
        jobsGrid.querySelectorAll(".job-card a").forEach(function (link) {
          link.addEventListener("click", function (e) {
            e.preventDefault();
            const jobId = parseInt(link.closest(".job-card").dataset.id);
            localStorage.setItem("selectedJobId", jobId);
            window.location.href = "job-details.html";
          });
        });

        if (resultsInfo) {
          resultsInfo.innerHTML = search
            ? "Showing <strong>" +
              jobs.length +
              '</strong> result(s) for <strong>"' +
              escapeHTML(search) +
              '"</strong>.'
            : "";
        }
      } catch (err) {
        jobsGrid.innerHTML =
          '<p style="color:#9ca3af;text-align:center;width:100%;padding:40px;">Could not load jobs. Is the server running?</p>';
      }
    }

    loadJobs();

    // Search/filter/sort controls all trigger a new fetch
    if (searchBtn) searchBtn.addEventListener("click", loadJobs);
    if (searchInput) {
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") loadJobs();
      });
      searchInput.addEventListener("input", function () {
        if (!this.value) loadJobs();
      });
    }
    if (sortFilter) sortFilter.addEventListener("change", loadJobs);
    if (statusFilter) statusFilter.addEventListener("change", loadJobs);

    // Handle search query passed from the home page hero search
    const heroQuery = new URLSearchParams(window.location.search).get("q");
    if (heroQuery && searchInput) {
      searchInput.value = heroQuery;
      loadJobs();
    }
  }

  /* ════════════════════════════════════
     6. JOB DETAILS PAGE
     File: USER/job-details.html
     Loads one job from backend by ID.
     Handles Apply and Save buttons.
  ════════════════════════════════════ */
  if (page === "job-details.html") {
    const jobId = localStorage.getItem("selectedJobId");
    if (!jobId) {
      window.location.href = "jobs.html";
      return;
    }

    const currentUser = getCurrentUser();

    // Load job details from backend
    fetch(API + "/jobs/" + jobId + "/", { credentials: "include" })
      .then((r) => r.json())
      .then(function (job) {
        document.getElementById("job-title").textContent = job.title;
        document.getElementById("job-company").textContent = job.company_name;
        document.getElementById("job-work-type").textContent = formatWorkType(
          job.work_type,
        );
        document.getElementById("job-salary").textContent =
          "$" + Number(job.salary).toLocaleString();
        document.getElementById("job-experience").textContent =
          job.years_of_experience + " years";
        document.getElementById("job-description").textContent =
          job.description;

        const statusEl = document.getElementById("job-status");
        statusEl.textContent = job.status === "open" ? "Open" : "Closed";
        statusEl.className =
          job.status === "open" ? "badge-open" : "badge-closed";

        setupApplyButton(job, currentUser);
        setupSaveButton(job, currentUser);
      })
      .catch(function () {
        showToast("Could not load job details.");
        setTimeout(() => (window.location.href = "jobs.html"), 1500);
      });

    function setupApplyButton(job, user) {
      const applyBtn = document.getElementById("apply-btn");
      if (!applyBtn) return;

      function disableApply(text) {
        applyBtn.classList.add("btn-disabled");
        applyBtn.textContent = text;
        applyBtn.style.pointerEvents = "none";
      }

      if (user && user.is_company_admin) {
        disableApply("Admins cannot apply");
        return;
      }
      if (job.status === "closed") {
        disableApply("Position Closed");
        return;
      }

      // Check if user already applied by fetching their applications
      if (user) {
        fetch(API + "/jobs/applications/", { credentials: "include" })
          .then((r) => r.json())
          .then(function (applications) {
            const alreadyApplied = applications.some(
              (a) => a.job.id === job.id,
            );
            if (alreadyApplied) {
              disableApply("Already Applied");
              return;
            }

            applyBtn.addEventListener("click", async function (e) {
              e.preventDefault();
              try {
                const response = await fetch(
                  API + "/jobs/" + job.id + "/apply/",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "X-CSRFToken": getCSRF(),
                    },
                    credentials: "include",
                  },
                );
                const data = await response.json();
                if (response.ok) {
                  disableApply("✓ Applied Successfully!");
                  applyBtn.style.background =
                    "linear-gradient(135deg, #1D9E75, #0F6E56)";
                  localStorage.setItem(
                    "showToast",
                    "✓ Application submitted successfully!",
                  );
                  window.location.href = "applied-jobs.html";
                } else {
                  showToast(data.error || "Could not apply.");
                }
              } catch (err) {
                showToast("Connection error.");
              }
            });
          });
      } else {
        applyBtn.addEventListener("click", function (e) {
          e.preventDefault();
          window.location.href = "../SHARED/login.html";
        });
      }
    }

    function setupSaveButton(job, user) {
      const saveBtn = document.getElementById("save-btn");
      if (!saveBtn) return;

      if (!user) {
        saveBtn.addEventListener("click", function (e) {
          e.preventDefault();
          window.location.href = "../SHARED/login.html";
        });
        return;
      }

      if (user.is_company_admin) {
        saveBtn.innerHTML = "Admins cannot save";
        saveBtn.classList.add("btn-disabled");
        saveBtn.style.pointerEvents = "none";
        return;
      }

      // Check if job is already saved
      fetch(API + "/jobs/saved/", { credentials: "include" })
        .then((r) => r.json())
        .then(function (savedJobs) {
          const alreadySaved = savedJobs.some((s) => s.job.id === job.id);
          if (alreadySaved) {
            saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
            saveBtn.classList.add("btn-saved");
            saveBtn.style.pointerEvents = "none";
            return;
          }
          saveBtn.addEventListener("click", async function (e) {
            e.preventDefault();
            try {
              const response = await fetch(API + "/jobs/" + job.id + "/save/", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRFToken": getCSRF(),
                },
                credentials: "include",
              });
              const data = await response.json();
              if (response.ok) {
                saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
                saveBtn.style.pointerEvents = "none";
                showToast("Job saved!");
              } else {
                showToast(data.error || "Could not save job.");
              }
            } catch (err) {
              showToast("Connection error.");
            }
          });
        });
    }
  }

  /* ════════════════════════════════════
     7. APPLIED JOBS PAGE
     File: USER/applied-jobs.html
     Shows all jobs the user has applied to.
  ════════════════════════════════════ */
  if (page === "applied-jobs.html") {
    const grid = document.getElementById("applied-jobs-grid");
    const emptyMsg = document.getElementById("no-applied-jobs");
    if (!grid || !emptyMsg) return;

    grid.innerHTML = "";
    emptyMsg.style.display = "none";

    fetch(API + "/jobs/applications/", { credentials: "include" })
      .then((r) => r.json())
      .then(function (applications) {
        if (applications.length === 0) {
          emptyMsg.style.display = "block";
          grid.style.display = "none";
          return;
        }
        grid.style.display = "flex";
        // Each application has a .job object with full job details
        applications.forEach(function (app) {
          grid.innerHTML += buildJobCard(app.job, null, false, true);
        });

        // Make cards clickable for details
        grid.querySelectorAll(".job-card a.view-link").forEach(function (link) {
          link.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.setItem(
              "selectedJobId",
              link.closest(".job-card").dataset.id,
            );
            window.location.href = "job-details.html";
          });
        });
      })
      .catch(function () {
        emptyMsg.style.display = "block";
        emptyMsg.querySelector("p").textContent =
          "Could not load applied jobs.";
      });
  }

  /* ════════════════════════════════════
     8. SAVED JOBS PAGE
     File: USER/saved-jobs.html
     Shows all saved jobs with option to unsave.
  ════════════════════════════════════ */
  if (page === "saved-jobs.html") {
    const grid = document.getElementById("saved-jobs-grid");
    const emptyMsg = document.getElementById("no-saved-jobs");
    if (!grid || !emptyMsg) return;

    function loadSavedJobs() {
      fetch(API + "/jobs/saved/", { credentials: "include" })
        .then((r) => r.json())
        .then(function (savedJobs) {
          grid.innerHTML = "";
          if (savedJobs.length === 0) {
            emptyMsg.style.display = "block";
            grid.style.display = "none";
            return;
          }
          emptyMsg.style.display = "none";
          grid.style.display = "flex";

          savedJobs.forEach(function (saved) {
            grid.innerHTML += buildSavedJobCard(saved.job);
          });

          // View details
          grid.querySelectorAll(".view-details-link").forEach(function (link) {
            link.addEventListener("click", function (e) {
              e.preventDefault();
              localStorage.setItem(
                "selectedJobId",
                link.closest(".job-card").dataset.id,
              );
              window.location.href = "job-details.html";
            });
          });

          // Unsave button — calls DELETE on the backend
          grid.querySelectorAll(".unsave-btn").forEach(function (btn) {
            btn.addEventListener("click", async function () {
              const card = btn.closest(".job-card");
              const jId = card.dataset.id;
              try {
                const response = await fetch(API + "/jobs/" + jId + "/save/", {
                  method: "DELETE",
                  headers: { "X-CSRFToken": getCSRF() },
                  credentials: "include",
                });
                if (response.ok) {
                  card.style.opacity = "0";
                  card.style.transition = "opacity 0.3s";
                  setTimeout(loadSavedJobs, 300);
                  showToast("Job removed from saved.");
                } else {
                  showToast("Could not remove job.");
                }
              } catch (err) {
                showToast("Connection error.");
              }
            });
          });
        })
        .catch(function () {
          emptyMsg.style.display = "block";
          emptyMsg.querySelector("p").textContent =
            "Could not load saved jobs.";
        });
    }

    loadSavedJobs();
  }

  /* ════════════════════════════════════
     9. ADMIN DASHBOARD
     File: ADMIN/admin-dashboard.html
     Loads jobs created by the logged-in admin.
     Supports edit, delete, view applicants.
  ════════════════════════════════════ */
  if (page === "admin-dashboard.html") {
    const jobsGrid = document.querySelector(".jobs-grid");
    if (!jobsGrid) return;

    async function loadAdminJobs() {
      jobsGrid.innerHTML =
        '<p style="color:#9ca3af;text-align:center;padding:40px;width:100%;">Loading...</p>';
      try {
        const response = await fetch(API + "/jobs/admin/", {
          credentials: "include",
        });
        const jobs = await response.json();

        jobsGrid.innerHTML = "";
        if (!jobs.length) {
          jobsGrid.innerHTML = `<p style="color:#9ca3af;text-align:center;padding:40px;width:100%;">No jobs posted yet. <a href="add-job.html" style="color:#818cf8;">Add one</a>.</p>`;
          updateDashboardStats(0, 0);
          return;
        }

        jobs.forEach(function (job) {
          jobsGrid.innerHTML += buildJobCard(job, null, true);
        });

        const open = jobs.filter((j) => j.status === "open").length;
        updateDashboardStats(open, jobs.length - open);

        // Delete button
        jobsGrid.querySelectorAll(".delete-btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            const card = btn.closest(".job-card");
            const jId = card.dataset.id;
            const title = card.querySelector("h3").textContent;
            showConfirmModal(
              'Delete "' + title + '"? This cannot be undone.',
              async function () {
                try {
                  const res = await fetch(API + "/jobs/" + jId + "/", {
                    method: "DELETE",
                    headers: { "X-CSRFToken": getCSRF() },
                    credentials: "include",
                  });
                  if (res.ok) {
                    card.style.opacity = "0";
                    card.style.transition = "opacity 0.3s";
                    setTimeout(loadAdminJobs, 300);
                    showToast("Job deleted.");
                  } else {
                    showToast("Could not delete job.");
                  }
                } catch (err) {
                  showToast("Connection error.");
                }
              },
            );
          });
        });

        // Edit button — save job ID and go to edit page
        jobsGrid.querySelectorAll(".edit-link").forEach(function (link) {
          link.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.setItem(
              "editJobId",
              link.closest(".job-card").dataset.id,
            );
            window.location.href = "edit-job.html";
          });
        });

        // View applicants button
        jobsGrid
          .querySelectorAll(".view-applicants-btn")
          .forEach(function (btn) {
            btn.addEventListener("click", function () {
              localStorage.setItem(
                "viewJobId",
                btn.closest(".job-card").dataset.id,
              );
              window.location.href = "applicants.html";
            });
          });
      } catch (err) {
        jobsGrid.innerHTML =
          '<p style="color:#9ca3af;text-align:center;padding:40px;width:100%;">Could not load jobs.</p>';
      }
    }

    loadAdminJobs();

    function updateDashboardStats(open, closed) {
      let statsEl = document.getElementById("dashboard-stats");
      if (!statsEl) {
        statsEl = document.createElement("p");
        statsEl.id = "dashboard-stats";
        statsEl.style.cssText =
          "color:#6b7280;margin-bottom:20px;font-size:14px;font-weight:500;";
        const h1 = document.querySelector(".dashboard-container h1");
        if (h1) h1.insertAdjacentElement("afterend", statsEl);
      }
      statsEl.innerHTML =
        '<span style="color:#7c3aed;font-weight:700;">' +
        open +
        '</span> Open &nbsp;·&nbsp; <span style="color:#6b7280;">' +
        closed +
        "</span> Closed";
    }
  }

  /* ════════════════════════════════════
     10. ADD JOB PAGE
     File: ADMIN/add-job.html
     Sends new job to backend API.
  ════════════════════════════════════ */
  if (page === "add-job.html") {
    const currentUser = getCurrentUser();
    const companyField = document.getElementById("company-name");
    if (companyField && currentUser)
      companyField.value = currentUser.company_name || "";
    const form = document.querySelector("form");
    if (!form) return;

    attachCharCounter();

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearAllErrors();

      const values = getJobFormValues();
      if (!validateJobForm(values)) return;

      try {
        const response = await fetch(API + "/jobs/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRF(),
          },
          credentials: "include",
          body: JSON.stringify({
            title: values.title,
            work_type: values.workType, // must match backend field names
            salary: values.salary,
            years_of_experience: parseInt(values.experience),
            status: values.status,
            description: values.desc,
            // company_name is set automatically by the backend from the admin's profile
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("showToast", "✓ Job posted successfully!");
          window.location.href = path("ADMIN/admin-dashboard.html");
        } else {
          // Show backend validation errors on the correct fields
          if (data.title) showError("job-title", data.title[0]);
          if (data.salary) showError("salary", data.salary[0]);
          if (data.years_of_experience)
            showError("years-of-experience", data.years_of_experience[0]);
          if (data.description) showError("description", data.description[0]);
          if (data.work_type) showError("work-type", data.work_type[0]);
          if (data.error) showToast(data.error);
        }
      } catch (err) {
        showToast("Connection error.");
      }
    });
  }

  /* ════════════════════════════════════
     11. EDIT JOB PAGE
     File: ADMIN/edit-job.html
     Pre-fills form with job data from backend,
     then sends updated data on submit.
  ════════════════════════════════════ */
  if (page === "edit-job.html") {
    const form = document.querySelector("form");
    if (!form) return;

    const editJobId = localStorage.getItem("editJobId");
    if (!editJobId) {
      window.location.href = "admin-dashboard.html";
      return;
    }

    // Load the job from backend to pre-fill the form
    fetch(API + "/jobs/" + editJobId + "/", { credentials: "include" })
      .then((r) => r.json())
      .then(function (job) {
        document.getElementById("job-title").value = job.title;
        document.getElementById("company-name").value = job.company_name;
        document.getElementById("work-type").value = job.work_type;
        document.getElementById("salary").value = job.salary;
        document.getElementById("years-of-experience").value =
          job.years_of_experience;
        document.getElementById("job-status").value = job.status;
        document.getElementById("description").value = job.description;

        attachCharCounter();
      })
      .catch(function () {
        showToast("Could not load job.");
        window.location.href = "admin-dashboard.html";
      });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearAllErrors();

      const values = getJobFormValues();
      if (!validateJobForm(values)) return;

      try {
        const response = await fetch(API + "/jobs/" + editJobId + "/", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRF(),
          },
          credentials: "include",
          body: JSON.stringify({
            title: values.title,
            work_type: values.workType,
            salary: values.salary,
            years_of_experience: parseInt(values.experience),
            status: values.status,
            description: values.desc,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("showToast", "✓ Job updated successfully!");
          window.location.href = "admin-dashboard.html";
        } else {
          if (data.title) showError("job-title", data.title[0]);
          if (data.salary) showError("salary", data.salary[0]);
          if (data.years_of_experience)
            showError("years-of-experience", data.years_of_experience[0]);
          if (data.description) showError("description", data.description[0]);
          if (data.error) showToast(data.error);
        }
      } catch (err) {
        showToast("Connection error.");
      }
    });
  }

  /* ════════════════════════════════════
     12. APPLICANTS PAGE
     File: ADMIN/applicants.html
     Shows who applied to a specific job.
  ════════════════════════════════════ */
  if (page === "applicants.html") {
    const viewJobId = localStorage.getItem("viewJobId");
    if (!viewJobId) {
      window.location.href = "admin-dashboard.html";
      return;
    }

    const titleEl = document.getElementById("applicants-job-title");
    const metaEl = document.getElementById("applicants-job-meta");
    const noApplicants = document.getElementById("no-applicants");
    const tableWrap = document.getElementById("applicants-table-wrap");
    const tbody = document.getElementById("applicants-tbody");
    const countEl = document.getElementById("applicants-count");

    // Load job info first (for the title/meta at the top)
    fetch(API + "/jobs/" + viewJobId + "/", { credentials: "include" })
      .then((r) => r.json())
      .then(function (job) {
        if (titleEl) titleEl.textContent = job.title;
        if (metaEl)
          metaEl.textContent =
            job.company_name +
            " · " +
            (job.status === "open" ? "Open" : "Closed");
      });

    // Load applicants
    fetch(API + "/jobs/admin/" + viewJobId + "/applicants/", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(function (applications) {
        if (applications.length === 0) {
          if (noApplicants) noApplicants.style.display = "block";
          if (tableWrap) tableWrap.style.display = "none";
          return;
        }
        if (noApplicants) noApplicants.style.display = "none";
        if (tableWrap) tableWrap.style.display = "block";

        if (countEl) {
          countEl.innerHTML =
            "<strong>" +
            applications.length +
            "</strong> applicant" +
            (applications.length !== 1 ? "s" : "");
        }

        applications.forEach(function (app, index) {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHTML(app.user.username)}</td>
            <td>${escapeHTML(app.user.email)}</td>
            <td>${escapeHTML(app.job.title)}</td>
          `;
          tbody.appendChild(tr);
        });
      })
      .catch(function () {
        if (noApplicants) {
          noApplicants.style.display = "block";
          noApplicants.querySelector("p").textContent =
            "Could not load applicants.";
        }
      });
  }

  /* ════════════════════════════════════
     13. FORGOT PASSWORD PAGE
     File: SHARED/forgot-password.html
     Sends email + new password to backend.
  ════════════════════════════════════ */
  if (page === "forgot-password.html") {
    const form = document.getElementById("forgot-form");
    const stepEmail = document.getElementById("step-email");
    const stepSuccess = document.getElementById("step-success");
    if (!form) return;

    // We extend the form to also ask for the new password
    const extraFields = document.createElement("div");
    extraFields.innerHTML = `
      <div class="form-group" id="new-pass-group" style="display:none;">
        <label for="fp-new-password">New Password:</label>
        <div class="input-icon">
          <i class="fa-solid fa-lock"></i>
          <input type="password" id="fp-new-password" placeholder="Minimum 8 characters" minlength="8">
        </div>
      </div>
      <div class="form-group" id="confirm-pass-group" style="display:none;">
        <label for="fp-confirm-password">Confirm New Password:</label>
        <div class="input-icon">
          <i class="fa-solid fa-lock"></i>
          <input type="password" id="fp-confirm-password" placeholder="Repeat new password" minlength="8">
        </div>
      </div>
    `;
    const submitBtn = form.querySelector('input[type="submit"]');
    form.insertBefore(extraFields, submitBtn.parentNode);

    let emailVerified = false;

    // Step 1: show password fields when email is entered
    const emailInput = document.getElementById("email");
    emailInput.addEventListener("blur", function () {
      if (isValidEmail(this.value.trim())) {
        document.getElementById("new-pass-group").style.display = "block";
        document.getElementById("confirm-pass-group").style.display = "block";
        submitBtn.value = "Reset Password";
      }
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      clearAllErrors();

      const email = emailInput.value.trim();
      const newPassword = document.getElementById("fp-new-password")
        ? document.getElementById("fp-new-password").value
        : "";
      const confirmPassword = document.getElementById("fp-confirm-password")
        ? document.getElementById("fp-confirm-password").value
        : "";

      if (!email || !isValidEmail(email)) {
        showError("email", "Please enter a valid email.");
        return;
      }
      if (!newPassword || newPassword.length < 8) {
        showError("fp-new-password", "Password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        showError("fp-confirm-password", "Passwords do not match.");
        return;
      }

      try {
        const response = await fetch(API + "/auth/forgot-password/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRF(),
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            new_password: newPassword,
            confirm_password: confirmPassword,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          stepEmail.style.display = "none";
          stepSuccess.style.display = "block";
        } else {
          showError("email", data.error || "Could not reset password.");
        }
      } catch (err) {
        showToast("Connection error.");
      }
    });
  }

  /* ════════════════════════════════════
     14. PROFILE PAGE
     File: USER/profile.html
     Loads user info, allows editing,
     shows applied jobs count,
     handles account deletion.
  ════════════════════════════════════ */
  if (page === "profile.html") {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = path("SHARED/login.html");
      return;
    }

    const displayName = document.getElementById("profile-display-name");
    const displayRole = document.getElementById("profile-display-role");
    if (displayName) displayName.textContent = currentUser.username;
    if (displayRole)
      displayRole.textContent = currentUser.is_company_admin
        ? "Company Admin"
        : "Job Seeker";

    // Pre-fill the form with current user data
    document.getElementById("profile-username").value = currentUser.username;
    document.getElementById("profile-email").value = currentUser.email;

    // Hide "My Activity" stats for admins (admins don't apply to jobs)
    if (currentUser.is_company_admin) {
      const statsCard = document.getElementById("profile-stats-card");
      if (statsCard) statsCard.style.display = "none";
    } else {
      // Load applied jobs count
      fetch(API + "/jobs/applications/", { credentials: "include" })
        .then((r) => r.json())
        .then(function (applications) {
          const countEl = document.getElementById("applied-count");
          if (countEl) countEl.textContent = applications.length;
        });
    }

    // ── Update profile form ──
    const form = document.getElementById("profile-form");
    if (form) {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        clearAllErrors();

        const newUsername = document
          .getElementById("profile-username")
          .value.trim();
        const newEmail = document.getElementById("profile-email").value.trim();
        const currentPass = document.getElementById("current-password").value;
        const newPass = document.getElementById("new-password").value;
        const confirmNewPass = document.getElementById(
          "confirm-new-password",
        ).value;
        let valid = true;

        if (!newUsername || newUsername.length < 3) {
          showError(
            "profile-username",
            "Username must be at least 3 characters.",
          );
          valid = false;
        }
        if (!newEmail || !isValidEmail(newEmail)) {
          showError("profile-email", "Please enter a valid email.");
          valid = false;
        }

        if (currentPass || newPass || confirmNewPass) {
          if (!currentPass) {
            showError("current-password", "Enter your current password.");
            valid = false;
          }
          if (newPass && newPass.length < 8) {
            showError("new-password", "Must be at least 8 characters.");
            valid = false;
          }
          if (newPass !== confirmNewPass) {
            showError("confirm-new-password", "Passwords do not match.");
            valid = false;
          }
        }
        if (!valid) return;

        const body = { username: newUsername, email: newEmail };
        if (currentPass && newPass) {
          body.current_password = currentPass;
          body.new_password = newPass;
          body.confirm_password = confirmNewPass;
        }

        try {
          const response = await fetch(API + "/auth/profile/", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCSRF(),
            },
            credentials: "include",
            body: JSON.stringify(body),
          });

          const data = await response.json();
          if (response.ok) {
            // Update stored user info
            localStorage.setItem("currentUser", JSON.stringify(data.user));
            if (displayName) displayName.textContent = data.user.username;
            showToast("Profile updated!");

            const submitBtn = form.querySelector('input[type="submit"]');
            if (submitBtn) {
              submitBtn.value = "Saved!";
              setTimeout(() => (submitBtn.value = "Save Changes"), 2000);
            }
            document.getElementById("current-password").value = "";
            document.getElementById("new-password").value = "";
            document.getElementById("confirm-new-password").value = "";
          } else {
            if (data.error) showError("current-password", data.error);
            if (data.email) showError("profile-email", data.email[0]);
            if (data.username) showError("profile-username", data.username[0]);
          }
        } catch (err) {
          showToast("Connection error.");
        }
      });
    }

    // ── Delete account ──
    const deleteBtn = document.getElementById("delete-account-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        showConfirmModal(
          "Delete your account? This cannot be undone.",
          async function () {
            try {
              const response = await fetch(API + "/auth/profile/", {
                method: "DELETE",
                headers: { "X-CSRFToken": getCSRF() },
                credentials: "include",
              });
              if (response.ok) {
                localStorage.removeItem("currentUser");
                window.location.href = path("SHARED/index.html");
              } else {
                showToast("Could not delete account.");
              }
            } catch (err) {
              showToast("Connection error.");
            }
          },
        );
      });
    }
  }

  /* ════════════════════════════════════
     SHARED — JOB FORM HELPERS
     Used by both add-job.html and edit-job.html
  ════════════════════════════════════ */
  function getJobFormValues() {
    return {
      title: document.getElementById("job-title")
        ? document.getElementById("job-title").value.trim()
        : "",
      company: document.getElementById("company-name")
        ? document.getElementById("company-name").value.trim()
        : "",
      workType: document.getElementById("work-type")
        ? document.getElementById("work-type").value
        : "",
      salary: document.getElementById("salary")
        ? document.getElementById("salary").value
        : "",
      experience: document.getElementById("years-of-experience")
        ? document.getElementById("years-of-experience").value
        : "",
      status: document.getElementById("job-status")
        ? document.getElementById("job-status").value
        : "",
      desc: document.getElementById("description")
        ? document.getElementById("description").value.trim()
        : "",
    };
  }

  function validateJobForm(v) {
    let valid = true;
    if (!v.title || v.title.length < 3) {
      showError("job-title", "Job title must be at least 3 characters.");
      valid = false;
    }
    if (v.salary === "" || Number(v.salary) < 0) {
      showError("salary", "Please enter a valid salary.");
      valid = false;
    }
    if (v.experience === "" || Number(v.experience) < 0) {
      showError(
        "years-of-experience",
        "Please enter valid years of experience.",
      );
      valid = false;
    }
    if (!v.status) {
      showError("job-status", "Please select a job status.");
      valid = false;
    }
    if (!v.desc || v.desc.length < 20) {
      showError("description", "Description must be at least 20 characters.");
      valid = false;
    }
    return valid;
  }

  function attachCharCounter() {
    const textarea = document.getElementById("description");
    if (!textarea) return;
    const counter = document.createElement("p");
    counter.className = "char-counter";
    counter.textContent = textarea.value.length + " characters";
    textarea.parentNode.insertAdjacentElement("afterend", counter);
    textarea.addEventListener("input", function () {
      counter.textContent = this.value.length + " characters";
      counter.style.color = this.value.length < 20 ? "#ff6b6b" : "#9ca3af";
    });
  }

  /* ════════════════════════════════════
     SHARED — BUILD JOB CARD HTML
     Reused across multiple pages to
     render a job card consistently.
  ════════════════════════════════════ */
  function buildJobCard(job, detailsHref, showActions, showAppliedBadge) {
    const badgeClass = job.status === "open" ? "badge-open" : "badge-closed";
    const badgeText = job.status === "open" ? "Open" : "Closed";
    const salary = job.salary
      ? "$" + Number(job.salary).toLocaleString()
      : "N/A";

    let actionsHTML = "";
    if (showActions) {
      actionsHTML = `
        <div class="card-actions">
          <a href="#" class="edit-link">Edit</a>
          <button type="button" class="delete-btn">Delete</button>
        </div>
        <button type="button" class="view-applicants-btn">
          <i class="fa-solid fa-users"></i> View Applicants
        </button>
      `;
    } else if (showAppliedBadge) {
      actionsHTML = `
        <span style="color:#00c864;font-size:13px;"><i class="fa-solid fa-check"></i> Applied</span>
        <a href="#" class="view-link" style="margin-left:10px;">View Details</a>
      `;
    } else if (detailsHref) {
      actionsHTML = `<a href="${detailsHref}">View Details</a>`;
    }

    return `
      <article class="job-card" data-id="${job.id}">
        <h3>${escapeHTML(job.title)}</h3>
        <p><strong>Company:</strong> ${escapeHTML(job.company_name)}</p>
        <p><strong>Work Type:</strong> ${escapeHTML(formatWorkType(job.work_type))}</p>
        <p><strong>Salary:</strong> ${salary}</p>
        <p><strong>Experience:</strong> ${escapeHTML(String(job.years_of_experience))} years</p>
        <p><strong>Status:</strong> <span class="${badgeClass}">${badgeText}</span></p>
        ${actionsHTML}
      </article>
    `;
  }

  function buildSavedJobCard(job) {
    const badgeClass = job.status === "open" ? "badge-open" : "badge-closed";
    const badgeText = job.status === "open" ? "Open" : "Closed";
    const salary = job.salary
      ? "$" + Number(job.salary).toLocaleString()
      : "N/A";
    return `
      <article class="job-card" data-id="${job.id}">
        <span class="saved-badge"><i class="fa-solid fa-bookmark"></i> Saved</span>
        <h3>${escapeHTML(job.title)}</h3>
        <p><strong>Company:</strong> ${escapeHTML(job.company_name)}</p>
        <p><strong>Work Type:</strong> ${escapeHTML(formatWorkType(job.work_type))}</p>
        <p><strong>Salary:</strong> ${salary}</p>
        <p><strong>Experience:</strong> ${escapeHTML(String(job.years_of_experience))} years</p>
        <p><strong>Status:</strong> <span class="${badgeClass}">${badgeText}</span></p>
        <a href="#" class="view-details-link">View Details</a>
        <button type="button" class="unsave-btn"><i class="fa-solid fa-trash"></i> Remove</button>
      </article>
    `;
  }

  // Converts backend work_type values to human-readable labels
  function formatWorkType(workType) {
    const map = {
      full_time: "Full Time",
      part_time: "Part Time",
      remote: "Remote",
      internship: "Internship",
    };
    return map[workType] || workType || "N/A";
  }

  /* ════════════════════════════════════
     SHARED UTILITIES
  ════════════════════════════════════ */

  // Shows a confirm modal before destructive actions (delete, etc.)
  function showConfirmModal(message, onConfirm) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal-box">
        <h3>Are you sure?</h3>
        <p>${escapeHTML(message)}</p>
        <div class="modal-actions">
          <button class="modal-confirm">Confirm</button>
          <button class="modal-cancel">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay
      .querySelector(".modal-confirm")
      .addEventListener("click", function () {
        overlay.remove();
        onConfirm();
      });
    overlay
      .querySelector(".modal-cancel")
      .addEventListener("click", function () {
        overlay.remove();
      });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });
  }

  // Shows a red error message below an input field
  function showError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    clearError(inputId);
    input.classList.add("input-error");
    const error = document.createElement("p");
    error.className = "error-message";
    error.textContent = message;
    error.style.cssText =
      "color:#ff6b6b;font-size:12px;margin-top:6px;margin-bottom:0;";
    const parent = input.closest(".input-icon") || input.parentNode;
    parent.insertAdjacentElement("afterend", error);
    input.addEventListener(
      "input",
      function () {
        clearError(inputId);
      },
      { once: true },
    );
  }

  // Shows a green success message below an input field
  function showSuccess(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    clearError(inputId);
    input.classList.add("input-success");
    const msg = document.createElement("p");
    msg.className = "success-message";
    msg.textContent = message;
    msg.style.cssText =
      "color:#00c864;font-size:12px;margin-top:6px;margin-bottom:0;";
    const parent = input.closest(".input-icon") || input.parentNode;
    parent.insertAdjacentElement("afterend", msg);
  }

  function clearError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.remove("input-error", "input-success");
    const parent = input.closest(".input-icon") || input.parentNode;
    const existing = parent.nextElementSibling;
    if (
      existing &&
      (existing.classList.contains("error-message") ||
        existing.classList.contains("success-message"))
    ) {
      existing.remove();
    }
  }

  function clearAllErrors() {
    document
      .querySelectorAll(".error-message, .success-message")
      .forEach((el) => el.remove());
    document.querySelectorAll("input, select, textarea").forEach((el) => {
      el.classList.remove("input-error", "input-success");
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
    if (password.length < 8) return "weak";
    if (score <= 2) return "weak";
    if (score === 3) return "medium";
    return "strong";
  }

  // Shows a toast notification at the bottom of the screen
  function showToast(message, duration) {
    duration = duration || 3000;
    const existing = document.getElementById("cl-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.id = "cl-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () {
      if (toast.parentNode) toast.remove();
    }, duration);
  }

  // Prevents XSS — always use this when inserting user content into HTML
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
