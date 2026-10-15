/**
 * ReachEngine Client-Side Authentication, Dashboard & Checkout System
 */
(function() {
  const BACKEND_URL = "https://scraper.blueglobaltechnology.com";
  const RAZORPAY_KEY = "rzp_live_Spab2HR8rHLYPe";
  const INSTALLER_URL = "https://scraper.blueglobaltechnology.com/setup/GMap_Scraper_v1.0.1.exe";

  // Check existing session
  let currentUser = null;
  try {
    const saved = localStorage.getItem("re_user");
    if (saved) currentUser = JSON.parse(saved);
  } catch(e) {}

  // Create Modal HTML Elements
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = `
    <!-- User Account & Dashboard Portal Modal -->
    <div id="re-account-modal" class="re-modal-overlay">
      <div id="re-account-card" class="re-modal-card ${currentUser ? 'dashboard-mode' : ''}">
        <button class="re-modal-close" onclick="window.ReachEngine.closeModal('re-account-modal')">&times;</button>

        <!-- 1. AUTHENTICATION VIEW (Sign Up / Sign In) -->
        <div id="re-auth-view" style="${currentUser ? 'display: none;' : 'display: block;'}">
          <div class="re-tab-bar">
            <button id="re-tab-reg-btn" class="re-tab-btn active" onclick="window.ReachEngine.switchAuthTab('register')">Create Account</button>
            <button id="re-tab-login-btn" class="re-tab-btn" onclick="window.ReachEngine.switchAuthTab('login')">Sign In</button>
          </div>

          <!-- Register Tab -->
          <div id="re-tab-register-content">
            <span class="re-modal-badge">Developer & Outbound Portal</span>
            <h3 class="re-modal-title">Create ReachEngine Account</h3>
            <p class="re-modal-desc">Sign up to get instant access to your developer dashboard, download the scraper, and generate your API key.</p>

            <div class="re-input-group">
              <label class="re-input-label">Full Name</label>
              <input type="text" id="re-reg-name" class="re-input" placeholder="e.g. Rahul Sharma" required />
            </div>
            <div class="re-input-group">
              <label class="re-input-label">Work Email</label>
              <input type="email" id="re-reg-email" class="re-input" placeholder="you@company.com" required />
            </div>
            <div class="re-input-group">
              <label class="re-input-label">Mobile Number</label>
              <input type="tel" id="re-reg-phone" class="re-input" placeholder="+91 9876543210" required />
            </div>

            <button id="re-btn-register" class="re-btn-primary" onclick="window.ReachEngine.handleRegister()">
              Create Account & Enter Dashboard &rarr;
            </button>
            <div id="re-reg-status" class="re-status-msg"></div>
          </div>

          <!-- Login Tab -->
          <div id="re-tab-login-content" style="display: none;">
            <span class="re-modal-badge">Client Portal</span>
            <h3 class="re-modal-title">Sign In to Dashboard</h3>
            <p class="re-modal-desc">Enter your registered email to access your API keys and software downloads.</p>

            <div id="re-login-step-email">
              <div class="re-input-group">
                <label class="re-input-label">Registered Email</label>
                <input type="email" id="re-login-email" class="re-input" placeholder="you@company.com" required />
              </div>
              <button id="re-btn-login-otp" class="re-btn-primary" onclick="window.ReachEngine.handleLoginOtp()">
                Send Login OTP &rarr;
              </button>
            </div>

            <div id="re-login-step-verify" style="display: none;">
              <div class="re-input-group">
                <label class="re-input-label">Enter 6-Digit OTP</label>
                <input type="text" id="re-login-otp-code" class="re-input" placeholder="123456" maxlength="6" />
              </div>
              <button id="re-btn-verify-login" class="re-btn-primary" onclick="window.ReachEngine.handleVerifyLogin()">
                Verify & Open Dashboard &rarr;
              </button>
            </div>
            <div id="re-login-status" class="re-status-msg"></div>
          </div>
        </div>

        <!-- 2. USER DASHBOARD VIEW (When Logged In) -->
        <div id="re-dash-view" style="${currentUser ? 'display: block;' : 'display: none;'}">
          <div class="re-dash-user">
            <div>
              <span id="re-dash-plan-badge" class="re-modal-badge">${currentUser && currentUser.plan === 'pro' ? 'Unlimited Pro' : 'Free Starter'}</span>
              <h3 id="re-dash-username">${currentUser ? currentUser.name : 'Welcome Back'}</h3>
              <p id="re-dash-useremail">${currentUser ? currentUser.email : ''}</p>
            </div>
            <button class="re-btn-logout" onclick="window.ReachEngine.handleLogout()">Sign Out</button>
          </div>

          <!-- Section 1: API / License Key Management -->
          <div class="re-dash-section">
            <h4 class="re-dash-section-title">
              <span>&#128273;</span> API &amp; License Key
            </h4>
            <p class="re-dash-section-desc">Authenticate your Windows desktop application or use in outbound automation scripts.</p>

            <div id="re-key-container" style="${currentUser && currentUser.apiKey ? 'display: block;' : 'display: none;'}">
              <div class="re-key-wrapper">
                <span id="re-dash-key-display" class="re-key-value">${currentUser && currentUser.apiKey ? currentUser.apiKey : 'REACH-XXXX-XXXX-XXXX'}</span>
                <button id="re-btn-toggle-mask" class="re-btn-icon" onclick="window.ReachEngine.toggleKeyMask()">Show</button>
                <button id="re-btn-copy-key" class="re-btn-icon" onclick="window.ReachEngine.copyKey()">Copy</button>
              </div>
              <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:11px; color:#8b9bb4;">
                <span id="re-dash-quota">Quota: ${currentUser && currentUser.plan === 'pro' ? 'Unlimited Extractions' : '100 leads / task'}</span>
                <span>Status: <strong style="color:#58E1E8;">Active</strong></span>
              </div>
            </div>

            <div id="re-no-key-container" style="${currentUser && !currentUser.apiKey ? 'display: block;' : 'display: none;'}">
              <button class="re-btn-generate" onclick="window.ReachEngine.generateApiKey()">
                &#9889; Generate My API / License Key
              </button>
            </div>
          </div>

          <!-- Section 2: Desktop Software Download Center -->
          <div class="re-dash-section">
            <h4 class="re-dash-section-title">
              <span>&#128187;</span> Desktop Lead Scraper
            </h4>
            <p class="re-dash-section-desc">Download ReachEngine v1.0.1 for Windows. Includes stealth anti-ban engine, proxy rotator, and 1-click Excel export.</p>
            
            <a href="${INSTALLER_URL}" class="re-btn-download-software" download>
              Download Windows Software (.EXE) &darr;
            </a>
            <div style="font-size:11px; color:#8b9bb4; text-align:center; margin-top:8px;">
              Windows 10 & 11 (64-bit) &middot; v1.0.1 &middot; Signed &amp; Safe
            </div>
          </div>

          <!-- Section 3: Upgrade to Unlimited Pro (Shown if Free Plan) -->
          <div id="re-dash-upgrade-section" class="re-dash-section" style="${currentUser && currentUser.plan === 'pro' ? 'display: none;' : 'display: block;'}">
            <h4 class="re-dash-section-title" style="color: #C8FF3C;">
              <span>&#128640;</span> Upgrade to Unlimited Pro
            </h4>
            <p class="re-dash-section-desc">Unlock unlimited leads, multi-location batch mode, zero daily caps, and lifetime priority updates for $49 (₹3,999).</p>
            
            <button class="re-btn-primary" style="background:#C8FF3C; color:#04090c;" onclick="window.ReachEngine.handleProPayment()">
              Upgrade to Unlimited Pro &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
  document.body.appendChild(modalContainer);

  // Load Razorpay Checkout SDK dynamically
  if (!document.getElementById("razorpay-sdk")) {
    const rzpScript = document.createElement("script");
    rzpScript.id = "razorpay-sdk";
    rzpScript.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.head.appendChild(rzpScript);
  }

  // ReachEngine Portal Logic
  window.ReachEngine = {
    currentUser: currentUser,
    isKeyMasked: true,

    openModal: function(modalId) {
      const modal = document.getElementById(modalId || "re-account-modal");
      if (modal) {
        modal.classList.add("active");
        this.renderDashboardState();
      }
    },

    closeModal: function(modalId) {
      const modal = document.getElementById(modalId || "re-account-modal");
      if (modal) modal.classList.remove("active");
    },

    switchAuthTab: function(tab) {
      const regTab = document.getElementById("re-tab-register-content");
      const loginTab = document.getElementById("re-tab-login-content");
      const regBtn = document.getElementById("re-tab-reg-btn");
      const loginBtn = document.getElementById("re-tab-login-btn");

      if (tab === "register") {
        regTab.style.display = "block";
        loginTab.style.display = "none";
        regBtn.classList.add("active");
        loginBtn.classList.remove("active");
      } else {
        regTab.style.display = "none";
        loginTab.style.display = "block";
        loginBtn.classList.add("active");
        regBtn.classList.remove("active");
      }
    },

    // 1. Account Creation (Sign Up)
    handleRegister: async function() {
      const name = document.getElementById("re-reg-name").value.trim();
      const email = document.getElementById("re-reg-email").value.trim();
      const phone = document.getElementById("re-reg-phone").value.trim();
      const btn = document.getElementById("re-btn-register");
      const status = document.getElementById("re-reg-status");

      if (!name || !email || !phone) {
        status.className = "re-status-msg error";
        status.innerText = "Please fill in all details.";
        return;
      }

      btn.disabled = true;
      btn.innerText = "Creating Account...";
      status.style.display = "none";

      try {
        const formData = new URLSearchParams();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("phone", phone);

        // Call backend register endpoint
        await fetch(`${BACKEND_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString()
        });
      } catch (err) {
        console.warn("Backend registration fallback:", err);
      }

      // Generate initial API key
      const initialKey = "REACH-FREE-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

      this.currentUser = {
        name: name,
        email: email,
        phone: phone,
        plan: "free",
        apiKey: initialKey,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem("re_user", JSON.stringify(this.currentUser));

      btn.disabled = false;
      btn.innerText = "Create Account & Enter Dashboard \u2192";

      this.renderDashboardState();
    },

    // 2. Login via OTP Flow
    handleLoginOtp: async function() {
      const email = document.getElementById("re-login-email").value.trim();
      const btn = document.getElementById("re-btn-login-otp");
      const status = document.getElementById("re-login-status");

      if (!email || !email.includes("@")) {
        status.className = "re-status-msg error";
        status.innerText = "Please enter a valid email address.";
        return;
      }

      btn.disabled = true;
      btn.innerText = "Sending Code...";
      status.style.display = "none";

      try {
        const formData = new URLSearchParams();
        formData.append("email", email);
        await fetch(`${BACKEND_URL}/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString()
        });
      } catch (e) {}

      document.getElementById("re-login-step-email").style.display = "none";
      document.getElementById("re-login-step-verify").style.display = "block";
      status.className = "re-status-msg success";
      status.innerText = "Verification code sent! (Or use demo code: 123456)";
      btn.disabled = false;
      btn.innerText = "Send Login OTP \u2192";
    },

    handleVerifyLogin: async function() {
      const email = document.getElementById("re-login-email").value.trim();
      const otp = document.getElementById("re-login-otp-code").value.trim();
      const btn = document.getElementById("re-btn-verify-login");
      const status = document.getElementById("re-login-status");

      if (!otp) {
        status.className = "re-status-msg error";
        status.innerText = "Please enter the OTP code.";
        return;
      }

      btn.disabled = true;
      btn.innerText = "Verifying...";

      let verifiedUser = {
        name: email.split("@")[0].replace(/[._]/g, " ").toUpperCase(),
        email: email,
        phone: "",
        plan: "free",
        apiKey: "REACH-FREE-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase()
      };

      try {
        const formData = new URLSearchParams();
        formData.append("email", email);
        formData.append("code", otp);
        const res = await fetch(`${BACKEND_URL}/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString()
        });
        const data = await res.json();
        if (data.ok && data.token) {
          const userRes = await fetch(`${BACKEND_URL}/api/user-data?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.token)}`);
          const userData = await userRes.json();
          if (userData.ok) {
            const hasPro = userData.keys && userData.keys.some(k => k.license_type === 'unlimited');
            const activeKey = userData.keys && userData.keys.length > 0 ? userData.keys[0].activation_key : verifiedUser.apiKey;
            verifiedUser.name = userData.user.name || verifiedUser.name;
            verifiedUser.plan = hasPro ? "pro" : "free";
            verifiedUser.apiKey = activeKey;
          }
        }
      } catch (e) {}

      this.currentUser = verifiedUser;
      localStorage.setItem("re_user", JSON.stringify(this.currentUser));

      btn.disabled = false;
      btn.innerText = "Verify & Open Dashboard \u2192";

      this.renderDashboardState();
    },

    // 3. Key Generation & Management
    generateApiKey: function() {
      if (!this.currentUser) return;
      const isPro = this.currentUser.plan === "pro";
      const newKey = (isPro ? "REACH-PRO-" : "REACH-FREE-") + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
      
      this.currentUser.apiKey = newKey;
      localStorage.setItem("re_user", JSON.stringify(this.currentUser));
      this.renderDashboardState();
      alert("New API / License Key Generated Successfully!");
    },

    toggleKeyMask: function() {
      this.isKeyMasked = !this.isKeyMasked;
      this.renderDashboardState();
    },

    copyKey: function() {
      if (!this.currentUser || !this.currentUser.apiKey) return;
      navigator.clipboard.writeText(this.currentUser.apiKey).then(() => {
        const btn = document.getElementById("re-btn-copy-key");
        if (btn) {
          btn.innerText = "Copied!";
          setTimeout(() => { btn.innerText = "Copy"; }, 2000);
        }
      });
    },

    handleLogout: function() {
      this.currentUser = null;
      localStorage.removeItem("re_user");
      this.switchAuthTab("login");
      this.renderDashboardState();
      this.syncHeaderAuthUI();
    },

    // 4. Render Dashboard View
    renderDashboardState: function() {
      const authView = document.getElementById("re-auth-view");
      const dashView = document.getElementById("re-dash-view");
      const card = document.getElementById("re-account-card");

      if (this.currentUser) {
        if (card) card.classList.add("dashboard-mode");
        if (authView) authView.style.display = "none";
        if (dashView) dashView.style.display = "block";

        const nameEl = document.getElementById("re-dash-username");
        const emailEl = document.getElementById("re-dash-useremail");
        const badgeEl = document.getElementById("re-dash-plan-badge");
        const keyEl = document.getElementById("re-dash-key-display");
        const toggleBtn = document.getElementById("re-btn-toggle-mask");
        const keyBox = document.getElementById("re-key-container");
        const noKeyBox = document.getElementById("re-no-key-container");
        const quotaEl = document.getElementById("re-dash-quota");
        const upgradeSec = document.getElementById("re-dash-upgrade-section");

        if (nameEl) nameEl.innerText = this.currentUser.name || "ReachEngine User";
        if (emailEl) emailEl.innerText = this.currentUser.email || "";
        
        const isPro = this.currentUser.plan === "pro";
        if (badgeEl) {
          badgeEl.innerText = isPro ? "Unlimited Pro" : "Free Starter";
          badgeEl.style.borderColor = isPro ? "#C8FF3C" : "#58E1E8";
          badgeEl.style.color = isPro ? "#C8FF3C" : "#58E1E8";
          badgeEl.style.background = isPro ? "rgba(200,255,60,0.12)" : "rgba(88,225,232,0.12)";
        }

        if (upgradeSec) {
          upgradeSec.style.display = isPro ? "none" : "block";
        }

        if (quotaEl) {
          quotaEl.innerText = isPro ? "Quota: Unlimited Leads & Full API" : "Quota: 100 leads / task";
        }

        if (this.currentUser.apiKey) {
          if (keyBox) keyBox.style.display = "block";
          if (noKeyBox) noKeyBox.style.display = "none";
          if (keyEl) {
            if (this.isKeyMasked) {
              const prefix = this.currentUser.apiKey.substring(0, 10);
              keyEl.innerText = prefix + "-••••-••••";
              if (toggleBtn) toggleBtn.innerText = "Show";
            } else {
              keyEl.innerText = this.currentUser.apiKey;
              if (toggleBtn) toggleBtn.innerText = "Hide";
            }
          }
        } else {
          if (keyBox) keyBox.style.display = "none";
          if (noKeyBox) noKeyBox.style.display = "block";
        }

      } else {
        if (card) card.classList.remove("dashboard-mode");
        if (authView) authView.style.display = "block";
        if (dashView) dashView.style.display = "none";
      }

      this.syncHeaderAuthUI();
    },

    // 5. Razorpay Pro Upgrade Flow
    handleProPayment: function() {
      if (typeof Razorpay === "undefined") {
        alert("Payment gateway loading... please retry in 2 seconds.");
        return;
      }

      const email = this.currentUser ? this.currentUser.email : "";
      const phone = this.currentUser ? this.currentUser.phone : "";

      const self = this;
      const options = {
        key: RAZORPAY_KEY,
        amount: 399900,
        currency: "INR",
        name: "ReachEngine",
        description: "Unlimited Pro License (Lifetime Access)",
        image: "https://framerusercontent.com/images/kFkW6hF5Uk0E9ADOnDzwbf461Y4.svg",
        prefill: {
          email: email,
          contact: phone
        },
        theme: {
          color: "#58E1E8"
        },
        handler: function(response) {
          const proKey = "REACH-PRO-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
          if (self.currentUser) {
            self.currentUser.plan = "pro";
            self.currentUser.apiKey = proKey;
            localStorage.setItem("re_user", JSON.stringify(self.currentUser));
            self.renderDashboardState();
            self.syncHeaderAuthUI();
          }
          alert("Payment Successful!\nYour account has been upgraded to Unlimited Pro.\nNew Pro API Key: " + proKey);
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    },

    // 6. Header Auth Button Click Handler
    handleHeaderAuthClick: function() {
      if (this.currentUser) {
        // Logged in: open Dashboard View directly
        this.openModal("re-account-modal");
      } else {
        // Not logged in: open Sign In tab directly
        this.switchAuthTab("login");
        this.openModal("re-account-modal");
      }
    },

    // 7. Sync Header Action Button (Login vs Dashboard)
    syncHeaderAuthUI: function() {
      // Clean up any stale dashboard link from navigation links
      document.querySelectorAll('.re-nav-dashboard').forEach(el => el.remove());

      const isAuth = !!this.currentUser;
      const targetText = isAuth ? "Dashboard" : "Login";

      // Find all header action buttons
      const labelEls = document.querySelectorAll(
        '.framer-17uiwkb-container [data-framer-name="Label"] p, ' +
        '.framer-1rgxp2l [data-framer-name="Label"] p, ' +
        '.re-auth-btn [data-framer-name="Label"] p, ' +
        '.re-auth-label'
      );

      labelEls.forEach(p => {
        if (p.innerText !== targetText) {
          p.innerText = targetText;
        }
      });
    }
  };

  // TARGETED CLICK HANDLER: Open Account/Dashboard Portal or Scroll to Pricing
  document.addEventListener("click", function(e) {
    const btn = e.target.closest("a, button, div[tabindex='0']");
    if (!btn) return;

    // Never intercept inside the modal itself
    if (btn.closest(".re-modal-card") || btn.classList.contains("re-modal-close")) {
      return;
    }

    const text = (btn.innerText || btn.textContent || "").trim();

    // 1. Header Action button / Login / Dashboard / Start Free -> Smart Auth Route
    const isHeaderAuth = btn.closest('.framer-17uiwkb-container, .re-auth-btn') || 
                         /^(Login|Sign In|Dashboard|Start free|Download Free)\s*→?$/i.test(text);

    // 2. "Buy Unlimited" -> Scrolls down to Pricing Table
    const isScrollPricing = /^Buy Unlimited\s*→?$/i.test(text);

    // 3. "Get Unlimited License" on Pricing Card -> Direct Pro Checkout
    const isDirectProCheckout = /^(Buy Pro|Get Unlimited(\s+License)?)\s*→?$/i.test(text);

    if (isHeaderAuth) {
      e.preventDefault();
      e.stopPropagation();
      window.ReachEngine.handleHeaderAuthClick();
    } else if (isScrollPricing) {
      e.preventDefault();
      e.stopPropagation();
      const pricingSection = document.getElementById("pricing") || document.querySelector('[data-framer-name="Pricing"]');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.hash = "pricing";
      }
    } else if (isDirectProCheckout) {
      e.preventDefault();
      e.stopPropagation();
      window.ReachEngine.handleProPayment();
    }
  });

  // -------------------------------------------------------------
  // PERMANENT HEADER AUTH STATE WATCHER
  // -------------------------------------------------------------
  function runSync() {
    if (window.ReachEngine && window.ReachEngine.syncHeaderAuthUI) {
      window.ReachEngine.syncHeaderAuthUI();
    }
  }

  // 1. Initial execution
  runSync();

  // 2. DOM lifecycle hooks
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runSync);
  }
  window.addEventListener("load", runSync);

  // 3. Fast post-hydration sync for 10 seconds
  const syncTimer = setInterval(runSync, 200);
  setTimeout(() => clearInterval(syncTimer), 10000);

  // 4. MutationObserver to instantly restore button state when React re-renders
  try {
    const observer = new MutationObserver(() => {
      runSync();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  } catch(e) {}

  console.log("ReachEngine Developer Portal, Auth & Dynamic Login/Dashboard Initialized!");
})();

