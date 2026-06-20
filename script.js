// =====================
// LOADER + PAGE INIT
// =====================

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 800);
    }, 1000);
  }

  loadProfile();
  loadJournal();
  loadCurrentEmotion();
  loadTheme();
});

// =====================
// DARK MODE
// =====================

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  // FIX: explicitly store "true"/"false" strings
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "true" : "false");
}

function loadTheme() {
  if (localStorage.getItem("theme") === "true") {
    document.body.classList.add("dark");
  }
}

// =====================
// LOGIN
// =====================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    alert("Login Successful");
    window.location.href = "dashboard.html";
  });
}

// =====================
// SIGNUP
// =====================

const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", e => {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    alert("Account Created Successfully");
    window.location.href = "dashboard.html";
  });
}

// =====================
// AI CHAT
// =====================

function sendMessage() {
  const input = document.getElementById("messageInput");
  const messages = document.getElementById("messages");

  if (!input || !messages) return;

  const text = input.value.trim();
  if (text === "") return;

  messages.innerHTML += `<p><strong>You:</strong> ${text}</p>`;

  setTimeout(() => {
    const replies = [
      "Thank you for sharing that with me.",
      "I'm here to listen. Tell me more.",
      "Your feelings matter.",
      "That sounds important. How are you feeling about it?",
      "Taking time to reflect is a positive step."
    ];

    const reply = replies[Math.floor(Math.random() * replies.length)];
    messages.innerHTML += `<p><strong>MindCare AI:</strong> ${reply}</p>`;
    messages.scrollTop = messages.scrollHeight;
  }, 1000);

  detectRisk(text);
  input.value = "";
}

function detectRisk(message) {
  const warningWords = ["hopeless", "give up", "suicide", "end my life"];
  const risk = warningWords.some(word => message.toLowerCase().includes(word));

  if (risk) {
    alert(
      "Please reach out to a trusted adult, counselor, mental health professional, or local emergency service if you feel unsafe."
    );
  }
}

// Enter key support
const chatInput = document.getElementById("messageInput");
if (chatInput) {
  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });
}

// =====================
// ASSESSMENT
// =====================

function calculatePremiumAssessment() {
  const q1 = Number(document.getElementById("q1").value);
  const q2 = Number(document.getElementById("q2").value);
  const q3 = Number(document.getElementById("q3").value);
  const total = q1 + q2 + q3;

  let result = "";
  let recommendation = "";

  if (total <= 2) {
    result = "Minimal";
    recommendation = "Continue healthy self-care habits.";
  } else if (total <= 4) {
    result = "Mild";
    recommendation = "Practice mindfulness and journaling.";
  } else if (total <= 6) {
    result = "Moderate";
    recommendation = "Monitor stress levels and seek support if needed.";
  } else {
    result = "High";
    recommendation = "Consider speaking with a counselor or trusted support person.";
  }

  document.getElementById("result").innerText = "Assessment Result: " + result;
  document.getElementById("recommendation").innerText = recommendation;
}

// =====================
// JOURNAL
// =====================

