/**
 * ReachEngine Client-Side Authentication, Dashboard & Checkout System
 */
(function() {
  // Dynamic Backend & API Configuration
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const BACKEND_URL = isLocal ? "http://localhost:8765" : "https://app.bizscraper.in";
  const RAZORPAY_KEY = "rzp_live_Spab2HR8rHLYPe";
  const INSTALLER_URL = `${BACKEND_URL}/setup/GMap_Scraper_v1.0.1.exe`;

  // Check existing session
  let currentUser = null;
  try {
    const saved = localStorage.getItem("re_user");
    if (saved) currentUser = JSON.parse(saved);
  } catch(e) {}

  // Create Modal HTML Elements (Empty - Redirecting to Master App)
  const modalContainer = document.createElement("div");
  modalContainer.id = "re-modal-placeholder";
  modalContainer.innerHTML = "";

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
      window.location.href = `${BACKEND_URL}/dashboard`;
    },

    closeModal: function(modalId) {
      const modal = document.getElementById(modalId || "re-account-modal");
      if (modal) modal.classList.remove("active");
      this.pendingPayment = false;
      const notice = document.getElementById("re-auth-payment-notice");
      if (notice) notice.style.display = "none";
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

      if (this.pendingPayment) {
        this.pendingPayment = false;
        const notice = document.getElementById("re-auth-payment-notice");
        if (notice) notice.style.display = "none";
        this.closeModal("re-account-modal");
        setTimeout(() => {
          this.handleProPayment();
        }, 350);
      }
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

      if (this.pendingPayment) {
        this.pendingPayment = false;
        const notice = document.getElementById("re-auth-payment-notice");
        if (notice) notice.style.display = "none";
        this.closeModal("re-account-modal");
        setTimeout(() => {
          this.handleProPayment();
        }, 350);
      }
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
      // Check if user is logged in before allowing payment!
      if (!this.currentUser) {
        this.pendingPayment = true;
        this.switchAuthTab("login");
        this.openModal("re-account-modal");

        const notice = document.getElementById("re-auth-payment-notice");
        if (notice) notice.style.display = "block";
        return;
      }

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
      window.location.href = `${BACKEND_URL}/dashboard`;
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

      // Neutralize any navigation href on header/auth buttons
      document.querySelectorAll(
        '.framer-17uiwkb-container a, ' +
        '.framer-q1184d-container a, ' +
        '.framer-1kr6syq-container a, ' +
        '.framer-a178m2-container a, ' +
        '.re-auth-btn, ' +
        '[data-re-auth="true"]'
      ).forEach(a => {
        if (a.getAttribute('href') !== 'javascript:void(0);') {
          a.setAttribute('href', 'javascript:void(0);');
        }
      });
    }
  };

  // TARGETED CLICK HANDLER (CAPTURE PHASE): Intercept clicks before Framer router or browser navigates
  document.addEventListener("click", function(e) {
    const target = e.target;
    if (!target) return;

    // Never intercept inside the modal itself
    if (target.closest(".re-modal-card") || target.classList.contains("re-modal-close")) {
      return;
    }

    const btn = target.closest("a, button, div[tabindex='0'], [data-framer-name='Primary'], [data-framer-name='Outline']");
    if (!btn) return;

    // Check containers
    const isHeaderContainer = btn.closest('.framer-17uiwkb-container, .framer-q1184d-container, .re-auth-btn');
    const isStarterCard = btn.closest('.framer-1kr6syq-container');
    const isBottomStart = btn.closest('.framer-a178m2-container');
    const isProCard = btn.closest('.framer-wgq8c2-container, .framer-14hws8g-container');

    const text = (btn.innerText || btn.textContent || "").trim();

    // 1. Download / Start Free triggers: Direct .exe download
    const isDownloadTrigger = isStarterCard ||
                              isBottomStart ||
                              /^(Start free|Start Free|Download Free|Download|Install)(\s*→)?$/i.test(text) ||
                              text.toLowerCase().includes("download") ||
                              text.toLowerCase().startsWith("start free");

    // 2. Auth / Login triggers: Header button, "Login", "Sign In", "Dashboard"
    const isAuthTrigger = isHeaderContainer ||
                          btn.hasAttribute('data-re-auth') ||
                          /^(Login|Sign In|Dashboard)(\s*→)?$/i.test(text) ||
                          text.toLowerCase().startsWith("login") ||
                          text.toLowerCase().startsWith("sign in") ||
                          text.toLowerCase().startsWith("dashboard");

    // 3. Pro checkout triggers: "Get Unlimited License", "Buy Pro"
    const isProTrigger = isProCard ||
                         btn.hasAttribute('data-re-buy') ||
                         /^(Buy Pro|Get Unlimited(\s+License)?)(\s*→)?$/i.test(text) ||
                         text.toLowerCase().includes("unlimited license");

    // 4. Scroll to pricing
    const isScrollPricing = /^Buy Unlimited\s*→?$/i.test(text);

    if (isDownloadTrigger) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.href = INSTALLER_URL;
      return false;
    }

    if (isAuthTrigger) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      // Redirect to Master App User Dashboard
      window.location.href = `${BACKEND_URL}/dashboard`;
      return false;
    }

    if (isProTrigger) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.ReachEngine.handleProPayment();
      return false;
    }

    if (isScrollPricing) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const pricingSection = document.getElementById("pricing") || document.querySelector('[data-framer-name="Pricing"]');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.hash = "pricing";
      }
      return false;
    }
  }, true); // <-- CAPTURE PHASE! Runs BEFORE Framer router or native navigation

  // Dynamic Plans Loader from CMS API
  async function loadDynamicPricingPlans() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/plans`);
      const data = await res.json();
      if (data && data.status === "success" && data.plans && data.plans.length > 0) {
        window.ReachEnginePlans = data.plans;
        // Dynamically update Pro plan price display if element exists
        const proPlan = data.plans.find(p => p.tier === "pro" || p.plan_id.includes("pro")) || data.plans[data.plans.length - 1];
        if (proPlan) {
          const proPriceEls = document.querySelectorAll('.framer-wgq8c2-container .framer-price, .framer-14hws8g-container .framer-price');
          proPriceEls.forEach(el => {
            el.innerText = `₹${proPlan.price.toLocaleString("en-IN")}`;
          });
        }
      }
    } catch(err) {
      console.warn("Using offline fallback pricing plans:", err);
    }
  }

  // Initial check on load and post-hydration passes
  function scheduleSync() {
    if (window.ReachEngine) window.ReachEngine.syncHeaderAuthUI();
    loadDynamicPricingPlans();
    [100, 300, 600, 1200, 2500].forEach(delay => {
      setTimeout(() => {
        if (window.ReachEngine) window.ReachEngine.syncHeaderAuthUI();
      }, delay);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleSync);
  } else {
    scheduleSync();
  }
  window.addEventListener("load", scheduleSync);

  console.log("BizScraper Developer Portal, Auth & Dynamic CMS Plans Initialized!");
})();

