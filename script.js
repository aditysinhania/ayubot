let data = {};
let awaitingFeeling = false;

// Load JSON data
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
}

// Add message in chat
function addMessage(msg, sender) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerText = msg;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Add main quick buttons (Timings, Appointment, Doctors)
function addMainButtons() {
  const messages = document.getElementById('messages');
  const existingButtons = messages.querySelectorAll('.main-btn');
  existingButtons.forEach(btn => btn.remove()); // avoid duplicates

  const options = ["Timings", "Appointment", "Doctors"];
  options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'main-btn';
    btn.innerText = option;
    btn.onclick = () => handleUserInput(option);
    messages.appendChild(btn);
  });
}

// Get fuzzy response from data
function getResponse(input) {
  if (!input) return null;
  const q = input.toLowerCase();

  let matches = [];

  // Check all categories in data
  for (const cat in data) {
    const section = data[cat];
    if (typeof section === 'string') {
      if (section.toLowerCase().includes(q)) matches.push(section);
    } else if (typeof section === 'object') {
      for (const key in section) {
        const value = section[key];

        // Direct key match
        if (key.toLowerCase().includes(q)) {
          if (typeof value === 'string') matches.push(value);
          else if (typeof value === 'object') {
            let details = [];
            for (const subKey in value)
              details.push(`${subKey}: ${value[subKey]}`);
            matches.push(details.join(', '));
          }
        }

        // Check inside object values too
        if (typeof value === 'object') {
          for (const subKey in value) {
            if (String(value[subKey]).toLowerCase().includes(q)) {
              matches.push(`${key}: ${value[subKey]}`);
            }
          }
        }

        // Match text values
        if (typeof value === 'string' && value.toLowerCase().includes(q)) {
          matches.push(value);
        }
      }
    }
  }

  // Return combined or null
  if (matches.length > 0) {
    return [...new Set(matches)].slice(0, 3).join('\n\n');
  }
  return null;
}

// Handle user input
function handleUserInput(input) {
  addMessage(input, 'user');

  if (awaitingFeeling) {
    addMessage("I'm glad to hear that 🌿 How can I help you today?", 'bot');
    addMainButtons();
    awaitingFeeling = false;
    return;
  }

  // Greetings
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

  // Get response
  const response = getResponse(input);

  if (response) {
    addMessage(response, 'bot');
  } else {
    addMessage("I'm sorry, I couldn’t find that 🌿 Try asking about timings, appointments, or doctors.", 'bot');
  }

  // Show main buttons after each reply
  addMainButtons();
}

// Send button
document.getElementById('sendBtn').addEventListener('click', () => {
  const input = document.getElementById('userInput').value.trim();
  if (input) handleUserInput(input);
  document.getElementById('userInput').value = '';
});

// Enter key
document.getElementById('userInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('sendBtn').click();
});

// Load data on startup
loadData();