function saveJournal() {
  const mood = document.getElementById("mood").value;
  const entry = document.getElementById("journalEntry").value;

  if (entry.trim() === "") return;

  // FIX: load existing entries array instead of overwriting with a single entry
  const existing = JSON.parse(localStorage.getItem("mindcareJournal") || "[]");

  existing.unshift({
    mood,
    entry,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("mindcareJournal", JSON.stringify(existing));

  loadJournal();
  alert("Journal Saved");
}

function loadJournal() {
  const savedEl = document.getElementById("savedEntry");
  if (!savedEl) return;

  // FIX: parse array of entries and render all of them
  const entries = JSON.parse(localStorage.getItem("mindcareJournal") || "[]");

  if (entries.length === 0) {
    savedEl.innerHTML = "<em>No journal entries yet.</em>";
    return;
  }

  savedEl.innerHTML = entries
    .map(
      data => `
      <div style="margin-bottom:1rem; padding-bottom:1rem; border-bottom:1px solid #ccc;">
        <strong>${data.date}</strong><br><br>
        ${data.mood}<br><br>
        ${data.entry}
      </div>`
    )
    .join("");
}

// =====================
// PROFILE
// =====================

function saveProfile() {
  const profile = {
    name: document.getElementById("profileName").value,
    age: document.getElementById("profileAge").value,
    gender: document.getElementById("profileGender").value
  };

  localStorage.setItem("profile", JSON.stringify(profile));
  alert("Profile Updated");
}

function loadProfile() {
  const saved = localStorage.getItem("profile");

  if (saved && document.getElementById("profileName")) {
    const profile = JSON.parse(saved);
    document.getElementById("profileName").value = profile.name || "";
    document.getElementById("profileAge").value = profile.age || "";
    document.getElementById("profileGender").value = profile.gender || "";
  }
}

// =====================
// EMOTION FEED
// =====================

const emotionData = {
  happy: {
    label: "😊 Happy",
    color: "#facc15",
    quote: "Happiness is not something ready-made. It comes from your own actions.",
    author: "Dalai Lama",
    tips: [
      "Share your joy — call or message someone you care about.",
      "Write down 3 things making you happy right now.",
      "Do something creative while your energy is high."
    ],
    playlist: "Upbeat Pop & Feel-Good Hits",
    prompt: "What made you smile the most today, and how can you bring more of that into tomorrow?"
  },
  sad: {
    label: "😔 Sad",
    color: "#60a5fa",
    quote: "Even the darkest night will end and the sun will rise.",
    author: "Victor Hugo",
    tips: [
      "Allow yourself to feel — suppressing sadness makes it last longer.",
      "Step outside for even 10 minutes of fresh air.",
      "Reach out to a trusted friend or write your thoughts down."
    ],
    playlist: "Gentle & Healing Acoustic",
    prompt: "What is this sadness trying to tell you? Is there something you need right now?"
  },
  stressed: {
    label: "😰 Stressed",
    color: "#f97316",
    quote: "You don't have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman",
    tips: [
      "Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.",
      "Write down everything on your mind — empty it out of your head.",
      "Tackle one small task to break the overwhelm cycle."
    ],
    playlist: "Lo-Fi Focus & Calm",
    prompt: "What is the ONE thing stressing you most right now, and what is one step you can take today?"
  },
  doubt: {
    label: "🤔 Doubt",
    color: "#a78bfa",
    quote: "Doubt is not a pleasant condition, but certainty is an absurd one.",
    author: "Voltaire",
    tips: [
      "List the evidence for and against what you're doubting.",
      "Talk it through with someone you trust.",
      "Remember: doubt means you care about getting it right."
    ],
    playlist: "Thoughtful Indie & Reflection",
    prompt: "What would you do if you knew you couldn't fail? What's holding you back from trying?"
  },
  guilt: {
    label: "😞 Guilt",
    color: "#94a3b8",
    quote: "Guilt is not a response to anger; it is a response to one's own actions.",
    author: "Audre Lorde",
    tips: [
      "Ask yourself: is this guilt productive (motivating change) or toxic (just painful)?",
      "Apologize or make amends if it's within your power.",
      "Forgive yourself — you are human, and growth requires mistakes."
    ],
    playlist: "Soothing Piano & Reflection",
    prompt: "What do you need to forgive yourself for today? Write it down, and then let it go."
  },
  fear: {
    label: "😨 Fear",
    color: "#818cf8",
    quote: "Fear is only as deep as the mind allows.",
    author: "Japanese Proverb",
    tips: [
      "Name the fear out loud or in writing — vague fears grow, named fears shrink.",
      "Ask: what is the realistic worst-case scenario, and could I handle it?",
      "Take one small action toward the thing you fear."
    ],
    playlist: "Grounding & Ambient Calm",
    prompt: "What are you afraid of right now, and what is one tiny step you could take to face it?"
  },
  anger: {
    label: "😡 Anger",
    color: "#ef4444",
    quote: "Speak when you are angry and you will make the best speech you will ever regret.",
    author: "Ambrose Bierce",
    tips: [
      "Pause before reacting — even 60 seconds changes your response.",
      "Physical movement (walk, workout) burns off anger energy fast.",
      "Journal what triggered you before addressing it with anyone."
    ],
    playlist: "High-Energy Release Beats",
    prompt: "What is the real need underneath this anger? What boundary was crossed?"
  },
  disgust: {
    label: "🤢 Disgust",
    color: "#84cc16",
    quote: "What we see depends mainly on what we look for.",
    author: "John Lubbock",
    tips: [
      "Step away from what's triggering the feeling if possible.",
      "Reflect on whether this reaction reveals a value you hold strongly.",
      "Ground yourself with something clean, calm, and familiar."
    ],
    playlist: "Fresh Start & Cleansing Ambient",
    prompt: "What does this feeling reveal about what matters to you and the standards you hold?"
  },
  surprise: {
    label: "😲 Surprise",
    color: "#fb923c",
    quote: "Life is full of surprises, but never when you need one.",
    author: "Bill Watterson",
    tips: [
      "Give yourself a moment before reacting — good or bad surprise both deserve space.",
      "Curiosity is the best response to the unexpected.",
      "Write down what happened while it's fresh."
    ],
    playlist: "Curious & Uplifting Discovery Mix",
    prompt: "How did this surprise change your perspective, even slightly?"
  },
  excited: {
    label: "🤩 Excited",
    color: "#f59e0b",
    quote: "Enthusiasm is the electricity of life.",
    author: "Gordon Parks",
    tips: [
      "Channel this energy into starting something you've been putting off.",
      "Share your excitement — it's contagious and connects people.",
      "Write down what you're excited about to revisit on harder days."
    ],
    playlist: "Feel-Good Energy Anthems",
    prompt: "What is this excitement pointing you toward? How can you keep this momentum going?"
  },
  depressed: {
    label: "🌧 Depressed",
    color: "#475569",
    quote: "Even the darkest night will end and the sun will rise.",
    author: "Victor Hugo",
    tips: [
      "You don't have to feel better right now — just focus on the next hour.",
      "Try to do one very small thing: drink water, open a window, take a shower.",
      "Consider speaking with a counselor or mental health professional."
    ],
    playlist: "Gentle Comfort & Healing Sounds",
    prompt: "What does your body need most right now — rest, connection, movement, or nourishment?"
  }
};

function showEmotion(emotion) {
  const feed = document.getElementById("emotionFeed");
  if (!feed) return;

  const data = emotionData[emotion];
  if (!data) return;

  // Highlight the active button
  document.querySelectorAll(".emotion-grid button").forEach(btn => {
    btn.classList.remove("active");
  });
  const activeBtn = document.querySelector(`[onclick="showEmotion('${emotion}')"]`);
  if (activeBtn) activeBtn.classList.add("active");

  // Render the full feed card
  feed.innerHTML = `
    <div class="feed-header" style="border-left: 4px solid ${data.color}; padding-left: 16px; margin-bottom: 24px;">
      <h2 style="font-size:2rem; color:${data.color};">${data.label}</h2>
    </div>

    <div class="feed-section">
      <div class="feed-label">💬 Quote</div>
      <blockquote class="feed-quote">
        "${data.quote}"
        <footer>— ${data.author}</footer>
      </blockquote>
    </div>

    <div class="feed-section">
      <div class="feed-label">🎵 Suggested Playlist</div>
      <div class="feed-playlist">${data.playlist}</div>
    </div>

    <div class="feed-section">
      <div class="feed-label">✅ What to Do Now</div>
      <ul class="feed-tips">
        ${data.tips.map(t => `<li>${t}</li>`).join("")}
      </ul>
    </div>

    <div class="feed-section">
      <div class="feed-label">🧠 AI Reflection Prompt</div>
      <div class="feed-prompt">${data.prompt}</div>
    </div>
  `;

  localStorage.setItem("selectedEmotion", emotion);
  localStorage.setItem("currentMood", emotion);
}

function loadCurrentEmotion() {
  const emotion = localStorage.getItem("currentMood");
  const display = document.getElementById("currentEmotion");
  if (!display) return;

  const names = {
    happy: "😊 Happy",
    sad: "😔 Sad",
    stressed: "😰 Stressed",
    doubt: "🤔 Doubt",
    guilt: "😞 Guilt",
    fear: "😨 Fear",
    anger: "😡 Anger",
    disgust: "🤢 Disgust",
    surprise: "😲 Surprise",
    excited: "🤩 Excited",
    depressed: "🌧 Depressed"
  };

  display.innerText = (emotion && names[emotion]) ? names[emotion] : "😊 Happy";
}

// =====================
// COUNTER
// =====================

const counter = document.getElementById("counter");
if (counter) {
  let count = 0;
  const interval = setInterval(() => {
    count += 25;
    counter.innerText = count;
    if (count >= 5000) {
      clearInterval(interval);
    }
  }, 20);
}

// =====================
// THREE JS BACKGROUND
// =====================

if (document.getElementById("bg") && typeof THREE !== "undefined") {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("bg").appendChild(renderer.domElement);

  camera.position.z = 30;

  const geometry = new THREE.SphereGeometry(0.15, 16, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0x60a5fa });

  for (let i = 0; i < 500; i++) {
    const particle = new THREE.Mesh(geometry, material);
    particle.position.x = (Math.random() - 0.5) * 60;
    particle.position.y = (Math.random() - 0.5) * 60;
    particle.position.z = (Math.random() - 0.5) * 60;
    scene.add(particle);
  }

  function animate() {
    requestAnimationFrame(animate);
    scene.rotation.y += 0.0008;
    scene.rotation.x += 0.0003;
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}