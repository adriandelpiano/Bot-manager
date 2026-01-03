document.addEventListener('DOMContentLoaded', () => {
    // --- Globals ---
    let currentContact = null;

    // --- DOM Elements ---
    const conversationList = document.getElementById('conversation-list');
    const chatView = document.getElementById('chat-view');
    const chatHeader = document.getElementById('chat-header');
    const chatMessages = document.getElementById('chat-messages');
    const messageInputContainer = document.getElementById('chat-input-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // --- Functions ---

    /**
     * Renders a single message in the chat view.
     * @param {object} msg - The message object { sender, content, timestamp }.
     */
    function renderMessage(msg) {
        const messageElement = document.createElement('div');
        // Sender can be 'client', 'bot', or 'human'
        messageElement.classList.add('message', msg.sender.toLowerCase());

        const senderLabel = document.createElement('div');
        senderLabel.classList.add('sender-label');
        
        if (msg.sender.toLowerCase() === 'human') {
            senderLabel.textContent = 'Tú (Manual)';
        } else if (msg.sender.toLowerCase() === 'bot') {
            senderLabel.textContent = 'Bot';
        } else {
            // For 'client', we don't show a label as it's implied.
        }

        const contentElement = document.createElement('p');
        contentElement.textContent = msg.content;
        
        const timestampElement = document.createElement('span');
        timestampElement.classList.add('timestamp');
        // Format timestamp like '14:05'
        const date = new Date(msg.timestamp);
        timestampElement.textContent = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        if(senderLabel.textContent) messageElement.appendChild(senderLabel);
        messageElement.appendChild(contentElement);
        messageElement.appendChild(timestampElement);
        chatMessages.appendChild(messageElement);
    }

    /**
     * Fetches and displays messages for a given phone number.
     * @param {string} phoneNumber - The phone number of the contact.
     */
    async function loadMessages(phoneNumber) {
        chatMessages.innerHTML = 'Cargando mensajes...';
        try {
            const response = await fetch(`/api/messages/${phoneNumber}`);
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            
            const messages = await response.json();
            chatMessages.innerHTML = ''; // Clear loading message
            messages.forEach(renderMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
        } catch (error) {
            console.error('Error cargando mensajes:', error);
            chatMessages.innerHTML = `<div class="message client"><p>Error al cargar mensajes. ${error.message}</p></div>`;
        }
    }

    /**
     * Sets the currently active conversation and loads its messages.
     * @param {object} contact - The contact object for the conversation.
     */
    function selectConversation(contact, conversationElement) {
        currentContact = contact;

        // Update header
        chatHeader.innerHTML = `<h3>${contact.name || contact.phone_number}</h3>`;
        
        // Show message input
        messageInputContainer.style.display = 'flex';

        // Update selected item in the list
        document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('selected'));
        conversationElement.classList.add('selected');

        // Load messages
        loadMessages(contact.phone_number);
    }

    /**
     * Fetches all conversations and populates the sidebar.
     */
    async function loadConversations() {
        try {
            const response = await fetch('/api/conversations');
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

            const conversations = await response.json();
            conversationList.innerHTML = ''; // Clear loading message

            if (conversations.length === 0) {
                conversationList.innerHTML = '<div class="conversation-item"><p>No hay conversaciones.</p></div>';
                return;
            }

            conversations.forEach(conv => {
                const item = document.createElement('div');
                item.classList.add('conversation-item');
                item.dataset.phoneNumber = conv.phone_number;

                const name = conv.name || conv.phone_number;
                const lastMessage = conv.last_message_content || 'No hay mensajes.';
                const status = conv.is_human_intervening ? 'HUMANO' : 'BOT';

                item.innerHTML = `
                    <h4>${name}</h4>
                    <p>${lastMessage}</p>
                    <p class="status ${status.toLowerCase()}">Modo: ${status}</p>
                `;

                item.addEventListener('click', () => selectConversation(conv, item));
                conversationList.appendChild(item);
            });
        } catch (error) {
            console.error('Error cargando conversaciones:', error);
            conversationList.innerHTML = `<div class="conversation-item"><p>Error al cargar chats. ${error.message}</p></div>`;
        }
    }

    /**
     * Sends a manual message from the input box.
     */
    async function sendManualMessage() {
        const messageText = messageInput.value.trim();
        if (!messageText || !currentContact) return;

        try {
            const response = await fetch('/api/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number: currentContact.phone_number,
                    message: messageText
                })
            });

            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            
            messageInput.value = ''; // Clear input

            // Optimistically render the sent message, but it's better to reload
            // to get the confirmed timestamp and order from the database.
            // A small delay allows the DB to update before we fetch.
            setTimeout(() => {
                loadMessages(currentContact.phone_number);
            }, 500);

        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            // Optionally, show an error message in the chat
        }
    }

    // --- Event Listeners ---
    sendButton.addEventListener('click', sendManualMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendManualMessage();
        }
    });

    // --- Initial Load ---
    loadConversations();
});
