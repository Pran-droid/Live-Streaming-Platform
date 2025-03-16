let socket;
let userId;
let eventId;
function connect() {
    userId = document.getElementById('userId').value;
    socket = io();
    socket.on('userJoined', (data) => {
        appendMessage(`${data.userId} joined the event.`);
    });
    socket.on('userLeft', (data) => {
        appendMessage(`${data.userId} left the event.`);
    });
    socket.on('participantList', (participants) => {
        console.log('Participants:', participants);
    });
    socket.on('receiveMessage', (data) => {
        appendMessage(`${data.senderId}: ${data.message} (${new Date(data.timestamp).toLocaleTimeString()})`);
    });
}
function joinEvent() {
    eventId = document.getElementById('eventId').value;
    socket.emit('joinEvent', { userId, eventId });
}
function leaveEvent() {
    socket.emit('leaveEvent', { userId, eventId });
}
function sendMessage() {
    const message = document.getElementById('messageInput').value;
    socket.emit('sendMessage', { eventId, message, senderId: userId });
    document.getElementById('messageInput').value = '';
}
function appendMessage(message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}