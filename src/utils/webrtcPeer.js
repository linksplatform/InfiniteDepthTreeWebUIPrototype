/**
 * WebRTC P2P communication for real-time chat synchronization
 * Handles peer connections and message broadcasting
 */

export class WebRTCPeer {
  constructor(onMessageReceived) {
    this.onMessageReceived = onMessageReceived;
    this.peers = new Map(); // Store peer connections
    this.localId = this.generateId();
    this.isInitialized = false;
    
    // WebRTC configuration with free STUN servers
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  /**
   * Generate a unique ID for this peer
   * @returns {string} Unique peer ID
   */
  generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Initialize WebRTC for P2P communication
   * In a real implementation, this would connect to a signaling server
   * For now, we'll simulate direct peer discovery
   */
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('Initializing WebRTC peer:', this.localId);
    this.isInitialized = true;
    
    // In a production environment, you would:
    // 1. Connect to a signaling server (WebSocket)
    // 2. Exchange offers/answers through the signaling server
    // 3. Handle ICE candidates
    
    // For this prototype, we'll simulate peer discovery
    this.simulatePeerDiscovery();
  }

  /**
   * Simulate peer discovery (in real implementation, this would be handled by signaling server)
   */
  simulatePeerDiscovery() {
    // Store this peer's info in localStorage for other tabs to discover
    const peers = this.getStoredPeers();
    peers[this.localId] = {
      id: this.localId,
      timestamp: Date.now()
    };
    
    // Clean up old peers (older than 5 minutes)
    const now = Date.now();
    Object.keys(peers).forEach(peerId => {
      if (now - peers[peerId].timestamp > 5 * 60 * 1000) {
        delete peers[peerId];
      }
    });
    
    localStorage.setItem('webrtc_peers', JSON.stringify(peers));
    
    // Check for other peers periodically
    setInterval(() => {
      this.checkForNewPeers();
    }, 5000);
  }

  /**
   * Get stored peers from localStorage
   * @returns {Object} Stored peers object
   */
  getStoredPeers() {
    try {
      return JSON.parse(localStorage.getItem('webrtc_peers') || '{}');
    } catch {
      return {};
    }
  }

  /**
   * Check for new peers and attempt to connect
   */
  async checkForNewPeers() {
    const peers = this.getStoredPeers();
    
    for (const [peerId, peerInfo] of Object.entries(peers)) {
      if (peerId !== this.localId && !this.peers.has(peerId)) {
        // Attempt to establish connection with new peer
        // In a real implementation, this would use the signaling server
        console.log('Discovered new peer:', peerId);
      }
    }
  }

  /**
   * Create a peer connection
   * @param {string} peerId - Remote peer ID
   * @returns {RTCPeerConnection} Peer connection
   */
  createPeerConnection(peerId) {
    const pc = new RTCPeerConnection(this.rtcConfig);
    
    // Handle incoming data channel
    pc.ondatachannel = (event) => {
      const channel = event.channel;
      channel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleIncomingMessage(message, peerId);
        } catch (error) {
          console.error('Error parsing incoming message:', error);
        }
      };
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // In real implementation, send this to signaling server
        console.log('ICE candidate generated for peer:', peerId);
      }
    };
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state with', peerId, ':', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.peers.delete(peerId);
      }
    };
    
    return pc;
  }

  /**
   * Handle incoming messages from peers
   * @param {Object} message - Incoming message
   * @param {string} fromPeerId - Sender peer ID
   */
  handleIncomingMessage(message, fromPeerId) {
    if (message.type === 'chat_message') {
      // Prevent message loops by checking if we already have this message
      if (this.onMessageReceived) {
        this.onMessageReceived(message.data, fromPeerId);
      }
    } else if (message.type === 'sync_request') {
      // Handle sync requests from new peers
      this.handleSyncRequest(fromPeerId);
    }
  }

  /**
   * Broadcast a message to all connected peers
   * @param {Object} messageData - Message data to broadcast
   */
  broadcastMessage(messageData) {
    const message = {
      type: 'chat_message',
      data: messageData,
      from: this.localId,
      timestamp: Date.now()
    };
    
    // For this prototype, we'll use localStorage to simulate broadcasting
    // In a real implementation, this would send through WebRTC data channels
    this.simulateBroadcast(message);
  }

  /**
   * Simulate message broadcasting using localStorage
   * @param {Object} message - Message to broadcast
   */
  simulateBroadcast(message) {
    const broadcasts = this.getStoredBroadcasts();
    const broadcastId = this.generateId();
    
    broadcasts[broadcastId] = {
      ...message,
      broadcastId,
      timestamp: Date.now()
    };
    
    // Clean up old broadcasts (older than 1 minute)
    const now = Date.now();
    Object.keys(broadcasts).forEach(id => {
      if (now - broadcasts[id].timestamp > 60 * 1000) {
        delete broadcasts[id];
      }
    });
    
    localStorage.setItem('webrtc_broadcasts', JSON.stringify(broadcasts));
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new Event('storage'));
  }

  /**
   * Get stored broadcasts from localStorage
   * @returns {Object} Stored broadcasts
   */
  getStoredBroadcasts() {
    try {
      return JSON.parse(localStorage.getItem('webrtc_broadcasts') || '{}');
    } catch {
      return {};
    }
  }

  /**
   * Listen for broadcasts from other tabs/peers
   */
  startListeningForBroadcasts() {
    const processedBroadcasts = new Set();
    
    const checkBroadcasts = () => {
      const broadcasts = this.getStoredBroadcasts();
      
      Object.values(broadcasts).forEach(broadcast => {
        if (broadcast.from !== this.localId && !processedBroadcasts.has(broadcast.broadcastId)) {
          processedBroadcasts.add(broadcast.broadcastId);
          this.handleIncomingMessage(broadcast, broadcast.from);
        }
      });
    };
    
    // Check for broadcasts periodically
    setInterval(checkBroadcasts, 1000);
    
    // Listen for storage events (when other tabs update localStorage)
    window.addEventListener('storage', checkBroadcasts);
  }

  /**
   * Handle sync requests from new peers
   * @param {string} peerId - Requesting peer ID
   */
  handleSyncRequest(peerId) {
    // In a real implementation, this would send the current chat state
    console.log('Sync request from peer:', peerId);
  }

  /**
   * Disconnect from all peers and cleanup
   */
  disconnect() {
    this.peers.forEach(pc => pc.close());
    this.peers.clear();
    
    // Remove this peer from stored peers
    const peers = this.getStoredPeers();
    delete peers[this.localId];
    localStorage.setItem('webrtc_peers', JSON.stringify(peers));
    
    this.isInitialized = false;
  }
}