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

  function hideBanner() {
    var el = document.getElementById('cookie-banner');
    if (el) el.classList.add('hidden');
  }

  function showBanner() {
    var el = document.getElementById('cookie-banner');
    if (el) el.classList.remove('hidden');
  }

  function init() {
    // Cookie banner is temporarily disabled.
    // To re-enable consent flow, uncomment the block below:
    // var consent = getConsent();
    // if (consent === 'granted') {
    //   loadAnalytics();
    // } else if (consent === null) {
    //   showBanner();
    // }
  }

  // ─── Public API ────────────────────────────────────────────────────────────
  window.WS = {
    acceptCookies: function () {
      setConsent('granted');
      hideBanner();
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
