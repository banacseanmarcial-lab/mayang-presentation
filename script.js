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
    showToast("Login Successful! Welcome back 👋", "success");
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
      showToast("Passwords do not match ❌", "error");
      return;
    }

    showToast("Account Created Successfully 🎉", "success");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 1000);
  });
}

// =====================
// AI CHAT
// =====================

// Chat history for context
const chatHistory = [];

async function sendMessage() {
  const input    = document.getElementById("messageInput");
  const messages = document.getElementById("messages");
  if (!input || !messages) return;

  const text = input.value.trim();
  if (text === "") return;

  // Show user message
  messages.innerHTML += `
    <div class="chat-bubble user-bubble">
      <span class="bubble-label">You</span>
      <p>${text}</p>
    </div>`;
  messages.scrollTop = messages.scrollHeight;
  input.value = "";

  detectRisk(text);

  // Add to history
  chatHistory.push({ role: "user", content: text });

  // Typing indicator
  const typingId = "typing-" + Date.now();
  messages.innerHTML += `
    <div class="chat-bubble ai-bubble" id="${typingId}">
      <span class="bubble-label">MindCare AI</span>
      <p class="typing-dots"><span></span><span></span><span></span></p>
    </div>`;
  messages.scrollTop = messages.scrollHeight;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: `You are MindCare AI, a warm, empathetic mental wellness companion. 
Your role is to provide emotional support, active listening, and gentle guidance.
Keep responses concise (2-4 sentences), compassionate, and focused on the user's emotional wellbeing.
Never diagnose. Always encourage professional help for serious issues.
The user's current mood is: ${localStorage.getItem("currentMood") || "unknown"}.`,
        messages: chatHistory.slice(-10)
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I'm here for you. Could you tell me more?";

    // Remove typing indicator
    document.getElementById(typingId)?.remove();

    // Add AI reply to history
    chatHistory.push({ role: "assistant", content: reply });

    messages.innerHTML += `
      <div class="chat-bubble ai-bubble">
        <span class="bubble-label">MindCare AI 🧠</span>
        <p>${reply}</p>
      </div>`;
    messages.scrollTop = messages.scrollHeight;

  } catch (err) {
    document.getElementById(typingId)?.remove();
    messages.innerHTML += `
      <div class="chat-bubble ai-bubble">
        <span class="bubble-label">MindCare AI 🧠</span>
        <p>I'm here for you. Sometimes words are hard to find — take your time. 💙</p>
      </div>`;
    messages.scrollTop = messages.scrollHeight;
  }
}

