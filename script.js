document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const apiUrl = 'http://127.0.0.1:5001/api/message'; // URL del backend

    // Función para añadir un mensaje a la UI
    function addMessage(text, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);

        const textElement = document.createElement('p');
        textElement.textContent = text;

        const timestampElement = document.createElement('span');
        timestampElement.classList.add('timestamp');
        const now = new Date();
        timestampElement.textContent = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        messageElement.appendChild(textElement);
        messageElement.appendChild(timestampElement);

        messagesContainer.appendChild(messageElement);
        // Hacer scroll hasta el último mensaje
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Función para enviar un mensaje al backend
    async function sendMessage() {
        const text = messageInput.value.trim();
        if (text === '') return;

        addMessage(text, 'sent');
        messageInput.value = '';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            addMessage(data.reply, 'received');

        } catch (error) {
            console.error('Error al contactar al bot:', error);
            addMessage('No se pudo conectar con el bot. Revisa que el servidor esté funcionando.', 'received');
        }
    }

    // Event Listeners
    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
