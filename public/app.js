document.addEventListener('DOMContentLoaded', () => {
    const messagesDiv = document.getElementById('messages');
    const inputField = document.getElementById('input');
    const sendButton = document.getElementById('send-button');

    const appendMessage = (text, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = text;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the bottom
    };

    const sendMessage = async (message) => {
        appendMessage(message, 'user');
        inputField.value = '';

        try {
            const response = await fetch('http://localhost:5000/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });
            const data = await response.json();
            appendMessage(data.english, 'ai'); // Display English response first
            appendMessage(data.arabic, 'ai-arabic'); // Display Arabic response next
        } catch (error) {
            console.error('Error sending message:', error);
            appendMessage('Sorry, there was an error.', 'ai');
        }
    };

    sendButton.addEventListener('click', () => {
        const message = inputField.value.trim();
        if (message) {
            sendMessage(message);
        }
    });

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendButton.click();
        }
    });
});