function detectRisk(message) {
  const warningWords = ["hopeless", "give up", "suicide", "end my life"];
  const risk = warningWords.some(word => message.toLowerCase().includes(word));

  if (risk) {
    showToast("💙 You matter. Please reach out to a counselor or call a crisis line if you feel unsafe.", "warning", 8000);
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
  showToast("Journal entry saved 📔", "success");
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
  showToast("Profile updated ✅", "success");
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
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0",
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
    spotifyUrl: "https://open.spotify.com/playlist/7ABD15iASBIpPP5uJ5awvq",
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
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX9uKNf5jGX6m",
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
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWYtDSKIiDhua",
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
    spotifyUrl: "https://open.spotify.com/playlist/3hstVxyKHTqOs2wlIl6RbI",
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
    spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DXaImRpG7HXqp",
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
    spotifyUrl: "https://open.spotify.com/playlist/1xdEaBisiJRDotBWbQGmnd",
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
    spotifyUrl: "https://open.spotify.com/playlist/0okKcRyYEwq8guFxzAPtlB",
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
    spotifyUrl: "https://open.spotify.com/playlist/1WAQIk6Vkbc9MDlmul0wuk",
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
    spotifyUrl: "https://open.spotify.com/playlist/0deORnapZgrxFY4nsKr9JA",
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
    spotifyUrl: "https://open.spotify.com/playlist/3RJhsyXXNoZ5kFP6kGCHmV",
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
        <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
          <div class="feed-playlist">${data.playlist}</div>
          <a href="${data.spotifyUrl}" target="_blank" rel="noopener" class="spotify-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Open in Spotify
          </a>
        </div>
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
  saveMoodHistory(emotion);
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

  let recognition    = null;
  let synth          = window.speechSynthesis;
  let isListening    = false;
  let isSpeaking     = false;
  let resultReceived = false;

  // Safe debug logger — works even on pages without the debug panel
  function debugLog(msg) {
    if (typeof window.debugLog === "function") window.debugLog(msg);
    else console.log("[VoiceAI]", msg);
  }

  const emotionKeywords = {
    happy:     ["happy","joy","joyful","great","good","wonderful","amazing","fantastic","cheerful","blessed","grateful","fine","doing well"],
    sad:       ["sad","unhappy","cry","crying","tears","heartbroken","lonely","miss","grief","down","low","blue","upset","miserable","depressing"],
    stressed:  ["stressed","stress","overwhelmed","anxious","anxiety","pressure","too much","cannot cope","can't cope","burnout","exhausted","overloaded","tension"],
    doubt:     ["doubt","unsure","uncertain","confused","don't know","not sure","unclear","second guess","hesitant","indecisive"],
    guilt:     ["guilty","guilt","regret","sorry","ashamed","shame","my fault","blame myself","mistake","did wrong"],
    fear:      ["scared","fear","afraid","terrified","nervous","frightened","panic","worried","worry","phobia","dread","anxious about"],
    anger:     ["angry","anger","mad","furious","frustrated","rage","irritated","annoyed","hate","livid","pissed"],
    disgust:   ["disgusted","disgust","gross","sick","revolted","appalled","repulsed","nauseated","yuck"],
    surprise:  ["surprised","shocked","unexpected","wow","unbelievable","astonished","amazed","can't believe"],
    excited:   ["excited","thrilled","pumped","hyped","can't wait","looking forward","enthusiastic","energized","stoked"],
    depressed: ["depressed","depression","hopeless","worthless","empty","numb","no point","give up","dark","can't go on","no motivation","meaningless"]
  };

  const greetings = [
    "Hi! I'm MindCare AI. How are you feeling right now?",
    "Hello! I'm here for you. Tell me, how are you feeling today?",
    "Hey there. I'm your MindCare companion. What's on your mind?",
    "Welcome back. How is your heart feeling today?"
  ];

  const fallbacks = [
    "I didn't quite catch that. Try saying something like — I feel sad, or I am really stressed.",
    "Hmm, I couldn't detect an emotion. Say something like — happy, sad, scared, or overwhelmed.",
    "Could you say that again? Tell me how you feel — angry, excited, depressed, or anxious.",
    "I'm listening. Try saying — I feel lonely, or I'm feeling really anxious today."
  ];

  // ── Helpers ──

  function detectEmotion(transcript) {
    const lower = transcript.toLowerCase();
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(k => lower.includes(k))) return emotion;
    }
    return null;
  }

  function setOrbState(state) {
    const orb   = document.getElementById("voiceOrb");
    const label = document.getElementById("voiceLabel");
    const trans = document.getElementById("voiceTranscript");
    if (!orb) return;

    orb.className = "voice-orb";
    if (state === "idle") {
      orb.classList.add("orb-idle");
      if (label) label.textContent = "Tap to speak";
    } else if (state === "listening") {
      orb.classList.add("orb-listening");
      if (label) label.textContent = "Listening...";
      if (trans && trans.textContent === "") trans.textContent = "Say how you're feeling...";
    } else if (state === "speaking") {
      orb.classList.add("orb-speaking");
      if (label) label.textContent = "MindCare AI is speaking...";
    } else if (state === "thinking") {
      orb.classList.add("orb-thinking");
      if (label) label.textContent = "Understanding...";
    }
  }

  function showTranscript(text) {
    const el = document.getElementById("voiceTranscript");
    if (el) el.textContent = `"${text}"`;
  }

  function getVoice() {
    const voices = synth.getVoices();
    return (
      voices.find(v => v.name.includes("Samantha") && v.lang.startsWith("en")) ||
      voices.find(v => v.name.includes("Google UK English Female")) ||
      voices.find(v => v.name.includes("Microsoft Zira")) ||
      voices.find(v => v.name.includes("Karen")) ||
      voices.find(v => v.lang.startsWith("en-")) ||
      voices[0]
    );
  }

  function speak(text, onEnd) {
    if (!synth) { if (onEnd) onEnd(); return; }

    // Always cancel first and wait a tick — Chrome needs this gap
    synth.cancel();

    setTimeout(() => {
      isSpeaking = true;
      setOrbState("speaking");
      debugLog("Speaking: " + text.substring(0, 60) + "...");

      const doSpeak = () => {
        const utter  = new SpeechSynthesisUtterance(text);
        utter.rate   = 0.9;
        utter.pitch  = 1.0;
        utter.volume = 1;

        const voice  = getVoice();
        if (voice) { utter.voice = voice; debugLog("Voice: " + voice.name); }
        else { debugLog("Voice: default"); }

        let ended = false;
        const finish = () => {
          if (ended) return;
          ended     = true;
          isSpeaking = false;
          setOrbState("idle");
          debugLog("Speech done.");
          if (onEnd) onEnd();
        };

        utter.onend   = finish;
        utter.onerror = (e) => {
          debugLog("Speech error: " + e.error);
          if (e.error === "interrupted") return;
          finish();
        };

        synth.speak(utter);

        // Chrome watchdog — if still speaking after 30s something froze
        const watchdog = setInterval(() => {
          if (!synth.speaking) { clearInterval(watchdog); finish(); }
          else if (synth.paused) synth.resume();
        }, 500);

        // Hard timeout safety — 60 seconds max
        setTimeout(() => { clearInterval(watchdog); finish(); }, 60000);
      };

      if (synth.getVoices().length === 0) {
        debugLog("Waiting for voices...");
        synth.onvoiceschanged = () => { synth.onvoiceschanged = null; doSpeak(); };
      } else {
        doSpeak();
      }
    }, 150); // wait 150ms after cancel before speaking
  }

  // ── Core: listen ──

  function startListening() {
    if (isListening || isSpeaking) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showToast("Voice recognition is not supported. Please use Chrome or Edge.", "error");
      return;
    }

    resultReceived = false;
    recognition    = new SR();
    recognition.lang             = "en-US";
    recognition.interimResults   = false;
    recognition.maxAlternatives  = 3;
    recognition.continuous       = false;

    recognition.onstart = () => {
      isListening    = true;
      resultReceived = false;
      setOrbState("listening");
      debugLog("Mic started — listening...");
    };

    recognition.onresult = (e) => {
      resultReceived = true;
      isListening    = false;

      // Merge all alternatives for better accuracy
      const transcript = Array.from(e.results[0])
        .map(r => r.transcript).join(" ");

      debugLog("Heard: " + transcript);
      showTranscript(transcript);
      setOrbState("thinking");

      const emotion = detectEmotion(transcript);
      debugLog("Emotion detected: " + (emotion || "none"));

      if (emotion) {
        const data = emotionData[emotion];
        const q    = data.quotes[Math.floor(Math.random() * data.quotes.length)];
        const tip  = data.tips[0];
        const name = data.label.replace(/[^\w\s]/g, "").trim();

        // Render the emotion feed card
        if (typeof window.showEmotion === "function") {
          setTimeout(() => window.showEmotion(emotion), 200);
        }

        // Show result panel on voice page
        const resultEl = document.getElementById("voiceEmotionResult");
        if (resultEl) {
          setTimeout(() => {
            resultEl.classList.add("visible");
            resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 500);
        }

        const response = `I hear you. You are feeling ${name}. Here is a thought for you: ${q.text}, by ${q.author}. Here is something that might help: ${tip}. You are not alone. I am here with you.`;
        setTimeout(() => speak(response), 300);

      } else {
        const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        setTimeout(() => {
          speak(fallback, () => setTimeout(() => startListening(), 800));
        }, 300);
      }
    };

    recognition.onerror = (e) => {
      isListening    = false;
      resultReceived = true; // prevent onend from showing "nothing heard"
      debugLog("Recognition error: " + e.error);
      const trans    = document.getElementById("voiceTranscript");

      if (e.error === "not-allowed") {
        setOrbState("idle");
        if (trans) trans.textContent = "Microphone access denied. Please allow mic access in your browser settings.";
      } else if (e.error === "no-speech") {
        setOrbState("idle");
        if (trans) trans.textContent = "No speech detected. Tap the orb and try again.";
      } else {
        setOrbState("idle");
      }
    };

    recognition.onend = () => {
      isListening = false;
      debugLog("Recognition ended. resultReceived=" + resultReceived);
      if (!resultReceived) {
        setOrbState("idle");
        const trans = document.getElementById("voiceTranscript");
        if (trans) trans.textContent = "I didn't hear anything. Tap the orb and try again.";
      }
    };

    recognition.start();
  }

  function stopAll() {
    if (recognition) recognition.abort();
    if (synth) synth.cancel();
    isListening  = false;
    isSpeaking   = false;
    setOrbState("idle");
  }

  function greet() {
    const msg = greetings[Math.floor(Math.random() * greetings.length)];
    speak(msg, () => setTimeout(() => startListening(), 700));
  }

  function init() {
    const orb = document.getElementById("voiceOrb");
    if (!orb) return;

    setOrbState("idle");

    // Preload voices
    synth.getVoices();
    if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = () => {};

    orb.addEventListener("click", () => {
      if (isSpeaking)      { stopAll(); }
      else if (isListening){ recognition.stop(); setOrbState("idle"); }
      else                 { startListening(); }
    });

    setTimeout(() => greet(), 1000);
  }

  return { init, startListening, stopAll, speak, greet };

})();

