let data = {};
let awaitingFeeling = false;

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

// Add a message
function addMessage(msg, sender) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.innerText = msg;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Get response
function getResponse(input) {
  if (!input) return null;
  const q = String(input).toLowerCase();

  if (q.includes('timing') || q.includes('hours')) {
    let result = '';
    if (data.doctors) {
      for (const key in data.doctors) {
        const doc = data.doctors[key];
        result += `${doc.name} — ${doc.timing}\n\n`;
      }
    } else result = 'Our doctors are available Monday–Saturday, 9 AM–7 PM.';
    return result.trim();
  }

  if (q.includes('appointment')) {
    return data.general?.appointment || 'You can book appointments at +91-9876543210 or our website.';
  }

  if (q.includes('medicine') || q.includes('herb')) {
    if (data.medicines) {
      return Object.keys(data.medicines)
        .map(k => `${k}: ${data.medicines[k]}`)
        .join('\n\n');
    }
    return 'We offer Ayurvedic medicines like Ashwagandha, Triphala, and Brahmi.';
  }

  for (const cat in data) {
    const section = data[cat];
    if (typeof section === 'object') {
      for (const key in section) {
        if (key.toLowerCase().includes(q) || String(section[key]).toLowerCase().includes(q)) {
          return typeof section[key] === 'string'
            ? section[key]
            : JSON.stringify(section[key]);
        }
      }
    }
  }

  return null;
}

// Handle user input
function handleUserInput(input) {
  addMessage(input, 'user');

  const lower = input.toLowerCase();
  const greetings = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good evening'];
  const farewells = ['bye', 'goodbye', 'see you', 'tata', 'see ya'];
  const feelingReplies = ['good', 'fine', 'okay', 'not good', 'bad', 'better', 'tired', 'happy', 'sad'];

  if (greetings.includes(lower)) {
    addMessage('Namaste! 🌿 How are you feeling today?', 'bot');
    awaitingFeeling = true;
    return;
  }

  if (farewells.includes(lower)) {
    addMessage('Goodbye! 🌿 Stay healthy and take care.', 'bot');
    return;
  }

  if (awaitingFeeling && feelingReplies.includes(lower)) {
    addMessage('I see 🌿', 'bot');
    awaitingFeeling = false;
    return;
  }

  const response = getResponse(input);
  if (response) addMessage(response, 'bot');
  else addMessage("Sorry, I didn’t quite get that. 🌿 Try asking about timings, appointment, or medicines.", 'bot');
}

// Button & input listeners
document.getElementById('sendBtn').addEventListener('click', () => {
  const input = document.getElementById('userInput').value.trim();
  if (input) handleUserInput(input);
  document.getElementById('userInput').value = '';
});
document.getElementById('userInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('sendBtn').click();
});

loadData();
