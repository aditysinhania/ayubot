let data = {};
let awaitingFeeling = false;

// Load JSON
async function loadData() {
  try {
    const response = await fetch('vedic_data.json?v=2');
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
    { label: "Doctors", value: "doctor" }
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

// ************** UPDATED RESPONSE SYSTEM **************
function getResponse(input) {
  if (!input) return null;
  const q = input.toLowerCase();

  // Greetings
  if (data.greetings[q]) {
    return data.greetings[q];
  }

  // Ayurveda explanation
  if (q.includes("what is ayurveda") || q.includes("ayurveda")) {
    return data.general["what is ayurveda"];
  }

  // Doctors (only names)
  if (q === "doctor" || q === "doctors") {
    return Object.values(data.doctors)
      .map(doc => doc.name)
      .join("\n\n");
  }

  // Timings (name + timing)
  if (q === "timing" || q === "timings") {
    return Object.values(data.doctors)
      .map(doc => `${doc.name} — ${doc.timing}`)
      .join("\n\n");
  }

  // Appointment
  if (q.includes("appointment")) {
    return data.appointment.details;
  }

  return null;
}

// ************** FEELING LOGIC **************
function handleFeeling(input) {
  const positive = ["good", "fine", "great", "well", "awesome", "better", "happy"];
  const negative = ["bad", "not good", "sad", "sick", "not well", "upset", "tired", "weak", "pain"];

  const q = input.toLowerCase();

  if (positive.some(word => q.includes(word))) {
    return "I'm glad to hear that! 🌿 Wishing you continued wellness. How can I assist you today?";
  }

  if (negative.some(word => q.includes(word))) {
    return "I’m sorry you're not feeling well. 🌿 Ayurveda can help restore balance. How can I support you today?";
  }

  return "Thank you for sharing that 🌿 How can I assist you today?";
}

// ************** MAIN HANDLER **************
function handleUserInput(input) {
  addMessage(input, 'user');

  const oldButtons = document.getElementById('main-buttons-container');
  if (oldButtons) oldButtons.remove();

  // Feeling response
  if (awaitingFeeling) {
    const reply = handleFeeling(input);
    addMessage(reply, 'bot');
    awaitingFeeling = false;
    addMainButtons();
    return;
  }

  // Detect greetings that ask "How are you?"
  const greetingWords = ["hi", "hello", "hey", "namaskar", "namaskara", "namaste"];
  if (greetingWords.includes(input.toLowerCase())) {
    addMessage("Namaskara! 🌿 How are you feeling today?", 'bot');
    awaitingFeeling = true;
    return;
  }

  const res = getResponse(input);

  if (res) {
    addMessage(res, 'bot');
  } else {
    addMessage("Sorry 🌿 I didn’t get that. Try asking: Timings, Appointment, or Doctors.", 'bot');
  }

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

// Init
loadData();
