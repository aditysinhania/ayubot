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
const chatToggle = document.getElementById('chat-toggle');
if (chatToggle) {
  chatToggle.addEventListener('click', () => {
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
}

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
  const oldButtons = document.getElementById('main-buttons-container');
  if (oldButtons) oldButtons.remove();

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

// Enhanced response function
function getResponse(input) {
  if (!input) return null;
  const q = input.toLowerCase();
  let matches = [];

  // Handle singular/plural flexibility
  const normalize = (text) =>
    text.endsWith('s') ? text.slice(0, -1) : text + 's';

  // 1️⃣ Exact top-level match
  for (const category in data) {
    if (
      category.toLowerCase() === q ||
      normalize(category.toLowerCase()) === normalize(q)
    ) {
      const section = data[category];
      if (typeof section === 'string') return section;
      if (typeof section === 'object') {
        let reply = [];
        for (const key in section) {
          const value = section[key];
          if (typeof value === 'object') {
            const details = [];
            for (const subKey in value) {
              details.push(`${subKey}: ${value[subKey]}`);
            }
            reply.push(`${value.name || key.replace(/_/g, ' ')} — ${details.join(', ')}`);
          } else {
            reply.push(`${key.replace(/_/g, ' ')}: ${value}`);
          }
        }
        return reply.join('\n\n');
      }
    }
  }

  // 2️⃣ Search deep inside objects
  for (const cat in data) {
    const section = data[cat];

    if (typeof section === 'string' && section.toLowerCase().includes(q))
      matches.push(section);

    if (typeof section === 'object') {
      for (const key in section) {
        const value = section[key];
        const keyMatch =
          key.toLowerCase().includes(q) ||
          normalize(key.toLowerCase()).includes(normalize(q));

        if (keyMatch) {
          if (typeof value === 'string') matches.push(value);
          else if (typeof value === 'object') {
            let details = [];
            for (const subKey in value) {
              details.push(`${subKey}: ${value[subKey]}`);
            }
            matches.push(details.join(', '));
          }
        }

        if (typeof value === 'string' && value.toLowerCase().includes(q))
          matches.push(value);

        if (typeof value === 'object') {
          for (const subKey in value) {
            const subVal = String(value[subKey]).toLowerCase();
            if (
              subKey.toLowerCase().includes(q) ||
              subVal.includes(q) ||
              normalize(subKey.toLowerCase()).includes(normalize(q))
            ) {
              matches.push(
                `${value.name || key.replace(/_/g, ' ')} — ${subKey}: ${value[subKey]}`
              );
            }
          }
        }
      }
    }
  }

  // 3️⃣ Clean response
  if (matches.length === 0) return null;
  return [...new Set(matches)].slice(0, 3).join('\n\n');
}

// Handle user input
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

// Send / Enter key
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
