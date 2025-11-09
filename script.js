let data = {};
let awaitingFeeling = false;

// Load JSON data
async function loadData() {
  try {
    const response = await fetch('vedic_data.json');
    data = await response.json();
  } catch (e) {
    console.error('Failed to load vedic_data.json', e);
  }

  document.getElementById('userInput').disabled = false;
  document.getElementById('sendBtn').disabled = false;
}

// Toggle Chat
document.getElementById('chat-toggle').addEventListener('click', () => {
  const chatbox = document.getElementById('chatbox');
  const assist = document.getElementById('assist-text');

  chatbox.classList.toggle('open');
  if (chatbox.classList.contains('open')) {
    assist.style.opacity = '0';
    setTimeout(() => (assist.style.display = 'none'), 200);
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

// Add main buttons
function addMainButtons() {
  const container = document.getElementById('main-buttons-container');
  if (container) container.remove();

  const messages = document.getElementById('messages');
  const wrapper = document.createElement('div');
  wrapper.id = 'main-buttons-container';

  const buttons = [
    { label: "Timings", value: "timings" },
    { label: "Appointment", value: "appointment" },
    { label: "Doctors", value: "doctors" }
  ];

  buttons.forEach(btn => {
    const b = document.createElement('button');
    b.className = 'main-btn';
    b.innerText = btn.label;
    b.onclick = () => handleUserInput(btn.value);
    wrapper.appendChild(b);
  });

  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

// Fuzzy data match
function getResponse(input) {
  if (!input) return null;
  const q = input.toLowerCase();
  let matches = [];

  for (const cat in data) {
    const section = data[cat];
    if (typeof section === 'string' && section.toLowerCase().includes(q))
      matches.push(section);
    else if (typeof section === 'object') {
      for (const key in section) {
        const value = section[key];
        if (key.toLowerCase().includes(q)) {
          if (typeof value === 'string') matches.push(value);
          else if (typeof value === 'object') {
            let details = [];
            for (const sub in value)
              details.push(`${sub}: ${value[sub]}`);
            matches.push(details.join(', '));
          }
        }
        if (typeof value === 'string' && value.toLowerCase().includes(q))
          matches.push(value);
        if (typeof value === 'object') {
          for (const sub in value)
            if (String(value[sub]).toLowerCase().includes(q))
              matches.push(`${key}: ${value[sub]}`);
        }
      }
    }
  }

  return matches.length ? [...new Set(matches)].slice(0, 2).join('\n\n') : null;
}

// Handle input
function handleUserInput(input) {
  addMessage(input, 'user');
  const oldButtons = document.getElementById('main-buttons-container');
  if (oldButtons) oldButtons.remove();

  if (awaitingFeeling) {
    addMessage("I'm glad to hear that 🌿 How can I help you today?", 'bot');
    awaitingFeeling = false;
    addMainButtons();
    return;
  }

  const greetings = ["hi", "hello", "hey", "namaste"];
  const byes = ["bye", "goodbye", "see you"];

  if (greetings.includes(input.toLowerCase())) {
    addMessage("Namaskar! 🌿 How are you feeling today?", 'bot');
    awaitingFeeling = true;
    return;
  }

  if (byes.includes(input.toLowerCase())) {
    addMessage("Take care 🌿 Stay healthy with Ayurveda!", 'bot');
    return;
  }

  const res = getResponse(input);
  if (res) addMessage(res, 'bot');
  else addMessage("Sorry 🌿 I didn’t quite get that. Try asking about Timings, Appointment, or Doctors.", 'bot');

  addMainButtons();
}

// Send and Enter
document.getElementById('sendBtn').addEventListener('click', () => {
  const input = document.getElementById('userInput').value.trim();
  if (input) handleUserInput(input);
  document.getElementById('userInput').value = '';
});
document.getElementById('userInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('sendBtn').click();
});

// Initialize
loadData();
