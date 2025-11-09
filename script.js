let data = {};
let awaitingFeeling = false;

// Load data from JSON
async function loadData() {
  try {
    const response = await fetch('vedic_data.json');
    data = await response.json();
  } catch (e) {
    console.error('Failed to load vedic_data.json', e);
    data = {};
  }

  document.getElementById('userInput').disabled = false;
  document.getElementById('sendBtn').disabled = false;

  // Show main buttons on first load
  addMainButtons();
}

// Add a message to chat
function addMessage(msg, sender) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerText = msg;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Add the 3 fixed buttons — visible only once at bottom
function addMainButtons() {
  const container = document.getElementById('main-buttons-container');
  if (container) container.remove(); // remove old one

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

// Get fuzzy match response
function getResponse(input) {
  if (!input) return null;
  const q = input.toLowerCase().trim();

  let matches = [];

  for (const cat in data) {
    const section = data[cat];

    if (typeof section === 'string') {
      if (section.toLowerCase().includes(q)) matches.push(section);
    } else if (typeof section === 'object') {
      for (const key in section) {
        const value = section[key];

        if (key.toLowerCase().includes(q)) {
          if (typeof value === 'string') matches.push(value);
          else if (typeof value === 'object') {
            let details = [];
            for (const subKey in value)
              details.push(`${subKey}: ${value[subKey]}`);
            matches.push(details.join(', '));
          }
        }

        if (typeof value === 'string' && value.toLowerCase().includes(q)) {
          matches.push(value);
        }

        if (typeof value === 'object') {
          for (const subKey in value) {
            if (String(value[subKey]).toLowerCase().includes(q)) {
              matches.push(`${key}: ${value[subKey]}`);
            }
          }
        }
      }
    }
  }

  return matches.length > 0 ? [...new Set(matches)].slice(0, 2).join('\n\n') : null;
}

// Handle user input
function handleUserInput(input) {
  addMessage(input, 'user');

  // Remove old main buttons before new reply
  const oldContainer = document.getElementById('main-buttons-container');
  if (oldContainer) oldContainer.remove();

  if (awaitingFeeling) {
    addMessage("I'm glad to hear that 🌿 How can I help you today?", 'bot');
    awaitingFeeling = false;
    addMainButtons();
    return;
  }

  const greetings = ["hi", "hello", "hey", "namaste", "good morning", "good evening"];
  const byes = ["bye", "goodbye", "see you", "thank you"];

  if (greetings.includes(input.toLowerCase())) {
    addMessage("Namaskar! 🌿 How are you feeling today?", 'bot');
    awaitingFeeling = true;
    return;
  }

  if (byes.includes(input.toLowerCase())) {
    addMessage("Take care 🌿 Stay healthy with Ayurveda!", 'bot');
    return;
  }

  const response = getResponse(input);

  if (response) {
    addMessage(response, 'bot');
  } else {
    addMessage("Sorry 🌿 I didn’t quite get that. Try asking about Timings, Appointment, or Doctors.", 'bot');
  }

  // Add main buttons back
  addMainButtons();
}

// Send and Enter key
document.getElementById('sendBtn').addEventListener('click', () => {
  const input = document.getElementById('userInput').value.trim();
  if (input) handleUserInput(input);
  document.getElementById('userInput').value = '';
});

document.getElementById('userInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('sendBtn').click();
});

// Load JSON on startup
loadData();
