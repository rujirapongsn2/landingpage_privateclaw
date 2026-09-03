/* ============================================================
   Softnix PrivateClaw — Landing page interactions
   ============================================================ */

(function () {
  "use strict";

  /* ---------------- Language ---------------- */
  var STORAGE_KEY = "privateclaw-lang";

  function detectLang() {
    var param = new URLSearchParams(window.location.search).get("lang");
    if (param === "th" || param === "en") return param;
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "th" || saved === "en") return saved;
    } catch (e) { /* storage unavailable */ }
    var nav = (navigator.language || "").toLowerCase();
    return nav.indexOf("th") === 0 ? "th" : "en";
  }

  function applyLang(lang) {
    var dict = I18N[lang] || I18N.th;
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        el.innerHTML = dict[key];
      }
    });

    document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });

    document.title = lang === "th"
      ? "Softnix PrivateClaw — แพลตฟอร์ม AI Workforce สำหรับองค์กร · 100% On-Premise"
      : "Softnix PrivateClaw — The AI Workforce Platform for Enterprise · 100% On-Premise";

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }

    document.dispatchEvent(new CustomEvent("privateclaw:langchange", { detail: { lang: lang } }));
  }

  document.querySelectorAll(".lang-switch__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-lang"));
    });
  });

  applyLang(detectLang());

  /* ---------------- Nav: scroll state + mobile menu ---------------- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("navBurger");
  var navLinks = document.getElementById("navLinks");

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", function () {
    navLinks.classList.toggle("is-open");
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("is-open");
    });
  });

  /* ---------------- Tabs (Governance) ---------------- */
  var tabsRoot = document.getElementById("govTabs");
  if (tabsRoot) {
    var tabBtns = tabsRoot.querySelectorAll(".tabs__btn");
    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-tab");
        tabBtns.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        tabsRoot.querySelectorAll(".tabs__panel").forEach(function (panel) {
          panel.classList.toggle("is-active", panel.getAttribute("data-panel") === target);
        });
      });
    });
  }

  /* ---------------- Lightbox ---------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");

  document.querySelectorAll("[data-lightbox]").forEach(function (img) {
    img.addEventListener("click", function () {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
  });

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------- Hero: Download Datasheet (lead-gated, per language) ---------------- */
  var DATASHEET_URL = {
    th: "assets/Softnix_PrivateClaw_Datasheet_TH.pdf",
    en: "assets/Softnix_PrivateClaw_Datasheet_EN.pdf"
  };
  var heroDatasheetLink = document.getElementById("heroDatasheetLink");
  var currentLang = document.documentElement.getAttribute("lang") || "th";

  function syncDatasheetLink(lang) {
    if (!heroDatasheetLink) return;
    heroDatasheetLink.setAttribute("href", DATASHEET_URL[lang] || DATASHEET_URL.th);
  }

  /* ---------------- Contact: HubSpot form (per language) ---------------- */
  var HS_PORTAL = "7556917";
  var HS_REGION = "na1";
  var HS_FORM = { th: "61121b2b-8433-4dbd-9343-7bc6e531017f", en: "dbcf71de-b383-4c29-aef0-a5422700ea75" };
  var hsFormHost = document.getElementById("hubspotContactForm");
  var hsReady = null;
  var currentHsLang = null;

  function loadHubSpotScript() {
    if (window.hbspt && window.hbspt.forms) return Promise.resolve();
    if (hsReady) return hsReady;
    hsReady = new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src*="js.hsforms.net/forms/embed"]');
      if (existing) {
        if (window.hbspt && window.hbspt.forms) { resolve(); return; }
        existing.addEventListener("load", function () { resolve(); });
        existing.addEventListener("error", reject);
        return;
      }
      var s = document.createElement("script");
      s.charset = "utf-8";
      s.src = "https://js.hsforms.net/forms/embed/v2.js";
      s.onload = function () { resolve(); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return hsReady;
  }

  function renderHubSpotForm(lang) {
    if (!hsFormHost || currentHsLang === lang) return;
    currentHsLang = lang;
    hsFormHost.innerHTML = '<p class="cta__hs-form-loading">' +
      (lang === "th" ? "กำลังโหลดแบบฟอร์ม…" : "Loading form…") + "</p>";
    loadHubSpotScript().then(function () {
      hsFormHost.innerHTML = "";
      window.hbspt.forms.create({
        portalId: HS_PORTAL,
        formId: HS_FORM[lang] || HS_FORM.th,
        region: HS_REGION,
        target: "#hubspotContactForm"
      });
    }).catch(function () {
      hsFormHost.innerHTML = '<p class="cta__hs-form-error">' +
        (lang === "th"
          ? "โหลดแบบฟอร์มไม่สำเร็จ กรุณาลองใหม่ หรือติดต่อ sales@softnix.co.th"
          : "Failed to load the form. Please retry or contact sales@softnix.co.th") +
        "</p>";
    });
  }

  /* ---------------- Lead-gated datasheet download modal ---------------- */
  var dlModal, dlFormHost, dlCreatedForLang = null;

  function ensureDatasheetModal() {
    if (dlModal) return dlModal;
    dlModal = document.createElement("div");
    dlModal.className = "lead-dl-modal";
    dlModal.id = "datasheetModal";
    dlModal.setAttribute("role", "dialog");
    dlModal.setAttribute("aria-modal", "true");
    dlModal.setAttribute("aria-labelledby", "datasheetModalTitle");
    dlModal.innerHTML =
      '<div class="lead-dl-backdrop" data-dl-close="1"></div>' +
      '<div class="lead-dl-dialog">' +
      '  <button type="button" class="lead-dl-close" data-dl-close="1" aria-label="Close">' +
      '    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "  </button>" +
      '  <h2 class="lead-dl-title" id="datasheetModalTitle"></h2>' +
      '  <p class="lead-dl-sub" id="datasheetModalSub"></p>' +
      '  <div class="lead-dl-form" id="datasheetHsForm"></div>' +
      '  <p class="lead-dl-note" id="datasheetModalNote"></p>' +
      "</div>";
    document.body.appendChild(dlModal);
    dlFormHost = dlModal.querySelector("#datasheetHsForm");
    dlModal.addEventListener("click", function (e) {
      if (e.target && e.target.getAttribute("data-dl-close")) closeDatasheetModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && dlModal.classList.contains("open")) closeDatasheetModal();
    });
    return dlModal;
  }

  var DL_COPY = {
    th: { title: "ดาวน์โหลด Softnix PrivateClaw Datasheet", sub: "กรอกแบบฟอร์มสั้นๆ แล้วระบบจะเปิดไฟล์ Datasheet ให้ดาวน์โหลด", note: "ข้อมูลใช้เพื่อติดต่อกลับจาก Softnix เท่านั้น", loading: "กำลังโหลดแบบฟอร์ม…", error: "โหลดแบบฟอร์มไม่สำเร็จ กรุณาลองใหม่ หรือติดต่อ sales@softnix.co.th" },
    en: { title: "Download the Softnix PrivateClaw Datasheet", sub: "Fill in this short form and we'll open the datasheet for download.", note: "Your details are used only for Softnix follow-up.", loading: "Loading form…", error: "Failed to load the form. Please retry or contact sales@softnix.co.th" }
  };

  function openPdf(url) {
    var a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function showDatasheetForm(lang) {
    if (!dlFormHost) return;
    dlCreatedForLang = lang;
    var copy = DL_COPY[lang] || DL_COPY.th;
    dlFormHost.innerHTML = '<p class="cta__hs-form-loading">' + copy.loading + "</p>";
    loadHubSpotScript().then(function () {
      dlFormHost.innerHTML = "";
      window.hbspt.forms.create({
        portalId: HS_PORTAL,
        formId: HS_FORM[lang] || HS_FORM.th,
        region: HS_REGION,
        target: "#datasheetHsForm",
        onFormSubmitted: function () {
          openPdf(DATASHEET_URL[lang] || DATASHEET_URL.th);
          setTimeout(closeDatasheetModal, 600);
        }
      });
    }).catch(function () {
      dlFormHost.innerHTML = '<p class="cta__hs-form-error">' + copy.error + "</p>";
    });
  }

  function openDatasheetModal() {
    ensureDatasheetModal();
    var lang = currentLang;
    var copy = DL_COPY[lang] || DL_COPY.th;
    dlModal.querySelector("#datasheetModalTitle").textContent = copy.title;
    dlModal.querySelector("#datasheetModalSub").textContent = copy.sub;
    dlModal.querySelector("#datasheetModalNote").textContent = copy.note;
    dlModal.classList.add("open");
    document.body.style.overflow = "hidden";
    if (dlCreatedForLang !== lang) showDatasheetForm(lang);
  }

  function closeDatasheetModal() {
    if (!dlModal) return;
    dlModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (heroDatasheetLink) {
    heroDatasheetLink.addEventListener("click", function (e) {
      e.preventDefault();
      openDatasheetModal();
    });
  }

  document.addEventListener("privateclaw:langchange", function (e) {
    currentLang = e.detail.lang;
    syncDatasheetLink(currentLang);
    renderHubSpotForm(currentLang);
    dlCreatedForLang = null; // force re-render next time the modal opens in the new language
  });

  (function initialSync() {
    syncDatasheetLink(currentLang);
    renderHubSpotForm(currentLang);
  })();
})();