// Init only on voice page
if (document.getElementById("voiceOrb")) {
  window.addEventListener("load", () => VoiceAI.init());
}


// =====================
// TOAST NOTIFICATIONS
// =====================

function showToast(message, type = "success", duration = 4000) {
  const container = document.getElementById("toastContainer") || createToastContainer();

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" style="
      background:none; border:none; color:inherit;
      font-size:1.1rem; cursor:pointer; padding:0 0 0 10px; opacity:0.7;">✕</button>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add("toast-show"), 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

function createToastContainer() {
  const div = document.createElement("div");
  div.id = "toastContainer";
  div.style.cssText = `
    position: fixed; bottom: 24px; right: 24px;
    display: flex; flex-direction: column; gap: 10px;
    z-index: 9999; max-width: 360px;
  `;
  document.body.appendChild(div);
  return div;
}

// =====================
// MOOD HISTORY TRACKER
// =====================

function saveMoodHistory(emotion) {
  const history = JSON.parse(localStorage.getItem("moodHistory") || "[]");
  history.push({
    emotion,
    date: new Date().toISOString(),
    label: new Date().toLocaleDateString()
  });
  // Keep last 30 entries
  if (history.length > 30) history.shift();
  localStorage.setItem("moodHistory", JSON.stringify(history));
  updateStreak();
}

function getMoodHistory() {
  return JSON.parse(localStorage.getItem("moodHistory") || "[]");
}

function renderMoodChart() {
  const canvas = document.getElementById("moodChart");
  if (!canvas || typeof Chart === "undefined") return;

  const history = getMoodHistory().slice(-7);
  if (history.length === 0) return;

  const emotionScores = {
    excited: 10, happy: 9, surprise: 7, grateful: 8,
    calm: 7, doubt: 5, guilt: 4, fear: 3,
    stressed: 3, anger: 2, sad: 2, depressed: 1
  };

  const labels = history.map(h => h.label);
  const scores = history.map(h => emotionScores[h.emotion] || 5);
  const colors = scores.map(s =>
    s >= 8 ? "#6ee7b7" : s >= 5 ? "#fde68a" : "#f87171"
  );

  // Destroy old chart if exists
  if (window._moodChart) window._moodChart.destroy();

  window._moodChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Mood Score",
        data: scores,
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96,165,250,0.1)",
        pointBackgroundColor: colors,
        pointRadius: 6,
        pointHoverRadius: 9,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const e = history[ctx.dataIndex]?.emotion || "";
              return ` ${e} (${ctx.raw}/10)`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 0, max: 10,
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        x: {
          ticks: { color: "#94a3b8" },
          grid: { color: "rgba(255,255,255,0.05)" }
        }
      }
    }
  });
}

