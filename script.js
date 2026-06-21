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

// Tracks current quote index per emotion
const quoteIndexMap = {};

const emotionData = {
  happy: {
    label: "😊 Happy",
    color: "#facc15",
    quotes: [
      { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
      { text: "The most wasted of days is one without laughter.", author: "E.E. Cummings" },
      { text: "Joy is not in things; it is in us.", author: "Richard Wagner" },
      { text: "Happiness is a warm cup of tea and a quiet moment.", author: "Unknown" },
      { text: "Count your age by friends, not years. Count your life by smiles, not tears.", author: "John Lennon" }
    ],
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
    quotes: [
      { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
      { text: "Tears are words that the heart can't say.", author: "Unknown" },
      { text: "It's okay to not be okay — just don't stay there.", author: "Unknown" },
      { text: "Grief is the price we pay for love.", author: "Queen Elizabeth II" },
      { text: "You are allowed to be both a masterpiece and a work in progress.", author: "Sophia Bush" }
    ],
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
    quotes: [
      { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
      { text: "Almost everything will work again if you unplug it for a few minutes — including you.", author: "Anne Lamott" },
      { text: "Stress is caused by being here but wanting to be there.", author: "Eckhart Tolle" },
      { text: "Take a deep breath. It's just a bad day, not a bad life.", author: "Unknown" },
      { text: "You were not made for a life of constant rushing.", author: "Unknown" }
    ],
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
    quotes: [
      { text: "Doubt is not a pleasant condition, but certainty is an absurd one.", author: "Voltaire" },
      { text: "The only way to get rid of doubt is to take action.", author: "Unknown" },
      { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
      { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
      { text: "When in doubt, don't. But when ready, go all in.", author: "Unknown" }
    ],
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
    quotes: [
      { text: "Guilt is not a response to anger; it is a response to one's own actions.", author: "Audre Lorde" },
      { text: "Forgive yourself for not knowing what you didn't know before you learned it.", author: "Maya Angelou" },
      { text: "You can't undo the past, but you can choose who you become because of it.", author: "Unknown" },
      { text: "Guilt is just anger directed at ourselves.", author: "Peter McWilliams" },
      { text: "Be gentle with yourself. You are a child of the universe.", author: "Max Ehrmann" }
    ],
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
    quotes: [
      { text: "Fear is only as deep as the mind allows.", author: "Japanese Proverb" },
      { text: "Do one thing every day that scares you.", author: "Eleanor Roosevelt" },
      { text: "Fear is a reaction. Courage is a decision.", author: "Winston Churchill" },
      { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
      { text: "You gain strength every time you face something that frightens you.", author: "Unknown" }
    ],
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
    quotes: [
      { text: "Speak when you are angry and you will make the best speech you will ever regret.", author: "Ambrose Bierce" },
      { text: "Anger is an acid that can do more harm to the vessel in which it is stored than anything on which it is poured.", author: "Mark Twain" },
      { text: "For every minute you remain angry, you give up sixty seconds of peace of mind.", author: "Ralph Waldo Emerson" },
      { text: "Holding onto anger is like drinking poison and expecting the other person to die.", author: "Buddha" },
      { text: "Anger is one letter short of danger.", author: "Eleanor Roosevelt" }
    ],
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
    quotes: [
      { text: "What we see depends mainly on what we look for.", author: "John Lubbock" },
      { text: "The world is a mirror — it reflects what you bring to it.", author: "Unknown" },
      { text: "When something repels you, it often reveals something you value deeply.", author: "Unknown" },
      { text: "Strong reactions are signals worth listening to.", author: "Unknown" },
      { text: "Our disgust is sometimes our integrity speaking.", author: "Unknown" }
    ],
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
    quotes: [
      { text: "Life is full of surprises, but never when you need one.", author: "Bill Watterson" },
      { text: "The universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson" },
      { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
      { text: "Stay open — the best things in life are unexpected.", author: "Unknown" },
      { text: "Wonder is the beginning of wisdom.", author: "Socrates" }
    ],
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
    quotes: [
      { text: "Enthusiasm is the electricity of life.", author: "Gordon Parks" },
      { text: "Nothing great was ever achieved without enthusiasm.", author: "Ralph Waldo Emerson" },
      { text: "Act enthusiastic and you will be enthusiastic.", author: "Dale Carnegie" },
      { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
      { text: "Your excitement is a compass pointing toward your purpose.", author: "Unknown" }
    ],
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
    quotes: [
      { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
      { text: "You don't have to be positive all the time. It's perfectly okay to feel sad.", author: "Lori Deschene" },
      { text: "Out of suffering have emerged the strongest souls.", author: "Kahlil Gibran" },
      { text: "This too shall pass.", author: "Persian Adage" },
      { text: "You are not alone. You are seen. You matter.", author: "Unknown" }
    ],
    tips: [
      "You don't have to feel better right now — just focus on the next hour.",
      "Try to do one very small thing: drink water, open a window, take a shower.",
      "Consider speaking with a counselor or mental health professional."
    ],
    playlist: "Gentle Comfort & Healing Sounds",
    prompt: "What does your body need most right now — rest, connection, movement, or nourishment?"
  }
};

function cycleQuote(emotion) {
  const data = emotionData[emotion];
  if (!data) return;

  // Advance index
  quoteIndexMap[emotion] = ((quoteIndexMap[emotion] ?? 0) + 1) % data.quotes.length;
  const q = data.quotes[quoteIndexMap[emotion]];

  const quoteEl = document.getElementById("feed-quote-text");
  const authorEl = document.getElementById("feed-quote-author");
  const hintEl = document.getElementById("feed-quote-hint");

  if (!quoteEl) return;

  // Fade out → update → fade in
  quoteEl.style.opacity = "0";
  authorEl.style.opacity = "0";

  setTimeout(() => {
    quoteEl.textContent = `"${q.text}"`;
    authorEl.textContent = `— ${q.author}`;
    // Update hint to show current position
    const total = data.quotes.length;
    const current = (quoteIndexMap[emotion] ?? 0) + 1;
    if (hintEl) hintEl.textContent = `Tap for next quote (${current}/${total})`;
    quoteEl.style.opacity = "1";
    authorEl.style.opacity = "1";
  }, 250);
}

function resetEmotionGrid() {
  const grid = document.getElementById("emotionGrid");
  if (!grid) return;

  // Show all buttons again with fade-in
  const buttons = grid.querySelectorAll("button");
  buttons.forEach(btn => {
    btn.classList.remove("active", "hidden-emotion");
    btn.style.opacity = "1";
    btn.style.transform = "scale(1)";
    btn.style.display = "";
  });

  // Remove change button if present
  const changeBtn = document.getElementById("changeEmotionBtn");
  if (changeBtn) changeBtn.remove();

  // Clear feed
  const feed = document.getElementById("emotionFeed");
  if (feed) {
    feed.style.opacity = "0";
    setTimeout(() => {
      feed.innerHTML = "Select an emotion above to see your personalized feed.";
      feed.style.opacity = "1";
    }, 250);
  }
}

function showEmotion(emotion) {
  const feed = document.getElementById("emotionFeed");
  const grid = document.getElementById("emotionGrid");
  if (!feed || !grid) return;

  const data = emotionData[emotion];
  if (!data) return;

  // Reset quote index
  quoteIndexMap[emotion] = 0;
  const q = data.quotes[0];
  const total = data.quotes.length;

  // Step 1: fade out all non-selected buttons
  const allBtns = grid.querySelectorAll("button");
  allBtns.forEach(btn => {
    const isSelected = btn.getAttribute("onclick") === `showEmotion('${emotion}')`;
    if (!isSelected) {
      btn.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      btn.style.opacity = "0";
      btn.style.transform = "scale(0.8)";
    } else {
      btn.style.transition = "transform 0.3s ease";
      btn.style.transform = "scale(1.05)";
      btn.classList.add("active");
    }
  });

  // Step 2: after fade, hide them and shrink grid to one button
  setTimeout(() => {
    allBtns.forEach(btn => {
      const isSelected = btn.getAttribute("onclick") === `showEmotion('${emotion}')`;
      if (!isSelected) {
        btn.style.display = "none";
      }
    });

    // Add "Change Emotion" button below selected if not already there
    if (!document.getElementById("changeEmotionBtn")) {
      const changeBtn = document.createElement("button");
      changeBtn.id = "changeEmotionBtn";
      changeBtn.textContent = "↩ Change Emotion";
      changeBtn.onclick = resetEmotionGrid;
      changeBtn.style.cssText = `
        margin-top: 14px;
        width: 100%;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        color: var(--subtext);
        font-size: 0.85rem;
        padding: 10px 20px;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.2s;
      `;
      changeBtn.onmouseover = () => changeBtn.style.background = "rgba(255,255,255,0.14)";
      changeBtn.onmouseout = () => changeBtn.style.background = "rgba(255,255,255,0.08)";
      grid.after(changeBtn);
    }

    // Step 3: fade in the feed content
    feed.style.opacity = "0";
    feed.style.transition = "opacity 0.4s ease";

    feed.innerHTML = `
      <div class="feed-header" style="border-left: 4px solid ${data.color}; padding-left: 16px; margin-bottom: 24px;">
        <h2 style="font-size:2rem; color:${data.color};">${data.label}</h2>
      </div>

      <div class="feed-section">
        <div class="feed-label">💬 Quote
          <span id="feed-quote-hint" style="
            margin-left:10px; font-size:0.72rem;
            color:var(--secondary); font-weight:600;
            letter-spacing:0; text-transform:none;
          ">Tap for next quote (1/${total})</span>
        </div>
        <blockquote
          class="feed-quote feed-quote-tappable"
          onclick="cycleQuote('${emotion}')"
          title="Tap for next quote"
          style="cursor:pointer;"
        >
          <span id="feed-quote-text" style="transition: opacity 0.25s ease;">"${q.text}"</span>
          <footer>
            <span id="feed-quote-author" style="transition: opacity 0.25s ease;">— ${q.author}</span>
          </footer>
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

    setTimeout(() => {
      feed.style.opacity = "1";
      // Scroll to feed
      feed.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

  }, 300);

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

// =====================
// SIRI-STYLE VOICE AI
// =====================

const VoiceAI = (() => {

  let recognition = null;
  let synth = window.speechSynthesis;
  let isListening = false;
  let isSpeaking = false;

  // Emotion keywords — what the user might say
  const emotionKeywords = {
    happy:    ["happy", "joy", "joyful", "great", "good", "wonderful", "excited about", "amazing", "fantastic", "cheerful", "blessed", "grateful"],
    sad:      ["sad", "unhappy", "cry", "crying", "tears", "heartbroken", "lonely", "lost", "miss", "grief", "down", "low", "blue"],
    stressed: ["stressed", "stress", "overwhelmed", "anxious", "anxiety", "pressure", "too much", "cannot cope", "can't cope", "burnout", "exhausted", "overloaded"],
    doubt:    ["doubt", "unsure", "uncertain", "confused", "don't know", "not sure", "lost", "unclear", "second guess", "hesitant"],
    guilt:    ["guilty", "guilt", "regret", "sorry", "ashamed", "shame", "my fault", "blame myself", "bad person", "mistake"],
    fear:     ["scared", "fear", "afraid", "terrified", "nervous", "frightened", "panic", "worried", "worry", "phobia", "dread"],
    anger:    ["angry", "anger", "mad", "furious", "frustrated", "rage", "irritated", "annoyed", "hate", "livid", "upset"],
    disgust:  ["disgusted", "disgust", "gross", "sick", "revolted", "appalled", "repulsed", "nauseated"],
    surprise: ["surprised", "shocked", "unexpected", "didn't expect", "wow", "unbelievable", "astonished", "amazed"],
    excited:  ["excited", "thrilled", "pumped", "hyped", "can't wait", "looking forward", "enthusiastic", "energized"],
    depressed:["depressed", "depression", "hopeless", "worthless", "empty", "numb", "no point", "give up", "dark", "can't go on"]
  };

  // Greeting responses
  const greetings = [
    "Hi! I'm MindCare AI. How are you feeling right now?",
    "Hello! I'm here for you. Tell me, how are you feeling today?",
    "Hey there. I'm your MindCare companion. What's on your mind?",
    "Welcome back. How is your heart feeling today?"
  ];

  // Fallback when no emotion detected
  const fallbacks = [
    "I didn't quite catch that. Could you tell me how you're feeling? You can say something like sad, happy, stressed, or anxious.",
    "Hmm, I didn't catch an emotion. Try saying how you feel — like happy, sad, scared, or overwhelmed.",
    "I'm listening but couldn't detect an emotion. Try saying — I feel sad, or I am stressed.",
    "Could you say that again? Tell me an emotion like happy, angry, excited, or depressed."
  ];

  function detectEmotion(transcript) {
    const lower = transcript.toLowerCase();
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(k => lower.includes(k))) {
        return emotion;
      }
    }
    return null;
  }

  function speak(text, onEnd) {
    if (!synth) return;
    synth.cancel();
    isSpeaking = true;
    setOrbState("speaking");

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.1;
    utter.volume = 1;

    // Pick a good voice — prefer female English
    const voices = synth.getVoices();
    const preferred = voices.find(v =>
      (v.name.includes("Samantha") || v.name.includes("Google UK English Female") ||
       v.name.includes("Microsoft Zira") || v.name.includes("Karen") ||
       v.name.includes("Moira") || v.name.includes("Victoria")) && v.lang.startsWith("en")
    ) || voices.find(v => v.lang.startsWith("en"));

    if (preferred) utter.voice = preferred;

    utter.onend = () => {
      isSpeaking = false;
      setOrbState("idle");
      if (onEnd) onEnd();
    };
    utter.onerror = () => {
      isSpeaking = false;
      setOrbState("idle");
    };

    synth.speak(utter);
  }

  function setOrbState(state) {
    const orb = document.getElementById("voiceOrb");
    const label = document.getElementById("voiceLabel");
    const transcript = document.getElementById("voiceTranscript");
    if (!orb) return;

    orb.className = "voice-orb";

    if (state === "idle") {
      orb.classList.add("orb-idle");
      if (label) label.textContent = "Tap to speak";
    } else if (state === "listening") {
      orb.classList.add("orb-listening");
      if (label) label.textContent = "Listening...";
      if (transcript) transcript.textContent = "";
    } else if (state === "speaking") {
      orb.classList.add("orb-speaking");
      if (label) label.textContent = "MindCare AI is speaking...";
    } else if (state === "thinking") {
      orb.classList.add("orb-thinking");
      if (label) label.textContent = "Processing...";
    }
  }

  function showTranscript(text) {
    const el = document.getElementById("voiceTranscript");
    if (el) el.textContent = `"${text}"`;
  }

  function startListening() {
    if (isListening || isSpeaking) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;
      setOrbState("listening");
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      showTranscript(transcript);
      setOrbState("thinking");

      setTimeout(() => {
        const emotion = detectEmotion(transcript);
        if (emotion) {
          const data = emotionData[emotion];
          const q = data.quotes[0];
          const tip = data.tips[0];

          // Trigger the visual feed
          if (typeof showEmotion === "function") showEmotion(emotion);

          // Build spoken response
          const response = `I can hear that you're feeling ${data.label.replace(/[^\w\s]/g, "")}. ${q.text} — ${q.author} said that. Remember: ${tip} Take a breath. I'm here with you.`;
          speak(response);
        } else {
          const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
          speak(fallback, () => {
            setTimeout(() => startListening(), 800);
          });
        }
      }, 400);
    };

    recognition.onerror = (e) => {
      isListening = false;
      setOrbState("idle");
      if (e.error === "not-allowed") {
        const el = document.getElementById("voiceTranscript");
        if (el) el.textContent = "Microphone access denied. Please allow mic access in your browser.";
      }
    };

    recognition.onend = () => {
      isListening = false;
    };

    recognition.start();
  }

  function stopAll() {
    if (recognition) recognition.abort();
    if (synth) synth.cancel();
    isListening = false;
    isSpeaking = false;
    setOrbState("idle");
  }

  function greet() {
    const msg = greetings[Math.floor(Math.random() * greetings.length)];
    speak(msg, () => {
      setTimeout(() => startListening(), 600);
    });
  }

  function init() {
    const orb = document.getElementById("voiceOrb");
    if (!orb) return;

    setOrbState("idle");

    orb.addEventListener("click", () => {
      if (isSpeaking) {
        stopAll();
      } else if (isListening) {
        if (recognition) recognition.stop();
        setOrbState("idle");
      } else {
        startListening();
      }
    });

    // Load voices (Chrome needs this)
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = () => {};
    }

    // Auto-greet after short delay
    setTimeout(() => greet(), 1200);
  }

  return { init, startListening, stopAll, speak, greet };

})();

// Init voice AI on voice page
if (document.getElementById("voiceOrb")) {
  window.addEventListener("load", () => VoiceAI.init());
}
