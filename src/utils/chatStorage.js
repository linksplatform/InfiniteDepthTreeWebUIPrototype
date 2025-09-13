/**
 * Chat storage utilities for localStorage-based persistence
 * Messages are stored as pairs of parent timestamp -> JSON object containing text and children timestamps
 */

const STORAGE_KEY = 'infinite-depth-tree-chat';

export class ChatStorage {
  constructor() {
    this.messages = this.loadMessages();
  }

  /**
   * Load messages from localStorage
   * @returns {Map} Map of timestamp -> message object
   */
  loadMessages() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
    }
    
    // Initialize with default "начало" message if no data exists
    const initialTimestamp = Date.now().toString();
    const initialMessage = {
      text: 'начало',
      children: []
    };
    
    const messages = new Map();
    messages.set(initialTimestamp, initialMessage);
    this.saveMessages(messages);
    return messages;
  }

  /**
   * Save messages to localStorage
   * @param {Map} messages - Map of messages to save
   */
  saveMessages(messages) {
    try {
      const obj = Object.fromEntries(messages);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }

  /**
   * Add a new message as a child of the selected parent
   * @param {string} text - Message text
   * @param {string} parentTimestamp - Parent message timestamp
   * @returns {string} New message timestamp
   */
  addMessage(text, parentTimestamp) {
    const timestamp = Date.now().toString();
    const newMessage = {
      text,
      children: []
    };

    // Add the new message
    this.messages.set(timestamp, newMessage);

    // Add to parent's children array
    if (parentTimestamp && this.messages.has(parentTimestamp)) {
      const parent = this.messages.get(parentTimestamp);
      parent.children.push(timestamp);
      parent.children.sort(); // Keep children sorted by timestamp
    }

    this.saveMessages(this.messages);
    return timestamp;
  }

  /**
   * Get a message by timestamp
   * @param {string} timestamp - Message timestamp
   * @returns {Object|null} Message object or null if not found
   */
  getMessage(timestamp) {
    return this.messages.get(timestamp) || null;
  }

  /**
   * Get all messages as a Map
   * @returns {Map} All messages
   */
  getAllMessages() {
    return new Map(this.messages);
  }

  /**
   * Get the root message timestamp (oldest one)
   * @returns {string} Root message timestamp
   */
  getRootTimestamp() {
    const timestamps = Array.from(this.messages.keys()).sort();
    return timestamps[0];
  }

  /**
   * Build tree structure for rendering
   * @param {string} rootTimestamp - Root timestamp to start from
   * @returns {Object} Tree structure with nested children
   */
  buildTree(rootTimestamp = null) {
    const root = rootTimestamp || this.getRootTimestamp();
    const message = this.messages.get(root);
    
    if (!message) return null;

    return {
      timestamp: root,
      text: message.text,
      children: message.children.map(childTimestamp => 
        this.buildTree(childTimestamp)
      ).filter(Boolean)
    };
  }

  /**
   * Clear all messages and reset to initial state
   */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
    this.messages = this.loadMessages();
  }
}