// =====================
// STREAK COUNTER
// =====================

function updateStreak() {
  const history = getMoodHistory();
  if (history.length === 0) return;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const dates = [...new Set(history.map(h => new Date(h.date).toDateString()))];
  const lastDate = dates[dates.length - 1];

  let streak = parseInt(localStorage.getItem("streak") || "0");
  const lastStreak = localStorage.getItem("lastStreakDate");

  if (lastDate === today && lastStreak !== today) {
    if (lastStreak === yesterday) streak++;
    else if (!lastStreak) streak = 1;
    else streak = 1;
    localStorage.setItem("streak", streak);
    localStorage.setItem("lastStreakDate", today);

    // Milestone toasts
    if (streak === 3)  showToast("🔥 3-day streak! Keep it up!", "success");
    if (streak === 7)  { showToast("🏆 7-day streak! Amazing dedication!", "success"); launchConfetti(); }
    if (streak === 30) { showToast("🌟 30-day streak! You are incredible!", "success"); launchConfetti(); }
  }

  const el = document.getElementById("streakCount");
  if (el) el.textContent = streak;
}

function loadStreak() {
  const el = document.getElementById("streakCount");
  if (el) el.textContent = localStorage.getItem("streak") || "0";
}

// =====================
// CONFETTI
// =====================

function launchConfetti() {
  const colors = ["#60a5fa","#a855f7","#f472b6","#fde68a","#6ee7b7","#f97316"];
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:9998;pointer-events:none;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    r: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 4 + 2,
    rot: Math.random() * 360,
    vrot: (Math.random() - 0.5) * 8
  }));

  let frame = 0;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.rot += p.vrot; p.vy += 0.1;
    });
    frame++;
    if (frame < 180) requestAnimationFrame(animate);
    else canvas.remove();
  };
  animate();
}

// =====================
// DAILY AFFIRMATIONS
// =====================

const affirmations = [
  "You are enough, exactly as you are. 💙",
  "Every day is a new beginning. Take a deep breath and start again.",
  "Your feelings are valid. You are seen and heard.",
  "You have survived every hard day so far. You can do this.",
  "Growth happens one small step at a time. Be patient with yourself.",
  "You deserve peace, rest, and joy.",
  "Your mental health matters. Taking care of yourself is brave.",
  "You are not your worst day. You are so much more.",
  "It's okay to ask for help. Strength is knowing when to reach out.",
  "Today, choose yourself. You are worth it.",
  "Small progress is still progress. Be proud of how far you've come.",
  "You bring value to the world simply by being you.",
  "Breathe. This moment will pass. You are safe.",
  "You are worthy of love, connection, and happiness.",
  "Healing is not linear. Every step counts."
];

function loadAffirmation() {
  const el = document.getElementById("dailyAffirmation");
  if (!el) return;
  // Same affirmation all day, changes daily
  const dayIndex = Math.floor(Date.now() / 86400000) % affirmations.length;
  el.textContent = affirmations[dayIndex];
}

// =====================
// AI JOURNAL ANALYSIS
// =====================

async function analyzeJournalWithAI() {
  const entry = document.getElementById("journalEntry")?.value?.trim();
  const mood  = document.getElementById("mood")?.value;
  const resultEl = document.getElementById("journalAIInsight");

  if (!entry || entry.length < 20) {
    showToast("Write at least a sentence before analyzing 📝", "warning");
    return;
  }

  if (resultEl) {
    resultEl.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    resultEl.style.display = "block";
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `You are a compassionate mental wellness AI. Analyze this journal entry and provide a warm, insightful 2-3 sentence emotional reflection. Identify the core emotion, validate the feeling, and offer one gentle encouragement. Be concise and human.

Mood selected: ${mood}
Journal entry: "${entry}"`
        }]
      })
    });

    const data = await response.json();
    const insight = data.content?.[0]?.text || "Your feelings are valid and worth exploring. Keep writing.";

    if (resultEl) {
      resultEl.innerHTML = `
        <div style="display:flex; align-items:flex-start; gap:10px;">
          <span style="font-size:1.4rem;">🧠</span>
          <div>
            <div style="font-size:0.75rem; font-weight:700; color:var(--secondary); margin-bottom:6px; text-transform:uppercase; letter-spacing:0.05em;">AI Insight</div>
            <p style="line-height:1.7; color:var(--text);">${insight}</p>
          </div>
        </div>`;
    }

  } catch(err) {
    if (resultEl) resultEl.innerHTML = `<p style="color:var(--subtext);">Could not analyze right now. Your feelings are always valid. 💙</p>`;
  }
}

