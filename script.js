let data = {};
let awaitingFeeling = false;

// Load JSON data
async function loadData() {
  try {
    const response = await fetch("vedic_data.json");
    data = await response.json();
  } catch (e) {
    console.error("Failed to load vedic_data.json", e);
    data = {};
  }
  document.getElementById("userInput").disabled = false;
  document.getElementById("sendBtn").disabled = false;
}

// Toggle Chatbox
document.getElementById("chat-toggle").addEventListener("click", () => {
  const chat = document.getElementById("chatbox");
  chat.classList.toggle("open");
});

// Add message to chat
function addMessage(msg, sender) {
  const messages = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerText = msg;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Add quick buttons below chat
function addQuickButtons() {
  const messages = document.getElementById("messages");
  messages.querySelectorAll(".quick-btn").forEach((btn) => btn.remove());

  const btnData = [
    { text: "Timings", value: "timings" },
    { text: "Appointment", value: "appointment" },
    { text: "Medicines", value: "medicines" },
  ];

  btnData.forEach((b) => {
    const btn = document.createElement("button");
    btn.className = "faq-btn quick-btn";
    btn.innerText = b.text;
    btn.onclick = () => handleUserInput(b.value);
    messages.appendChild(btn);
  });
}

// Determine the bot’s response
function getResponse(input) {
  const q = String(input).toLowerCase().trim();

  // Greetings
  const greetings = ["hi", "hello", "hey", "namaste", "good morning", "good evening"];
  if (greetings.some((word) => q.includes(word))) {
    awaitingFeeling = true;
    return "Namaskar! 🌿 How are you feeling today?";
  }

  // Feelings
  const feelings = ["good", "fine", "okay", "not good", "bad", "better", "tired", "happy", "sad"];
  if (awaitingFeeling && feelings.some((word) => q.includes(word))) {
    awaitingFeeling = false;
    return "I'm glad to hear that 🌿. How can I assist you today?";
  }

  // Farewells
  const farewells = ["bye", "goodbye", "see you", "tata"];
  if (farewells.some((word) => q.includes(word))) {
    return "Goodbye! 🌿 Stay healthy and take care.";
  }

  // Timings
  if (q.includes("timing") || q.includes("hours")) {
    let timings = "";
    if (data.doctors) {
      for (const key in data.doctors) {
        const doc = data.doctors[key];
        timings += `${doc.name} — ${doc.timing}\n\n`;
      }
    } else timings = "Our doctors are available Monday–Saturday, 9 AM–7 PM.";
    return timings.trim();
  }

  // Appointment
  if (q.includes("appointment") || q.includes("book")) {
    return (
      data.general?.appointment ||
      "You can book an appointment by calling +91-7892141002 or +91-(80)-40944666."
    );
  }

  // Medicines
  if (q.includes("medicine") || q.includes("herb")) {
    if (data.medicines) {
      return Object.keys(data.medicines)
        .map((m) => `${m}: ${data.medicines[m]}`)
        .join("\n\n");
    }
    return "We offer Ayurvedic medicines like Ashwagandha, Triphala, Brahmi, and Chyawanprash.";
  }

  // Default fallback
  return "Sorry, I didn’t quite get that. 🌿 Try asking about timings, appointment, or medicines.";
}

// Handle user messages
function handleUserInput(input) {
  if (!input) return;
  addMessage(input, "user");
  const response = getResponse(input);
  addMessage(response, "bot");
  addQuickButtons();
}

// Send message button
document.getElementById("sendBtn").addEventListener("click", () => {
  const input = document.getElementById("userInput").value.trim();
  if (input) handleUserInput(input);
  document.getElementById("userInput").value = "";
});

// Press Enter to send
document
  .getElementById("userInput")
  .addEventListener("keypress", (e) => {
    if (e.key === "Enter") document.getElementById("sendBtn").click();
  });

// Start chatbot
loadData();
