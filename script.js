let data = {};
let awaitingFeeling = false;

// Load JSON Data
async function loadData() {
    try {
        const response = await fetch('vedic_data.json');
        data = await response.json();
    } catch (e) {
        console.error('Failed to load vedic_data.json', e);
        data = {};
    }
}

// Start the chat after user opens it
function startChat() {
    addMessage("Namaskar! 🌿 How are you feeling today?", 'bot');
    addQuickButtons();
    awaitingFeeling = true;
    document.getElementById('userInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
}

    // When opened for the first time, load data and greet
    if (chat.classList.contains('open') && !chat.dataset.started) {
        loadData();
        startChat();
        chat.dataset.started = "true";
    }
});

// Add Message Function
function addMessage(msg, sender) {
    const messages = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerText = msg;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// Add Quick Buttons
function addQuickButtons() {
    const messages = document.getElementById('messages');
    messages.querySelectorAll('.quick-btn').forEach(btn => btn.remove());

    const btnData = [
        { text: 'Timings', value: 'timings' },
        { text: 'Appointment', value: 'appointment' },
        { text: 'Medicines', value: 'medicines' }
    ];

    btnData.forEach(b => {
        const btn = document.createElement('button');
        btn.className = 'faq-btn quick-btn';
        btn.innerText = b.text;
        btn.onclick = () => handleUserInput(b.value);
        messages.appendChild(btn);
    });
}

// Handle User Input
function handleUserInput(input) {
    addMessage(input, 'user');
    const lower = input.toLowerCase();

    const greetings = ["hi", "hello", "hey", "namaste", "good morning", "good evening"];
    const farewells = ["bye", "goodbye", "see you", "tata"];
    const feelingReplies = ["good", "fine", "okay", "not good", "bad", "better", "tired", "happy", "sad"];

    if (greetings.includes(lower)) {
        addMessage("Namaskar! 🌿 How are you feeling today?", 'bot');
        addQuickButtons();
        awaitingFeeling = true;
        return;
    }

    if (farewells.includes(lower)) {
        addMessage("Goodbye! 🌿 Stay healthy and take care.", 'bot');
        addQuickButtons();
        return;
    }

    if (awaitingFeeling && feelingReplies.includes(lower)) {
        addMessage("I see 🌿", 'bot');
        awaitingFeeling = false;
        addQuickButtons();
        return;
    }

    const response = getResponse(input);
    if (response) {
        addMessage(response, 'bot');
    } else {
        addMessage("Sorry, I didn’t quite get that. 🌿 Try asking about timings, appointment, or medicines.", 'bot');
    }

    addQuickButtons();
}

// Get Bot Response
function getResponse(input) {
    const q = String(input).toLowerCase().trim();

    if (q.includes('timing') || q.includes('hours')) {
        let timings = '';
        if (data.doctors) {
            for (const key in data.doctors) {
                const doc = data.doctors[key];
                timings += `${doc.name} — ${doc.timing}\n\n`;
            }
        } else timings = 'Our doctors are available Monday–Saturday, 9 AM–7 PM.';
        return timings.trim();
    }

    if (q.includes('appointment') || q.includes('book')) {
        if (data.general && data.general.appointment) return data.general.appointment;
        return 'You can book an appointment by calling +91-7892141002 or +91-(80)-40944666 or through our website.';
    }

    if (q.includes('medicine') || q.includes('herb')) {
        if (data.medicines) {
            return Object.keys(data.medicines)
                .map(m => `${m}: ${data.medicines[m]}`)
                .join('\n\n');
        }
        return 'We offer Ayurvedic medicines like Ashwagandha, Triphala, Brahmi, and Chyawanprash.';
    }

    const response = searchData(q);
    return response;
}

// Search Fallback
function searchData(q) {
    if (!data || typeof data !== 'object') return null;
    q = q.toLowerCase();

    for (const category in data) {
        const section = data[category];
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

// Send Button Event
document.getElementById('sendBtn').addEventListener('click', () => {
    const input = document.getElementById('userInput').value.trim();
    if (input) handleUserInput(input);
    document.getElementById('userInput').value = '';
});

// Enter Key Event
document.getElementById('userInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') document.getElementById('sendBtn').click();
});

// Disable input until chat is opened
document.getElementById('userInput').disabled = true;
document.getElementById('sendBtn').disabled = true;

