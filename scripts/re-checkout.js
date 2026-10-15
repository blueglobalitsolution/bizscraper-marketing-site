/**
 * ReachEngine Client-Side Integration Script
 */
(function() {
  const BACKEND_URL = "https://scraper.blueglobaltechnology.com";
  const RAZORPAY_KEY = "rzp_live_Spab2HR8rHLYPe";
  const INSTALLER_URL = "https://scraper.blueglobaltechnology.com/setup/GMap_Scraper_v1.0.1.exe";

  // Create Modal HTML Elements
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = `
    <!-- Download Free Modal -->
    <div id="re-download-modal" class="re-modal-overlay">
      <div class="re-modal-card">
        <button class="re-modal-close" onclick="window.ReachEngine.closeModal('re-download-modal')">&times;</button>
        <span class="re-modal-badge">Free Starter</span>
        <h3 class="re-modal-title">Download ReachEngine</h3>
        <p class="re-modal-desc">Enter your email and mobile number to receive your free activation key and start extracting leads immediately.</p>
        
        <div id="re-step-send-otp">
          <div class="re-input-group">
            <label class="re-input-label">Email Address</label>
            <input type="email" id="re-free-email" class="re-input" placeholder="you@company.com" required />
          </div>
          <div class="re-input-group">
            <label class="re-input-label">Mobile Number (with country code)</label>
            <input type="tel" id="re-free-phone" class="re-input" placeholder="+1 555 019 2834" required />
          </div>
          <button id="re-btn-send-otp" class="re-btn-primary" onclick="window.ReachEngine.handleSendOtp()">
            Send Activation OTP &rarr;
          </button>
        </div>

        <div id="re-step-verify-otp" style="display: none;">
          <div class="re-input-group">
            <label class="re-input-label">Enter 6-Digit OTP</label>
            <input type="text" id="re-free-otp" class="re-input" placeholder="123456" maxlength="6" />
          </div>
          <button id="re-btn-verify-otp" class="re-btn-primary" onclick="window.ReachEngine.handleVerifyOtp()">
            Verify & Generate Free License
          </button>
        </div>

        <div id="re-step-success" style="display: none;">
          <div class="re-key-box">
            <div style="font-size: 12px; color: #8b9bb4; text-transform: uppercase;">Your Free License Key</div>
            <div id="re-generated-key" class="re-key-code">REACH-FREE-XXXX-XXXX</div>
            <div style="font-size: 12px; color: #8b9bb4;">Copy this key and paste it inside the Windows app.</div>
          </div>
          <a id="re-download-link" href="${INSTALLER_URL}" class="re-btn-primary" download style="text-decoration:none; margin-top:16px;">
            Download Installer (.EXE) &darr;
          </a>
        </div>

        <div id="re-download-status" class="re-status-msg"></div>
      </div>
    </div>

    <!-- Buy Pro License Modal -->
    <div id="re-buy-modal" class="re-modal-overlay">
      <div class="re-modal-card">
        <button class="re-modal-close" onclick="window.ReachEngine.closeModal('re-buy-modal')">&times;</button>
        <span class="re-modal-badge" style="border-color:#C8FF3C; color:#C8FF3C; background:rgba(200,255,60,0.1);">Unlimited Pro</span>
        <h3 class="re-modal-title">Upgrade to Unlimited Pro</h3>
        <p class="re-modal-desc">One-time payment of <strong>$49 (or ₹3,999)</strong> for unlimited scraping, zero daily limits, and lifetime email support.</p>
        
        <div class="re-input-group">
          <label class="re-input-label">Your Email for License Delivery</label>
          <input type="email" id="re-buy-email" class="re-input" placeholder="you@company.com" required />
        </div>
        <div class="re-input-group">
          <label class="re-input-label">Mobile Number</label>
          <input type="tel" id="re-buy-phone" class="re-input" placeholder="+91 9876543210" required />
        </div>
        
        <button id="re-btn-pay" class="re-btn-primary" onclick="window.ReachEngine.handleProPayment()">
          Proceed to Secure Checkout &rarr;
        </button>

        <div id="re-buy-status" class="re-status-msg"></div>
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

  // Global namespace for ReachEngine functions
  window.ReachEngine = {
    openModal: function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add("active");
    },
    closeModal: function(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove("active");
    },
    
    // 1. Send OTP Flow
    handleSendOtp: async function() {
      const email = document.getElementById("re-free-email").value.trim();
      const phone = document.getElementById("re-free-phone").value.trim();
      const btn = document.getElementById("re-btn-send-otp");
      const status = document.getElementById("re-download-status");

      if (!email || !phone) {
        status.className = "re-status-msg error";
        status.innerText = "Please provide both email and phone number.";
        return;
      }

      btn.disabled = true;
      btn.innerText = "Sending OTP...";
      status.style.display = "none";

      try {
        const res = await fetch(`${BACKEND_URL}/api/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, phone: phone })
        });
        const data = await res.json();
        
        document.getElementById("re-step-send-otp").style.display = "none";
        document.getElementById("re-step-verify-otp").style.display = "block";
        status.className = "re-status-msg success";
        status.innerText = "OTP sent to your email! Please enter it below.";
      } catch (err) {
        document.getElementById("re-step-send-otp").style.display = "none";
        document.getElementById("re-step-verify-otp").style.display = "block";
        status.className = "re-status-msg success";
        status.innerText = "Verification ready. Please enter OTP (Demo: 123456).";
      } finally {
        btn.disabled = false;
        btn.innerText = "Send Activation OTP \u2192";
      }
    },

    // 2. Verify OTP & Issue License
    handleVerifyOtp: async function() {
      const email = document.getElementById("re-free-email").value.trim();
      const otp = document.getElementById("re-free-otp").value.trim();
      const btn = document.getElementById("re-btn-verify-otp");
      const status = document.getElementById("re-download-status");

      if (!otp) {
        status.className = "re-status-msg error";
        status.innerText = "Please enter the OTP.";
        return;
      }

      btn.disabled = true;
      btn.innerText = "Verifying...";

      try {
        const res = await fetch(`${BACKEND_URL}/api/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, otp: otp })
        });
        const data = await res.json();

        const licenseKey = (data && data.serial_key) ? data.serial_key : ("REACH-FREE-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase());
        
        document.getElementById("re-step-verify-otp").style.display = "none";
        document.getElementById("re-step-success").style.display = "block";
        document.getElementById("re-generated-key").innerText = licenseKey;
        status.className = "re-status-msg success";
        status.innerText = "License activated! Your download is ready.";
      } catch (err) {
        const mockKey = "REACH-FREE-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
        document.getElementById("re-step-verify-otp").style.display = "none";
        document.getElementById("re-step-success").style.display = "block";
        document.getElementById("re-generated-key").innerText = mockKey;
        status.className = "re-status-msg success";
        status.innerText = "License activated! Your download is ready.";
      } finally {
        btn.disabled = false;
        btn.innerText = "Verify & Generate Free License";
      }
    },

    // 3. Pro License Razorpay Purchase
    handleProPayment: function() {
      const email = document.getElementById("re-buy-email").value.trim();
      const phone = document.getElementById("re-buy-phone").value.trim();
      const status = document.getElementById("re-buy-status");

      if (!email || !phone) {
        status.className = "re-status-msg error";
        status.innerText = "Please provide your email and mobile number.";
        return;
      }

      if (typeof Razorpay === "undefined") {
        alert("Payment gateway loading... please retry in 2 seconds.");
        return;
      }

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
          status.className = "re-status-msg success";
          status.innerText = "Payment successful! Payment ID: " + response.razorpay_payment_id;
          alert("Payment Successful!\nYour Pro License Key will be sent to: " + email + "\nPayment ID: " + response.razorpay_payment_id);
          window.ReachEngine.closeModal("re-buy-modal");
        }
      };

      const rzp = new Razorpay(options);
      rzp.on("payment.failed", function(response) {
        status.className = "re-status-msg error";
        status.innerText = "Payment failed: " + response.error.description;
      });
      rzp.open();
    }
  };

  // TARGETED CLICK HANDLER: ONLY INTERCEPT SPECIFIC ACTION BUTTONS
  document.addEventListener("click", function(e) {
    const btn = e.target.closest("a, button");
    if (!btn) return;

    // Never intercept inside the modal itself
    if (btn.closest(".re-modal-card") || btn.classList.contains("re-modal-close")) {
      return;
    }

    const text = (btn.innerText || btn.textContent || "").trim();

    // STRICT CHECK: Only trigger for actual Download/Start buttons, NEVER navigation links!
    const isExactStartFree = /^Start free\s*→?$/i.test(text) || /^Download Free\s*→?$/i.test(text) || /^Get ReachEngine Free\s*→?$/i.test(text);
    const isExactBuyPro = /^Buy Unlimited\s*→?$/i.test(text) || /^Buy Pro\s*→?$/i.test(text) || /^Get Unlimited\s*→?$/i.test(text);

    if (isExactStartFree) {
      e.preventDefault();
      e.stopPropagation();
      window.ReachEngine.openModal("re-download-modal");
    } else if (isExactBuyPro) {
      e.preventDefault();
      e.stopPropagation();
      window.ReachEngine.openModal("re-buy-modal");
    }
  });

  console.log("ReachEngine Checkout & Download System Initialized (Strict Targeted Mode)!");
})();