// =====================
// PAGE TRANSITIONS
// =====================

function navigateTo(url) {
  document.body.classList.add("page-exit");
  setTimeout(() => { window.location.href = url; }, 300);
}

// Fade in on load
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-enter");
  setTimeout(() => document.body.classList.remove("page-enter"), 500);

  // Init features
  loadAffirmation();
  loadStreak();
  renderMoodChart();
});

// =====================
// WEEKLY WELLNESS REPORT
// =====================

function generateWeeklyReport() {
  const history = getMoodHistory().slice(-7);
  const el = document.getElementById("weeklyReport");
  if (!el || history.length === 0) return;

  const emotionCounts = {};
  history.forEach(h => {
    emotionCounts[h.emotion] = (emotionCounts[h.emotion] || 0) + 1;
  });

  const topEmotion = Object.entries(emotionCounts).sort((a,b) => b[1]-a[1])[0];
  const totalEntries = history.length;
  const positiveEmotions = ["happy","excited","surprise","grateful"];
  const positiveCount = history.filter(h => positiveEmotions.includes(h.emotion)).length;
  const positiveRate = Math.round((positiveCount / totalEntries) * 100);

  el.innerHTML = `
    <div class="report-grid">
      <div class="report-stat">
        <div class="report-num">${totalEntries}</div>
        <div class="report-label">Check-ins this week</div>
      </div>
      <div class="report-stat">
        <div class="report-num">${positiveRate}%</div>
        <div class="report-label">Positive mood rate</div>
      </div>
      <div class="report-stat">
        <div class="report-num">${topEmotion ? topEmotion[0] : "—"}</div>
        <div class="report-label">Most felt emotion</div>
      </div>
    </div>
    <p style="color:var(--subtext); font-size:0.9rem; margin-top:16px; line-height:1.6;">
      ${positiveRate >= 60
        ? "✨ You had a great week emotionally! Keep nurturing what brings you joy."
        : positiveRate >= 40
        ? "💙 It was a mixed week. Remember — every emotion is valid and part of growth."
        : "🌧 It looks like a tough week. Be gentle with yourself. Better days are coming."}
    </p>
  `;
}
// =====================
// SLEEP TRACKER
// =====================
function saveSleep() {
  const hours = document.getElementById("sleepHours")?.value;
  const quality = localStorage.getItem("sleepStars") || "3";
  const notes = document.getElementById("sleepNotes")?.value || "";
  if (!hours) { showToast("Enter sleep hours 😴", "warning"); return; }
  const logs = JSON.parse(localStorage.getItem("sleepLogs") || "[]");
  logs.unshift({ hours: parseFloat(hours), quality: parseInt(quality), notes, date: new Date().toLocaleString(), dateISO: new Date().toISOString() });
  if (logs.length > 30) logs.pop();
  localStorage.setItem("sleepLogs", JSON.stringify(logs));
  loadSleepLog();
  showToast("Sleep logged 😴", "success");
}
function setSleepStar(val) {
  localStorage.setItem("sleepStars", val);
  document.querySelectorAll(".sleep-star").forEach((s, i) => s.classList.toggle("active", i < val));
}
function loadSleepLog() {
  const el = document.getElementById("sleepLog"); if (!el) return;
  const logs = JSON.parse(localStorage.getItem("sleepLogs") || "[]");
  if (!logs.length) { el.innerHTML = '<em style="color:var(--subtext)">No sleep logs yet.</em>'; return; }
  el.innerHTML = logs.map(l => `
    <div style="padding:14px 18px;background:rgba(255,255,255,.04);border-radius:12px;border:1px solid rgba(255,255,255,.08);margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <div><strong>${l.hours}h</strong> — ${"⭐".repeat(l.quality)} <span style="color:var(--subtext);font-size:.82rem;">${l.notes}</span></div>
      <span style="color:var(--subtext);font-size:.78rem;">${l.date}</span>
    </div>`).join("");
}
function renderSleepChart() {
  const canvas = document.getElementById("sleepChart");
  if (!canvas || typeof Chart === "undefined") return;
  const logs = JSON.parse(localStorage.getItem("sleepLogs") || "[]").slice(0, 7).reverse();
  if (!logs.length) return;
  if (window._sleepChart) window._sleepChart.destroy();
  window._sleepChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: logs.map(l => new Date(l.dateISO).toLocaleDateString(undefined, { weekday: "short" })),
      datasets: [{ label: "Hours", data: logs.map(l => l.hours), backgroundColor: logs.map(l => l.hours >= 7 ? "rgba(110,231,183,.6)" : l.hours >= 5 ? "rgba(253,230,138,.6)" : "rgba(248,113,113,.6)"), borderRadius: 8 }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 12, ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,.05)" } }, x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,.05)" } } } }
  });
}

