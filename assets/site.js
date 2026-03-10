/* ─── WhenSpace cookie consent & analytics loader ──────────────────────────
   Consent is stored in localStorage under the key 'ws_cookie_consent'.
   Possible values: 'granted' | 'denied' | null (not yet decided)
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var CONSENT_KEY = 'ws_cookie_consent';

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  function loadAnalytics() {
    // Guard against double-loading
    if (document.querySelector('script[src*="simpleanalyticscdn"]')) return;
    var s = document.createElement('script');
    s.defer = true;
    s.src = 'https://scripts.simpleanalyticscdn.com/latest.js';
    document.head.appendChild(s);
  }

  function hideBanner() {
    var el = document.getElementById('cookie-banner');
    if (el) el.classList.add('hidden');
  }

  function showBanner() {
    var el = document.getElementById('cookie-banner');
    if (el) el.classList.remove('hidden');
  }

  function init() {
    var consent = getConsent();
    if (consent === 'granted') {
      loadAnalytics();
    } else if (consent === null) {
      // No decision yet — show the banner
      showBanner();
    }
    // 'denied' → do nothing, banner stays hidden
  }

  // ─── Public API ────────────────────────────────────────────────────────────
  window.WS = {
    acceptCookies: function () {
      setConsent('granted');
      hideBanner();
      loadAnalytics();
    },
    declineCookies: function () {
      setConsent('denied');
      hideBanner();
    },
    // Call this to let the user change their mind (e.g. from the Cookie Policy page)
    resetCookieConsent: function () {
      try { localStorage.removeItem(CONSENT_KEY); } catch (e) {}
      location.reload();
    },
    getConsent: getConsent
  };

  // Run as soon as the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
