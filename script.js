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
}

// Toggle chat open/close
document.getElementById('chat-toggle').addEventListener('click', () => {
    const chat = document.getElementById('chatbox');
    chat.classList.toggle('open');

    // Start chat when it opens for the first time
    if (chat.classList.contains('open') && !chat.dataset.started) {
        startChat();
        chat.dataset.started = "true";
    }
});

// Start greeting
function startChat() {
    const chat = document.getElementById('chatbox');
    addMessage("Namaskar! 🌿 How are you feeling today?", 'bot');
    addQuickButtons();
    awaitingFeeling = true;
    document.getElementById('userInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
}
