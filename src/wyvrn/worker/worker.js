// worker.js
import { v4 as uuidv4 } from 'uuid';
// Handle messages from the main thread
self.onmessage = function(event) {
	console.log(event);
  const data = event.data;
  if (data.action === 'send') {
    // Send the message (P2P or server-based)
    if (data.target.startsWith('peer:')) {
      // Example: send via WebRTC (you’d use a library like PeerJS)
      sendP2PMessage(data.target, data.content);
    } else {
      // Example: send via WebSocket to server
      sendServerMessage(data.target, data.content);
    }
  }
  if (data.action === 'demo') {
		console.log("demo");
		onMessageReceived({
    "username": "frostyfrog",
    "displayname": "Frostyfrog",
    "id": uuidv4(),
    "timestamp": Date.now(),
    "message": "Hello there!~",
  });
	}
};

// Simulated functions (replace with your actual P2P/server logic)
function sendP2PMessage(peerId, content) {
  // Send via P2P
  self.postMessage({ type: 'p2p', from: 'me', to: peerId, content });
}

function sendServerMessage(channelId, content) {
  // Send via server
  self.postMessage({ type: 'server', channel: channelId, content });
}

// Simulate receiving messages (in reality, this comes from WebRTC/WebSocket)
function onMessageReceived(message) {
  self.postMessage(message); // Send to main thread
}

