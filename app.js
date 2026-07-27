/* 500kdiy fast page — vanilla reimplementation of the original React behavior */
(function () {
  'use strict';

  var SUPA_URL = 'https://slckagkpjfaxjnyamivz.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsY2thZ2twamZheGpueWFtaXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzMxNTgsImV4cCI6MjA5MTUwOTE1OH0.06KAYOQ92BaBUKDT71hUTe36fjiZRsoU29zMELsm4Rg';
  var TRACK_LEAD_URL = 'https://fnsrjoqkhrgrcuxqihix.supabase.co/functions/v1/track-lead';
  var CARDCOM_URL = 'https://secure.cardcom.solutions/EA/EA5/yhZ5e2N1nkmJaOA1WFoMQ/PaymentSP?Email=';
  var SMOOVE_LIST_ID = 1138385;

  var qs = new URLSearchParams(window.location.search);

  /* ---- first-touch attribution (same 'attribution' localStorage key) ---- */
  function saveAttribution() {
    try {
      if (localStorage.getItem('attribution')) return;
      if (qs.has('ref') || qs.has('utm_source') || qs.has('utm_medium') || qs.has('utm_campaign') || qs.has('utm_content')) {
        localStorage.setItem('attribution', JSON.stringify({
          ref: qs.get('ref') || '',
          utm_source: qs.get('utm_source') || '',
          utm_medium: qs.get('utm_medium') || '',
          utm_campaign: qs.get('utm_campaign') || '',
          utm_content: qs.get('utm_content') || ''
        }));
      }
    } catch (e) {}
  }
  function getAttribution() {
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem('attribution')); } catch (e) {}
    stored = stored || {};
    return {
      ref: qs.get('ref') || stored.ref || '',
      utm_source: qs.get('utm_source') || stored.utm_source || '',
      utm_medium: qs.get('utm_medium') || stored.utm_medium || '',
      utm_campaign: qs.get('utm_campaign') || stored.utm_campaign || '',
      utm_content: qs.get('utm_content') || stored.utm_content || ''
    };
  }
  saveAttribution();

  /* ---- Sticklight conversions dashboard (page_views table) ---- */
  function visitorId() {
    var v = localStorage.getItem('mominvest_visitor_id');
    if (!v) {
      v = 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('mominvest_visitor_id', v);
    }
    return v;
  }
  function supaInsert(table, row, keepalive) {
    return fetch(SUPA_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPA_KEY,
        Authorization: 'Bearer ' + SUPA_KEY,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(row),
      keepalive: !!keepalive
    }).catch(function () {});
  }
  function trackPageView() {
    supaInsert('page_views', {
      page_path: '/500kdiy',
      page_name: 'קורס 500k DIY',
      visitor_id: visitorId(),
      utm_source: qs.get('utm_source'),
      utm_medium: qs.get('utm_medium'),
      utm_campaign: qs.get('utm_campaign'),
      utm_content: qs.get('utm_content'),
      utm_term: qs.get('utm_term'),
      referrer: document.referrer || null
    });
  }
  function trackEvent(name, props) {
    supaInsert('page_views', {
      page_path: 'event:' + name,
      page_name: name,
      visitor_id: visitorId(),
      utm_source: (props && props.source) || null,
      utm_medium: (props && props.medium) || null,
      utm_campaign: (props && props.campaign) || null,
      utm_content: JSON.stringify(props) || null,
      utm_term: null,
      referrer: window.location.pathname
    }, true);
  }

  /* ---- portal ref/utm attribution (track-lead, keepalive) ---- */
  function sendTrackLead(email) {
    var a = getAttribution();
    fetch(TRACK_LEAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        ref: a.ref || undefined,
        utm_source: a.utm_source || undefined,
        utm_medium: a.utm_medium || undefined,
        utm_campaign: a.utm_campaign || undefined,
        utm_content: a.utm_content || undefined
      }),
      keepalive: true
    }).catch(function () {});
  }

  /* ---- CTA buttons: scroll to form + InitiateCheckout ---- */
  function ctaClick() {
    trackEvent('cta_click_500kdiy', { button: 'scroll_to_checkout', page: '/500kdiy' });
    if (window.fbq) fbq('track', 'InitiateCheckout', { content_name: '500k_diy_course', value: 197, currency: 'ILS' });
    var el = document.getElementById('signup');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function wireCtas() {
    var buttons = document.querySelectorAll('button');
    buttons.forEach(function (b) {
      var t = (b.textContent || '').trim();
      if (b.closest('form')) return; // the submit button keeps its own handler
      if (t.indexOf('אני רוצה') === 0) b.addEventListener('click', ctaClick);
    });
  }

  /* ---- sticky mobile CTA (appears after 600px scroll) ---- */
  function wireStickyCta() {
    var bar = document.createElement('div');
    bar.id = 'sticky-cta';
    bar.innerHTML =
      '<div class="fixed bottom-16 left-0 right-0 z-50 p-3 md:hidden">' +
      '<button class="w-full bg-[#5BC090] hover:bg-[#4aa97d] text-white font-bold py-4 px-6 rounded-full shadow-xl flex items-center justify-center gap-2 text-sm">' +
      '<span>אני רוצה לבנות מקפצה של חצי מליון לכל ילד</span>' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>' +
      '</button></div>';
    bar.querySelector('button').addEventListener('click', ctaClick);
    document.body.appendChild(bar);
    var onScroll = function () {
      bar.classList.toggle('visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- signup form ---- */
  function wireForm() {
    var email = document.getElementById('email-input');
    if (!email) return;
    var form = email.closest('form');
    if (!form) return;
    var firstName = form.querySelector('input[type="text"]');
    var phone = form.querySelector('input[type="tel"]');
    // fill hidden attribution fields (parity with the original markup)
    var a = getAttribution();
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'ref'].forEach(function (k) {
      var inp = form.querySelector('input[name="' + k + '"]');
      if (inp) inp.value = a[k] || '';
    });
    var channelInp = form.querySelector('input[name="channel"]');
    if (channelInp) channelInp.value = qs.get('channel') || '';

    var submitting = false;
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (submitting) return;
      var errEl = form.querySelector('.form-error');
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'form-error text-red-500 text-sm mt-2 text-center';
        form.appendChild(errEl);
      }
      errEl.textContent = '';
      var mail = (email.value || '').trim();
      if (!mail) { errEl.textContent = 'אנא הכניסי כתובת מייל'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { errEl.textContent = 'אנא הכניסי כתובת מייל תקינה'; return; }

      submitting = true;
      var btn = form.querySelector('button[type="submit"]') || form.querySelector('button');
      var btnLabel = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'שולח...'; }

      var payload = {
        email: mail,
        firstName: (firstName && firstName.value) || '',
        phone: (phone && phone.value) || ''
      };

      var dbInsert = supaInsert('leads', {
        email: mail,
        name: payload.firstName,
        phone: payload.phone,
        channel: '500k_diy',
        utm_source: a.utm_source || null,
        utm_medium: a.utm_medium || null,
        utm_campaign: a.utm_campaign || null,
        utm_content: a.utm_content || null,
        ref: a.ref || null,
        sent_to_smoove: true
      });
      var smoove = fetch(SUPA_URL + '/functions/v1/smoove-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPA_KEY,
          Authorization: 'Bearer ' + SUPA_KEY
        },
        body: JSON.stringify({
          email: mail,
          firstName: payload.firstName,
          phone: payload.phone,
          listId: SMOOVE_LIST_ID,
          utm_source: a.utm_source || undefined,
          utm_medium: a.utm_medium || undefined,
          utm_campaign: a.utm_campaign || undefined,
          utm_content: a.utm_content || undefined,
          ref: a.ref || undefined,
          channel: qs.get('channel') || undefined
        }),
        keepalive: true
      }).catch(function (e) { console.error('Smoove error:', e); });

      Promise.allSettled([dbInsert, smoove]).then(function () {
        trackEvent('form_submit_500kdiy', { email: mail, page: '/500kdiy' });
        if (window.fbq) fbq('track', 'Lead', { content_name: '500k_diy_course', value: 197, currency: 'ILS' });
        if (window.gtag) gtag('event', 'begin_checkout', { event_category: 'ecommerce', event_label: '500k_diy_purchase', value: 147 });
        sendTrackLead(mail);
        window.location.href = CARDCOM_URL + encodeURIComponent(mail);
      });
      // safety net: never leave the button stuck if navigation is blocked
      setTimeout(function () {
        submitting = false;
        if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
      }, 8000);
    });
  }

  /* ---- FAQ chat ---- */
  var FAQ = [
    { q: 'אין לי הרבה זמן פנוי ביום-יום, זה דורש ממני השקעה גדולה?',
      a: 'ממש לא 💫\n\nאני יודעת מה זה להיות אמא ואיך נראה הלו"ז שלך.\n\nהקורס בנוי משיעורים קצרים וממוקדים.\n\nהמטרה היא שתצאי עם פעולות פשוטות לביצוע.' },
    { q: 'אני ממש לא מבינה בכספים ובמספרים, אני אצליח להסתדר?',
      a: 'חד משמעית כן! 🙌\n\nהצוות שלי ואני מסבירים הכל בגובה העיניים, בלי מונחים פלצניים ובלי לסבך.\n\nכך שגם אם מעולם לא פתחת חיסכון בעצמך - את תצליחי.' },
    { q: 'מה אם אני אגלה שהשיטה הזאת לא מתאימה למצב הכלכלי שלי?',
      a: 'היופי בשיטה הזו הוא שהיא גמישה 🌿\n\nאני מראה לך איך להתחיל גם מסכומים קטנים מאוד (אפשר להתחיל החל מ50₪ בחודש)\n\nואיך המנגנון של הזמן עושה את העבודה הקשה במקומך.\n\nאם תיישמי את מה שנלמד - את תראי את השינוי במספרים בעצמך.' },
    { q: 'למה לשלם על זה אם אפשר למצוא מידע בחינם ביוטיוב או בגוגל?',
      a: 'זו שאלה מצוינת! 💡\n\nבחוץ יש ים של מידע מפוזר, סותר ולפעמים אפילו מטעה.\n\nכאן את מקבלת שיטה אחת סדורה, מזוקקת ומנוסה,\nשחוסכת לך שעות של חיפושים וטעויות שיכולות לעלות לך ביוקר.\n\nבמקום לנחש - את מקבלת את הדרך הקצרה והבטוחה ביותר ליעד.' },
    { q: 'כמה זמן תהיה לי גישה לתכנים של הקורס?',
      a: 'הגישה היא ללא הגבלת זמן! 🎉\n\nברגע שרכשת, התכנים שלך לתמיד.\n\nתוכלי לחזור אליהם בכל פעם שתצטרכי לרענן את הזיכרון,\nכשנולד עוד ילד, או סתם כשמתחשק לך לוודא שאת עדיין במסלול הנכון.' },
    { q: 'ויש החזר כספי אם אני מרגישה שזה לא בשבילי?',
      a: 'אני מאמינה בלב שלם בערך שהקורס הזה נותן 💜\n\nולכן אני לוקחת את כל הסיכון עליי.\n\nאם אחרי שתצפה בקורס תרגישה שזה לא מה שחיפשת - פשוט תשלחי לי מייל תוך 48 שעות ותקבלי החזר מלא, בלי שאלות ובלי פרצופים.' }
  ];

  function wireFaqChat() {
    var label = null;
    document.querySelectorAll('p').forEach(function (p) {
      if (p.textContent.trim() === 'לחצי על שאלה כדי לשאול:') label = p;
    });
    if (!label) return;
    var footerBox = label.parentElement;               // p + buttons wrapper
    var buttonsWrap = label.nextElementSibling;
    var card = footerBox.closest('.bg-\\[\\#F8F6FF\\]') || footerBox.parentElement.parentElement;
    var thread = card.querySelector('.overflow-y-auto');
    var avatarImg = card.querySelector('img');
    var avatarSrc = avatarImg ? avatarImg.getAttribute('src') : '';

    function avatarHtml() {
      return '<div class="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E8E4DF]">' +
        '<img src="' + avatarSrc + '" alt="עדי" class="w-full h-full object-cover object-top"></div>';
    }
    function bubble(type, text) {
      var row = document.createElement('div');
      row.className = 'flex gap-2 md:gap-3 animate-fade-in' + (type === 'user' ? ' flex-row-reverse' : '');
      var inner = type === 'user'
        ? 'bg-[#5BC090] text-white rounded-br-sm'
        : 'bg-white border border-[#E8E4DF] text-[#4A4660] rounded-bl-sm shadow-sm';
      row.innerHTML = (type === 'adi' ? avatarHtml() : '') +
        '<div class="max-w-[85%] md:max-w-[80%] rounded-xl md:rounded-2xl p-3 md:p-4 ' + inner + '">' +
        '<p class="leading-relaxed text-xs md:text-base whitespace-pre-line"></p></div>';
      row.querySelector('p').textContent = text;
      return row;
    }
    function typingRow() {
      var row = document.createElement('div');
      row.className = 'flex gap-2 md:gap-3 animate-fade-in';
      row.innerHTML = avatarHtml() +
        '<div class="bg-white border border-[#E8E4DF] rounded-xl md:rounded-2xl rounded-bl-sm p-3 md:p-4 shadow-sm"><div class="flex gap-1">' +
        '<span class="w-2 h-2 bg-[#5BC090] rounded-full animate-bounce" style="animation-delay:0ms"></span>' +
        '<span class="w-2 h-2 bg-[#5BC090] rounded-full animate-bounce" style="animation-delay:150ms"></span>' +
        '<span class="w-2 h-2 bg-[#5BC090] rounded-full animate-bounce" style="animation-delay:300ms"></span>' +
        '</div></div>';
      return row;
    }
    function scrollThread() { thread.scrollTop = thread.scrollHeight; }
    function remaining() { return buttonsWrap.querySelectorAll('button').length; }
    function showDone() {
      label.remove();
      buttonsWrap.outerHTML =
        '<div class="text-center py-3 md:py-4">' +
        '<p class="text-[#7A7690] mb-3 text-sm md:text-base">עניתי על כל השאלות! 🎉</p>' +
        '<button class="inline-flex items-center gap-2 bg-[#5BC090] hover:bg-[#4aa97d] text-white font-bold px-5 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base transition-all"><span>אני רוצה גישה למנגנון</span></button></div>';
      footerBox.querySelector('button').addEventListener('click', ctaClick);
    }

    buttonsWrap.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var q = btn.textContent.trim();
        var item = null;
        FAQ.forEach(function (f) { if (f.q === q) item = f; });
        if (!item) return;
        btn.remove();
        thread.appendChild(bubble('user', item.q));
        var t = typingRow();
        thread.appendChild(t);
        scrollThread();
        setTimeout(function () {
          t.remove();
          thread.appendChild(bubble('adi', item.a));
          scrollThread();
          if (remaining() === 0) showDone();
        }, 1500 + Math.random() * 1000);
      });
    });
  }

  /* ---- cookie consent banner ---- */
  function wireCookieBanner() {
    var banner = document.querySelector('.CookieConsent');
    if (!banner) return;
    if (document.cookie.indexOf('CookieConsent=') !== -1) { banner.remove(); return; }
    function close(val) {
      document.cookie = 'CookieConsent=' + val + ';path=/;max-age=' + 365 * 24 * 3600;
      banner.remove();
    }
    var ok = document.getElementById('rcc-confirm-button');
    var no = document.getElementById('rcc-decline-button');
    if (ok) ok.addEventListener('click', function () { close('true'); });
    if (no) no.addEventListener('click', function () { close('false'); });
  }

  /* ---- init ---- */
  function init() {
    trackPageView();
    wireCtas();
    wireStickyCta();
    wireForm();
    wireFaqChat();
    wireCookieBanner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
