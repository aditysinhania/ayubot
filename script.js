let data = {};
let awaitingFeeling = false;

async function loadData() {
  try {
    const response = await fetch('vedic_data.json');
    data = await response.json();
  } catch {
    console.error('Failed to load vedic_data.json');
  }
  document.getElementById('userInput').disabled = false;
  document.getElementById('sendBtn').disabled = false;
}

// Toggle chat visibility
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

// Basic response
function getResponse(input) {
  const q = input.toLowerCase();
  for (const cat in data) {
    const sec = data[cat];
    for (const key in sec) {
      if (q.includes(key.toLowerCase())) return sec[key];
    }
  }
  return null;
}

// Handle user input
function handleUserInput(input) {
  addMessage(input, 'user');
  if (awaitingFeeling) {
    addMessage("That's great 🌿 How can I help you today?", 'bot');
    awaitingFeeling = false;
    return;
  }

  const greetings = ["hi", "hello", "hey", "namaste"];
  if (greetings.includes(input.toLowerCase())) {
    addMessage("Namaste! 🌿 How are you feeling today?", 'bot');
    awaitingFeeling = true;
    return;
  }

  const res = getResponse(input);
  if (res) addMessage(res, 'bot');
  else addMessage("Sorry, I didn’t quite get that 🌿 Try asking about medicines, dosha, or therapy.", 'bot');
}

document.getElementById('sendBtn').addEventListener('click', () => {
  const input = document.getElementById('userInput').value.trim();
  if (input) handleUserInput(input);
  document.getElementById('userInput').value = '';
});

document.getElementById('userInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('sendBtn').click();
});

loadData();
