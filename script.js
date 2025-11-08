let data = {};
let awaitingFeeling = false;

// Load JSON
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

// Toggle chat
document.getElementById('chat-toggle').addEventListener('click', () => {
    const chat = document.getElementById('chatbox');
    chat.classList.toggle('open');
});

// Add message to chat
function addMessage(msg, sender) {
    const messages = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerText = msg;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// Get response from JSON
function getResponse(input) {
    if (!input) return null;
    const q = String(input).toLowerCase().trim();

    for (const category in data) {
        const section = data[category];
        for (const key in section) {
            if (key.toLowerCase().includes(q)) return section[key];
            if (typeof section[key] === 'string' && section[key].toLowerCase().includes(q))
                return section[key];
        }
    }
    return null;
}

// Handle user input
function handleUserInput(input) {
    addMessage(input, 'user');

    if (awaitingFeeling) {
        addMessage("I see 🌿 How can I assist you further?", 'bot');
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
    else addMessage("Sorry, I didn’t understand that 🌿 Try asking about medicines, therapy, dosha, or doctors.", 'bot');
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

// Load data on start
loadData();
