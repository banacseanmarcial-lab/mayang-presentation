(function(){
  "use strict";

  /* ============================================================
     STATE (in-memory only — resets on reload; no backend yet)
  ============================================================ */
  var users = [];        // {name, email, password}
  var currentUser = null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lastFocusedEl = null;

  /* ============================================================
     THEME TOGGLE
  ============================================================ */
  var root = document.documentElement;
  var themeToggle = document.getElementById('themeToggle');
  function setTheme(mode){
    root.setAttribute('data-theme', mode);
    themeToggle.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
    themeToggle.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
  themeToggle.addEventListener('click', function(){
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ============================================================
     HEADER SCROLL STATE
  ============================================================ */
  var header = document.getElementById('siteHeader');
  function onScroll(){
    if(window.scrollY > 8){ header.classList.add('scrolled'); }
    else{ header.classList.remove('scrolled'); }
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ============================================================
     MOBILE NAV
  ============================================================ */
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  navToggle.addEventListener('click', function(){
    var open = mobileNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileNav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ mobileNav.classList.remove('open'); });
  });

  /* ============================================================
     BREATHING ORB
  ============================================================ */
  var orb = document.getElementById('breathOrb');
  var orbLabel = document.getElementById('orbLabel');
  var orbCaption = document.getElementById('orbCaption');
  var breathing = false;
  var breathTimer = null;

  function breathCycle(){
    orbLabel.textContent = 'Breathe in';
    orbCaption.textContent = 'In slowly through your nose…';
    breathTimer = setTimeout(function(){
      if(!breathing) return;
      orbLabel.textContent = 'Breathe out';
      orbCaption.textContent = 'Out gently through your mouth…';
      breathTimer = setTimeout(function(){
        if(!breathing) return;
        breathCycle();
      }, 4000);
    }, 4000);
  }

  orb.addEventListener('click', function(){
    breathing = !breathing;
    orb.setAttribute('aria-pressed', breathing ? 'true' : 'false');
    if(breathing){
      orb.classList.add('active');
      if(reduceMotion){
        orbLabel.textContent = 'Breathing';
        orbCaption.textContent = 'Tap again to stop. Breathe at your own pace.';
      } else {
        breathCycle();
      }
    } else {
      orb.classList.remove('active');
      clearTimeout(breathTimer);
      orbLabel.textContent = 'Breathe';
      orbCaption.textContent = 'Tap the circle. Just breathe for a moment — no account needed.';
    }
  });

  /* ============================================================
     TOAST
  ============================================================ */
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function showToast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 3200);
  }

  /* ============================================================
     AUTH MODAL — open / close / tabs
  ============================================================ */
  var overlay = document.getElementById('authOverlay');
  var modal = overlay.querySelector('.modal');
  var tabSignin = document.getElementById('tabSignin');
  var tabSignup = document.getElementById('tabSignup');
  var signinPane = document.getElementById('signinPane');
  var signupPane = document.getElementById('signupPane');

  function showPane(which){
    var signinOn = which === 'signin';
    signinPane.hidden = !signinOn;
    signupPane.hidden = signinOn;
    tabSignin.classList.toggle('active', signinOn);
    tabSignup.classList.toggle('active', !signinOn);
    tabSignin.setAttribute('aria-selected', signinOn ? 'true' : 'false');
    tabSignup.setAttribute('aria-selected', signinOn ? 'false' : 'true');
    var firstInput = (signinOn ? signinPane : signupPane).querySelector('input');
    if(firstInput) setTimeout(function(){ firstInput.focus(); }, 60);
  }

  function openAuth(which){
    lastFocusedEl = document.activeElement;
    overlay.hidden = false;
    showPane(which || 'signin');
    document.body.style.overflow = 'hidden';
  }
  function closeAuth(){
    overlay.hidden = true;
    document.body.style.overflow = '';
    clearStatus('signinStatus');
    clearStatus('signupStatus');
    if(lastFocusedEl) lastFocusedEl.focus();
  }

  document.querySelectorAll('[data-auth]').forEach(function(btn){
    btn.addEventListener('click', function(){ openAuth(btn.getAttribute('data-auth')); });
  });
  document.getElementById('authClose').addEventListener('click', closeAuth);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeAuth(); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && !overlay.hidden) closeAuth();
  });
  tabSignin.addEventListener('click', function(){ showPane('signin'); });
  tabSignup.addEventListener('click', function(){ showPane('signup'); });
  document.getElementById('goSignup').addEventListener('click', function(){ showPane('signup'); });
  document.getElementById('goSignin').addEventListener('click', function(){ showPane('signin'); });
  document.getElementById('forgotLink').addEventListener('click', function(e){
    e.preventDefault();
    setStatus('signinStatus', "Password reset isn't available in this demo yet — sign in with the password you created.", 'error');
  });

  /* ============================================================
     VALIDATION HELPERS
  ============================================================ */
  function setFieldError(fieldId, hasError){
    document.getElementById(fieldId).classList.toggle('has-error', hasError);
  }
  function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
  function passwordRules(v){
    return { len: v.length >= 8, mix: /[A-Za-z]/.test(v) && /\d/.test(v) };
  }
  function setStatus(id, msg, kind){
    var el = document.getElementById(id);
    el.textContent = msg;
    el.className = 'form-status show ' + kind;
  }
  function clearStatus(id){
    var el = document.getElementById(id);
    el.className = 'form-status';
    el.textContent = '';
  }
  function initials(name){
    var parts = name.trim().split(/\s+/);
    var a = parts[0] ? parts[0][0] : '';
    var b = parts.length > 1 ? parts[parts.length-1][0] : '';
    return (a+b).toUpperCase();
  }

  /* password show/hide toggles */
  document.querySelectorAll('.pw-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var input = document.getElementById(btn.getAttribute('data-target'));
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide' : 'Show';
    });
  });

  /* live password checklist on signup */
  var suPassword = document.getElementById('suPassword');
  var ruleLen = document.getElementById('ruleLen');
  var ruleMix = document.getElementById('ruleMix');
  suPassword.addEventListener('input', function(){
    var r = passwordRules(suPassword.value);
    ruleLen.classList.toggle('met', r.len);
    ruleMix.classList.toggle('met', r.mix);
  });

  /* ============================================================
     SIGN UP
  ============================================================ */
  document.getElementById('signupForm').addEventListener('submit', function(e){
    e.preventDefault();
    clearStatus('signupStatus');

    var name = document.getElementById('suName').value.trim();
    var email = document.getElementById('suEmail').value.trim();
    var password = document.getElementById('suPassword').value;
    var confirm = document.getElementById('suConfirm').value;
    var terms = document.getElementById('suTerms').checked;

    var nameOk = name.length >= 2;
    var emailOk = isValidEmail(email);
    var rules = passwordRules(password);
    var passOk = rules.len && rules.mix;
    var confirmOk = confirm.length > 0 && confirm === password;

    setFieldError('suNameField', !nameOk);
    setFieldError('suEmailField', !emailOk);
    setFieldError('suPasswordField', !passOk);
    setFieldError('suConfirmField', !confirmOk);

    if(!nameOk){ document.getElementById('suName').focus(); return; }
    if(!emailOk){ document.getElementById('suEmail').focus(); return; }
    if(!passOk){ document.getElementById('suPassword').focus(); return; }
    if(!confirmOk){ document.getElementById('suConfirm').focus(); return; }

    if(!terms){
      setStatus('signupStatus', 'Please confirm you understand what MindCare AI is (and isn\'t) before continuing.', 'error');
      return;
    }

    var exists = users.some(function(u){ return u.email.toLowerCase() === email.toLowerCase(); });
    if(exists){
      setStatus('signupStatus', 'An account with that email already exists. Try signing in instead.', 'error');
      setFieldError('suEmailField', true);
      return;
    }

    users.push({ name:name, email:email, password:password });
    logIn(name, email);
    setStatus('signupStatus', 'Account created. Welcome to MindCare AI.', 'success');
    showToast('Welcome, ' + name.split(' ')[0] + '! Your space is ready.');
    setTimeout(closeAuth, 700);
    e.target.reset();
    ruleLen.classList.remove('met'); ruleMix.classList.remove('met');
  });

  /* ============================================================
     SIGN IN
  ============================================================ */
  document.getElementById('signinForm').addEventListener('submit', function(e){
    e.preventDefault();
    clearStatus('signinStatus');

    var email = document.getElementById('siEmail').value.trim();
    var password = document.getElementById('siPassword').value;

    var emailOk = isValidEmail(email);
    var passOk = password.length > 0;
    setFieldError('siEmailField', !emailOk);
    setFieldError('siPasswordField', !passOk);
    if(!emailOk){ document.getElementById('siEmail').focus(); return; }
    if(!passOk){ document.getElementById('siPassword').focus(); return; }

    var user = users.find(function(u){ return u.email.toLowerCase() === email.toLowerCase(); });
    if(!user){
      setStatus('signinStatus', "We couldn't find an account with that email. Try creating one instead.", 'error');
      setFieldError('siEmailField', true);
      return;
    }
    if(user.password !== password){
      setStatus('signinStatus', "That password doesn't match. Please try again.", 'error');
      setFieldError('siPasswordField', true);
      return;
    }

    logIn(user.name, user.email);
    setStatus('signinStatus', 'Signed in. Good to see you again.', 'success');
    showToast('Welcome back, ' + user.name.split(' ')[0] + '.');
    setTimeout(closeAuth, 500);
    e.target.reset();
  });

  /* ============================================================
     SESSION: LOG IN / LOG OUT
  ============================================================ */
  var loggedOutActions = document.getElementById('loggedOutActions');
  var loggedInActions = document.getElementById('loggedInActions');
  var userNameEl = document.getElementById('userName');
  var userInitialsEl = document.getElementById('userInitials');
  var welcomePanel = document.getElementById('welcomePanel');
  var welcomeHeading = document.getElementById('welcomeHeading');
  var moodNote = document.getElementById('moodNote');

  function logIn(name, email){
    currentUser = { name:name, email:email };
    loggedOutActions.style.display = 'none';
    loggedInActions.hidden = false;
    userNameEl.textContent = name.split(' ')[0];
    userInitialsEl.textContent = initials(name);
    welcomeHeading.textContent = 'Welcome back, ' + name.split(' ')[0] + '.';
    welcomePanel.hidden = false;
    moodNote.textContent = '';
    document.querySelectorAll('.mood-btn').forEach(function(b){ b.setAttribute('aria-pressed','false'); });
  }

  function logOut(){
    currentUser = null;
    loggedOutActions.style.display = 'flex';
    loggedInActions.hidden = true;
    welcomePanel.hidden = true;
    showToast("You've been logged out.");
  }

  document.getElementById('logoutBtn').addEventListener('click', logOut);

  /* mood check-in (illustrative only) */
  document.querySelectorAll('.mood-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.mood-btn').forEach(function(b){ b.setAttribute('aria-pressed','false'); });
      btn.setAttribute('aria-pressed','true');
      moodNote.textContent = 'Logged as "' + btn.getAttribute('data-mood') + '" — thanks for checking in.';
    });
  });

})();
