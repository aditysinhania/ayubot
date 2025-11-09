let data = {};
let awaitingFeeling = false;

// Load data
async function loadData() {
  try {
    const response = await fetch('vedic_data.json');
    data = await response.json();
  } catch {
    console.error('Failed to load data');
    data = {};
  }
  document.getElementById('userInput').disabled = false;
  document.getElementById('sendBtn').disabled = false;
}

// Chat toggle
document.getElementById('chat-toggle').addEventListener('click', () => {
  const chat = document.getElementById('chatbox');
  const assist = document.getElementById('assist-text');
  chat.classList.toggle('open');

  if (chat.classList.contains('open')) {
    assist.style.opacity = '0';
    setTimeout(() => (assist.style.display = 'none'), 300);
  } else {
    assist.style.display = 'block';
    setTimeout(() => (assist.style.opacity = '1'), 100);
  }
});

// Add message
function addMessage(msg, sender) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerText = msg;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// --- Fuzzy match helper ---
function similarity(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  const same = longer.split('').filter((ch, i) => shorter[i] === ch).length;
  return same / longerLength;
}

// --- Get smart response ---
function getResponse(input) {
  if (!input) return null;
  const q = input.toLowerCase().trim();
  let bestMatch = null;
  let bestScore = 0;

  for (const category in data) {
    const section = data[category];
    for (const key in section) {
      const score = similarity(q, key);
      if (score > bestScore && score > 0.75) {
        bestScore = score;
        bestMatch = section[key];
      }
    }
  }

  return bestMatch;
}

// --- Handle user input ---
function handleUserInput(input) {
  addMessage(input, 'user');

  if (awaitingFeeling) {
    addMessage("That's great 🌿 How can I help you today?", 'bot');
    awaitingFeeling = false;
    return;
  }

  const greetings = ["hi", "hello", "hey", "namaste", "good morning", "good evening"];
  if (greetings.includes(input.toLowerCase())) {
    addMessage("Namaste! 🌿 How are you feeling today?", 'bot');
    awaitingFeeling = true;
    return;
  }

  const response = getResponse(input);
  if (response) addMessage(response, 'bot');
  else addMessage("Sorry, I didn’t quite get that 🌿 Try asking about medicines, therapy, dosha, or doctors.", 'bot');
}

// --- Send & enter key ---
document.getElementById('sendBtn').addEventListener('click', () => {
  const input = document.getElementById('userInput').value.trim();
  if (input) handleUserInput(input);
  document.getElementById('userInput').value = '';
});
document.getElementById('userInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('sendBtn').click();
});

// --- Initialize ---
loadData();
