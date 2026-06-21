/* ============================================================
   MindCare AI — Subscription & Free Trial Engine (DEMO ONLY)
   No real payments happen here. This simulates a subscription
   flow using localStorage, the same pattern the rest of the
   site already uses for mood/journal/profile/dark mode.

   To take REAL payments later, you'd replace subscribe() with
   a call to your backend, which creates a Stripe Checkout
   Session — that part can't be done safely in client-only JS.
   ============================================================ */

const MindCareSub = (() => {

  const TRIAL_DAYS = 7;

  const KEYS = {
    trialStart: "mc_trialStart",
    trialUsed:  "mc_trialUsed",
    subscribed: "mc_subscribed",
    plan:       "mc_plan"
  };

  const PLANS = {
    monthly: { label: "Monthly", price: 6.99,  suffix: "/mo" },
    yearly:  { label: "Yearly",  price: 49.99, suffix: "/yr", note: "Save 40% vs. monthly" }
  };

  // Begin the 7-day trial. One trial per browser (demo limitation).
  function startTrial() {
    if (localStorage.getItem(KEYS.trialUsed)) return false;
    localStorage.setItem(KEYS.trialStart, new Date().toISOString());
    localStorage.setItem(KEYS.trialUsed, "true");
    localStorage.setItem(KEYS.subscribed, "false");
    return true;
  }

  // Fake checkout — resolves after a short delay to feel real.
  function subscribe(planKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(KEYS.subscribed, "true");
        localStorage.setItem(KEYS.plan, planKey);
        resolve(true);
      }, 1400);
    });
  }

  function cancelSubscription() {
    localStorage.setItem(KEYS.subscribed, "false");
    localStorage.removeItem(KEYS.plan);
  }

  // state: "none" | "trial" | "expired" | "active"
  function getStatus() {
    const subscribed = localStorage.getItem(KEYS.subscribed) === "true";
    const plan = localStorage.getItem(KEYS.plan);

    if (subscribed) return { state: "active", plan, daysLeft: null };

    const trialStartRaw = localStorage.getItem(KEYS.trialStart);
    if (!trialStartRaw) return { state: "none", plan: null, daysLeft: TRIAL_DAYS };

    const start = new Date(trialStartRaw);
    const daysElapsed = Math.floor((Date.now() - start.getTime()) / 86400000);
    const daysLeft = TRIAL_DAYS - daysElapsed;

    return daysLeft > 0
      ? { state: "trial", plan: null, daysLeft }
      : { state: "expired", plan: null, daysLeft: 0 };
  }

  // Injects a small status pill into the navbar (every page that includes this file)
  function renderBadge() {
    const nav = document.querySelector(".nav-links");
    if (!nav) return;

    const status = getStatus();
    let text, bg, color;

    if (status.state === "active") {
      text = `⭐ ${PLANS[status.plan]?.label || "Premium"}`;
      bg = "rgba(16,185,129,.15)"; color = "#6ee7b7";
    } else if (status.state === "trial") {
      text = `🕒 ${status.daysLeft}d left in trial`;
      bg = "rgba(245,158,11,.15)"; color = "#fde68a";
    } else if (status.state === "expired") {
      text = `🔒 Trial ended`;
      bg = "rgba(239,68,68,.15)"; color = "#f87171";
    } else {
      text = `✨ Free Trial`;
      bg = "rgba(96,165,250,.15)"; color = "#60a5fa";
    }

    const li = document.createElement("li");
    li.innerHTML = `<a href="subscription.html" style="
        padding:6px 14px; border-radius:20px; font-size:0.78rem;
        background:${bg}; color:${color}; border:1px solid ${color}55;
        white-space:nowrap; font-weight:700; text-decoration:none;">${text}</a>`;

    // insert before the dark mode toggle (last <li>) if present, else at the end
    if (nav.lastElementChild) nav.insertBefore(li, nav.lastElementChild);
    else nav.appendChild(li);
  }

  // Call on premium pages (ai-chat.html, voice.html, ...). Blocks the page if trial expired.
  function guard() {
    const status = getStatus();
    if (status.state !== "expired") return true;

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:5000;
      background:rgba(15,23,42,.92); backdrop-filter:blur(8px);
      display:flex; align-items:center; justify-content:center; padding:20px;`;
    overlay.innerHTML = `
      <div class="glass" style="max-width:420px; padding:40px; text-align:center;">
        <div style="font-size:2.5rem; margin-bottom:10px;">🔒</div>
        <h2 style="margin-bottom:10px;">Your free trial has ended</h2>
        <p style="color:var(--subtext); margin-bottom:24px;">
          Subscribe to keep using AI Chat, Voice AI, and the rest of MindCare Premium.
        </p>
        <a href="subscription.html" class="btn" style="width:100%; display:block;">🚀 See Plans</a>
      </div>`;
    document.body.appendChild(overlay);
    return false;
  }

  return { startTrial, subscribe, cancelSubscription, getStatus, renderBadge, guard, PLANS, TRIAL_DAYS };
})();

document.addEventListener("DOMContentLoaded", () => {
  MindCareSub.renderBadge();
});