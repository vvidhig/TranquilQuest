const chatBox = document.getElementById('chat-box');
const userForm = document.getElementById('user-form');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = userInput.value;
  appendMessage('You', userMessage);

  // Send user message to the server
  const response = await fetch('/chatbot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question: userMessage }),
  });

  const data = await response.json();
  const botReply = data.reply;

  appendMessage('Bot', botReply);

  userInput.value = '';
});

function appendMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatBox.appendChild(messageElement);
}