// =====================
// GOALS TRACKER
// =====================
function loadGoals() {
  const el = document.getElementById("goalList"); if (!el) return;
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  if (!goals.length) { el.innerHTML = '<em style="color:var(--subtext)">No goals yet. Add one above!</em>'; updateGoalProgress(); return; }
  el.innerHTML = goals.map((g, i) => `
    <div style="padding:16px 20px;background:rgba(255,255,255,.04);border-radius:14px;border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:14px;margin-bottom:12px;">
      <div onclick="toggleGoal(${i})" style="width:22px;height:22px;border-radius:6px;border:2px solid var(--primary);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.2s;${g.done ? 'background:var(--primary)' : ''}">${g.done ? "✓" : ""}</div>
      <div style="flex:1;font-size:.95rem;${g.done ? 'text-decoration:line-through;color:var(--subtext)' : ''}">${g.text}</div>
      <button onclick="deleteGoal(${i})" style="background:none;border:none;color:var(--subtext);cursor:pointer;font-size:1.1rem;">🗑</button>
    </div>`).join("");
  updateGoalProgress();
}
function addGoal() {
  const inp = document.getElementById("goalInput"); if (!inp || !inp.value.trim()) return;
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  goals.push({ text: inp.value.trim(), done: false });
  localStorage.setItem("goals", JSON.stringify(goals));
  inp.value = ""; loadGoals();
  showToast("Goal added 🎯", "success");
}
function toggleGoal(i) {
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  goals[i].done = !goals[i].done;
  localStorage.setItem("goals", JSON.stringify(goals));
  loadGoals();
  if (goals[i].done) showToast("Goal completed! 🎉", "success");
}
function deleteGoal(i) {
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  goals.splice(i, 1);
  localStorage.setItem("goals", JSON.stringify(goals));
  loadGoals();
}
function updateGoalProgress() {
  const goals = JSON.parse(localStorage.getItem("goals") || "[]");
  const done = goals.filter(g => g.done).length;
  const pct = goals.length ? Math.round((done / goals.length) * 100) : 0;
  const bar = document.getElementById("goalProgressBar");
  const txt = document.getElementById("goalProgressText");
  if (bar) bar.style.width = pct + "%";
  if (txt) txt.textContent = `${done}/${goals.length} goals completed (${pct}%)`;
}

// =====================
// GRATITUDE JOURNAL
// =====================
function loadGratitude() {
  const el = document.getElementById("gratitudeList"); if (!el) return;
  const items = JSON.parse(localStorage.getItem("gratitude") || "[]");
  if (!items.length) { el.innerHTML = '<em style="color:var(--subtext)">Nothing yet. What are you grateful for today?</em>'; return; }
  el.innerHTML = items.map(g => `
    <div style="padding:16px 20px;background:rgba(245,158,11,.06);border-radius:14px;border:1px solid rgba(245,158,11,.18);margin-bottom:10px;">
      <div style="font-size:.93rem;line-height:1.6;">${g.text}</div>
      <div style="font-size:.72rem;color:var(--subtext);margin-top:4px;">${g.date}</div>
    </div>`).join("");
}
function addGratitude() {
  const inp = document.getElementById("gratitudeInput"); if (!inp || !inp.value.trim()) return;
  const items = JSON.parse(localStorage.getItem("gratitude") || "[]");
  items.unshift({ text: inp.value.trim(), date: new Date().toLocaleString() });
  if (items.length > 50) items.pop();
  localStorage.setItem("gratitude", JSON.stringify(items));
  inp.value = ""; loadGratitude();
  showToast("Added to gratitude journal 🌻", "success");
}

// =====================
// MEMORY NOTES
// =====================
function loadMemories() {
  const el = document.getElementById("memoryList"); if (!el) return;
  const items = JSON.parse(localStorage.getItem("memories") || "[]");
  if (!items.length) { el.innerHTML = '<em style="color:var(--subtext)">No memories saved yet.</em>'; return; }
  el.innerHTML = items.map(m => `
    <div style="padding:20px 24px;border-radius:16px;margin-bottom:14px;border-left:4px solid var(--accent);background:rgba(168,85,247,.06);border:1px solid rgba(168,85,247,.15);">
      <div style="margin-bottom:8px;">${m.text}</div>
      <div>${(m.tags || []).map(t => `<span style="display:inline-block;padding:3px 10px;border-radius:20px;background:rgba(168,85,247,.15);color:#c084fc;font-size:.72rem;font-weight:700;margin-right:6px;">#${t}</span>`).join("")}</div>
      <div style="font-size:.72rem;color:var(--subtext);margin-top:8px;">${m.date}</div>
    </div>`).join("");
}
function addMemory() {
  const inp = document.getElementById("memoryInput");
  const tagInp = document.getElementById("memoryTags");
  if (!inp || !inp.value.trim()) return;
  const tags = tagInp ? tagInp.value.split(",").map(t => t.trim()).filter(Boolean) : [];
  const items = JSON.parse(localStorage.getItem("memories") || "[]");
  items.unshift({ text: inp.value.trim(), tags, date: new Date().toLocaleString() });
  localStorage.setItem("memories", JSON.stringify(items));
  inp.value = ""; if (tagInp) tagInp.value = "";
  loadMemories();
  showToast("Memory saved 💜", "success");
}

// =====================
// ACHIEVEMENTS
// =====================
function loadAchievements() {
  const el = document.getElementById("achievementGrid"); if (!el) return;
  const streak = parseInt(localStorage.getItem("streak") || "0");
  const journal = JSON.parse(localStorage.getItem("mindcareJournal") || "[]").length;
  const mood = JSON.parse(localStorage.getItem("moodHistory") || "[]").length;
  const achievements = [
    { icon: "🌱", name: "First Step",      desc: "Log your first emotion",           unlocked: mood >= 1 },
    { icon: "🔥", name: "3-Day Streak",    desc: "Check in 3 days in a row",         unlocked: streak >= 3 },
    { icon: "📔", name: "Journaler",       desc: "Write 5 journal entries",           unlocked: journal >= 5 },
    { icon: "🏆", name: "Week Warrior",    desc: "7-day check-in streak",             unlocked: streak >= 7 },
    { icon: "🧘", name: "Zen Master",      desc: "Complete 5 breathing sessions",     unlocked: parseInt(localStorage.getItem("breathSessions") || "0") >= 5 },
    { icon: "💬", name: "Chat Explorer",   desc: "Send 10 messages to AI",            unlocked: parseInt(localStorage.getItem("chatCount") || "0") >= 10 },
    { icon: "🎯", name: "Goal Getter",     desc: "Complete 3 goals",                  unlocked: JSON.parse(localStorage.getItem("goals") || "[]").filter(g => g.done).length >= 3 },
    { icon: "🌟", name: "30-Day Legend",   desc: "30-day check-in streak",            unlocked: streak >= 30 },
    { icon: "😴", name: "Sleep Tracker",   desc: "Log sleep 7 times",                 unlocked: JSON.parse(localStorage.getItem("sleepLogs") || "[]").length >= 7 },
    { icon: "🙏", name: "Grateful Heart",  desc: "Add 10 gratitude entries",          unlocked: JSON.parse(localStorage.getItem("gratitude") || "[]").length >= 10 },
    { icon: "🎵", name: "Mood Maestro",    desc: "Try all 11 emotions",               unlocked: [...new Set(JSON.parse(localStorage.getItem("moodHistory") || "[]").map(h => h.emotion))].length >= 11 },
    { icon: "💎", name: "Premium Member",  desc: "Subscribe to MindCare Premium",     unlocked: localStorage.getItem("mc_subscribed") === "true" },
  ];
  el.innerHTML = achievements.map(a => `
    <div style="padding:24px 16px;text-align:center;border-radius:18px;border:1px solid var(--border);background:var(--card);transition:.25s;${a.unlocked ? '' : 'opacity:.4;filter:grayscale(1)'}">
      <div style="font-size:2.6rem;margin-bottom:10px;">${a.icon}</div>
      <div style="font-weight:800;font-size:.9rem;margin-bottom:4px;">${a.name}</div>
      <div style="font-size:.78rem;color:var(--subtext);">${a.desc}</div>
      <div style="margin-top:8px;font-size:.75rem;font-weight:700;color:${a.unlocked ? '#6ee7b7' : 'var(--subtext)'};">${a.unlocked ? '✅ Unlocked' : '🔒 Locked'}</div>
    </div>`).join("");
}

// =====================
// MOOD ANALYTICS
// =====================
function loadMoodAnalytics() {
  const canvas = document.getElementById("analyticsChart");
  const history = getMoodHistory();
  const emotionCounts = {};
  history.forEach(h => { emotionCounts[h.emotion] = (emotionCounts[h.emotion] || 0) + 1; });
  const labels = Object.keys(emotionCounts);
  const data = Object.values(emotionCounts);
  const colors = ["#facc15","#60a5fa","#f97316","#a78bfa","#94a3b8","#818cf8","#ef4444","#84cc16","#fb923c","#f59e0b","#475569"];
  if (canvas && typeof Chart !== "undefined" && labels.length) {
    if (window._analyticsChart) window._analyticsChart.destroy();
    window._analyticsChart = new Chart(canvas, {
      type: "doughnut",
      data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 0 }] },
      options: { responsive: true, plugins: { legend: { position: "bottom", labels: { color: "#94a3b8", padding: 16, font: { size: 12 } } } } }
    });
  }
  const totalEl = document.getElementById("totalCheckins"); if (totalEl) totalEl.textContent = history.length;
  const posEl = document.getElementById("positivePct");
  if (posEl) { const pos = history.filter(h => ["happy","excited","surprise"].includes(h.emotion)).length; posEl.textContent = history.length ? Math.round((pos / history.length) * 100) + "%" : "0%"; }
  const topEl = document.getElementById("topEmotion");
  if (topEl && labels.length) { const topIdx = data.indexOf(Math.max(...data)); topEl.textContent = labels[topIdx] || "—"; }
  const streakEl = document.getElementById("analyticsStreak");
  if (streakEl) streakEl.textContent = (localStorage.getItem("streak") || "0") + " days";
}

// =====================
// APPOINTMENTS
// =====================
function getAppointments() {
  return JSON.parse(localStorage.getItem("appointments") || "[]");
}
function saveAppointments(arr) {
  localStorage.setItem("appointments", JSON.stringify(arr));
}
function renderAppointmentStats() {
  const appts = getAppointments();
  const statsEl = document.getElementById("apptStats"); if (!statsEl) return;
  const stats = [
    { label: "Total", val: appts.length, color: "#60a5fa" },
    { label: "Pending", val: appts.filter(a => a.status === "pending").length, color: "#fde68a" },
    { label: "Confirmed", val: appts.filter(a => a.status === "confirmed").length, color: "#6ee7b7" },
    { label: "Completed", val: appts.filter(a => a.status === "completed").length, color: "#a78bfa" },
  ];
  statsEl.innerHTML = stats.map(s => `
    <div style="padding:16px;border-radius:14px;text-align:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);">
      <div style="font-size:1.8rem;font-weight:900;color:${s.color};">${s.val}</div>
      <div style="font-size:.72rem;color:var(--subtext);font-weight:700;text-transform:uppercase;letter-spacing:.04em;">${s.label}</div>
    </div>`).join("");
}
function renderAppointmentList(filter) {
  const el = document.getElementById("apptList"); if (!el) return;
  const appts = getAppointments().filter(a => !filter || filter === "all" || a.status === filter);
  if (!appts.length) {
    el.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--subtext);">
      <div style="font-size:3rem;margin-bottom:16px;">📅</div>
      <p>No ${filter && filter !== "all" ? filter : ""} appointments yet.</p><br>
      <a href="doctors.html" class="btn">🩺 Find a Doctor</a>
    </div>`;
    return;
  }
  el.innerHTML = appts.map(a => `
    <div style="padding:22px 24px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);margin-bottom:16px;display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap;transition:.2s;">
      <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#a855f7);display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0;">${a.doctorEmoji || "👨‍⚕️"}</div>
      <div style="flex:1;min-width:180px;">
        <div style="font-size:1rem;font-weight:800;margin-bottom:4px;">${a.doctorName}</div>
        <div style="font-size:.8rem;color:var(--subtext);margin-bottom:10px;">${a.doctorSpec}</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
          <span style="font-size:.78rem;padding:4px 12px;border-radius:20px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:var(--subtext);">📅 ${a.day} at ${a.time}</span>
          <span style="font-size:.78rem;padding:4px 12px;border-radius:20px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:var(--subtext);">${a.type === "online" ? "💻 Online" : "🏥 In-Person"}</span>
          <span style="font-size:.78rem;padding:4px 12px;border-radius:20px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:var(--subtext);">💰 ${a.fee}</span>
        </div>
        <div style="font-size:.8rem;color:var(--subtext);margin-bottom:12px;">Reason: ${a.reason}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <span style="padding:5px 14px;border-radius:20px;font-size:.75rem;font-weight:800;${
            a.status === "pending"   ? "background:rgba(245,158,11,.15);color:#fde68a;border:1px solid rgba(245,158,11,.3);" :
            a.status === "confirmed" ? "background:rgba(16,185,129,.15);color:#6ee7b7;border:1px solid rgba(16,185,129,.3);" :
            a.status === "completed" ? "background:rgba(96,165,250,.15);color:#93c5fd;border:1px solid rgba(96,165,250,.3);" :
                                       "background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3);"
          }">${a.status === "pending" ? "⏳ Pending" : a.status === "confirmed" ? "✅ Confirmed" : a.status === "completed" ? "🏁 Completed" : "❌ Cancelled"}</span>
          ${a.status === "pending" || a.status === "confirmed" ? `
            <button onclick="markApptDone(${a.id})" style="padding:6px 14px;font-size:.75rem;border-radius:10px;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.25);color:#6ee7b7;cursor:pointer;">✅ Complete</button>
            <button onclick="cancelAppt(${a.id})" style="padding:6px 14px;font-size:.75rem;border-radius:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171;cursor:pointer;">❌ Cancel</button>` : ""}
          <button onclick="deleteAppt(${a.id})" style="padding:6px 10px;font-size:.75rem;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:var(--subtext);cursor:pointer;">🗑</button>
        </div>
        <div style="font-size:.7rem;color:var(--subtext);margin-top:8px;">Booked on ${a.bookedOn}</div>
      </div>
    </div>`).join("");
}
function markApptDone(id) {
  const appts = getAppointments();
  const idx = appts.findIndex(a => a.id === id);
  if (idx > -1) { appts[idx].status = "completed"; saveAppointments(appts); }
  renderAppointmentStats(); renderAppointmentList(window._apptFilter || "all");
  showToast("Marked as completed ✅", "success");
}
function cancelAppt(id) {
  if (!confirm("Cancel this appointment?")) return;
  const appts = getAppointments();
  const idx = appts.findIndex(a => a.id === id);
  if (idx > -1) { appts[idx].status = "cancelled"; saveAppointments(appts); }
  renderAppointmentStats(); renderAppointmentList(window._apptFilter || "all");
  showToast("Appointment cancelled", "info");
}
function deleteAppt(id) {
  if (!confirm("Remove this appointment?")) return;
  saveAppointments(getAppointments().filter(a => a.id !== id));
  renderAppointmentStats(); renderAppointmentList(window._apptFilter || "all");
  showToast("Removed", "info");
}
function filterApptsByStatus(btn, status) {
  window._apptFilter = status;
  document.querySelectorAll(".appt-tab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderAppointmentList(status);
}

// Auto-init appointments page
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("apptList")) {
    window._apptFilter = "all";
    renderAppointmentStats();
    renderAppointmentList("all");
  }
});