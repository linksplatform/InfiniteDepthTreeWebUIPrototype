/**
 * ChatTree component - main tree visualization for chat messages
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TreeMessage } from './TreeMessage';
import { MessageInput } from './MessageInput';
import { ChatStorage } from '../utils/chatStorage';
import { WebRTCPeer } from '../utils/webrtcPeer';

export const ChatTree = () => {
  const [treeData, setTreeData] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [chatStorage] = useState(() => new ChatStorage());
  const [webrtcPeer] = useState(() => new WebRTCPeer());
  const treeRef = useRef(null);
  const messageRefs = useRef(new Map());

  // Initialize chat and WebRTC
  useEffect(() => {
    // Load initial tree data
    const tree = chatStorage.buildTree();
    setTreeData(tree);
    
    // Select root message by default
    if (tree && !selectedMessageId) {
      setSelectedMessageId(tree.timestamp);
    }

    // Initialize WebRTC peer
    webrtcPeer.initialize();
    webrtcPeer.startListeningForBroadcasts();

    // Handle incoming messages from other peers
    webrtcPeer.onMessageReceived = (messageData, fromPeerId) => {
      const { text, parentTimestamp, timestamp } = messageData;
      
      // Check if we already have this message to prevent duplicates
      if (!chatStorage.getMessage(timestamp)) {
        // Manually add the message with the same timestamp for consistency
        chatStorage.messages.set(timestamp, { text, children: [] });
        
        if (parentTimestamp && chatStorage.messages.has(parentTimestamp)) {
          const parent = chatStorage.messages.get(parentTimestamp);
          if (!parent.children.includes(timestamp)) {
            parent.children.push(timestamp);
            parent.children.sort();
          }
        }
        
        chatStorage.saveMessages(chatStorage.messages);
        refreshTree();
      }
    };

    return () => {
      webrtcPeer.disconnect();
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT') return;

      const allMessages = getAllMessageElements();
      const currentIndex = allMessages.findIndex(el => 
        el.dataset.timestamp === selectedMessageId
      );

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            setSelectedMessageId(allMessages[currentIndex - 1].dataset.timestamp);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < allMessages.length - 1) {
            setSelectedMessageId(allMessages[currentIndex + 1].dataset.timestamp);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateToParent();
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateToFirstChild();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedMessageId]);

  // Scroll to selected message
  useEffect(() => {
    if (selectedMessageId) {
      scrollToMessage(selectedMessageId);
    }
  }, [selectedMessageId]);

  const getAllMessageElements = () => {
    return Array.from(document.querySelectorAll('.message-item'));
  };

  const navigateToParent = () => {
    // Find parent of currently selected message
    const findParent = (node, targetTimestamp, parent = null) => {
      if (node.timestamp === targetTimestamp) {
        return parent;
      }
      for (const child of node.children) {
        const result = findParent(child, targetTimestamp, node);
        if (result) return result;
      }
      return null;
    };

    if (treeData) {
      const parent = findParent(treeData, selectedMessageId);
      if (parent) {
        setSelectedMessageId(parent.timestamp);
      }
    }
  };

  const navigateToFirstChild = () => {
    // Find first child of currently selected message
    const findNode = (node, targetTimestamp) => {
      if (node.timestamp === targetTimestamp) {
        return node;
      }
      for (const child of node.children) {
        const result = findNode(child, targetTimestamp);
        if (result) return result;
      }
      return null;
    };

    if (treeData) {
      const currentNode = findNode(treeData, selectedMessageId);
      if (currentNode && currentNode.children.length > 0) {
        setSelectedMessageId(currentNode.children[0].timestamp);
      }
    }
  };

  const refreshTree = useCallback(() => {
    const tree = chatStorage.buildTree();
    setTreeData(tree);
  }, [chatStorage]);

  const scrollToMessage = (timestamp) => {
    setTimeout(() => {
      const element = document.querySelector(`[data-timestamp="${timestamp}"]`);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  const handleMessageSelect = (timestamp) => {
    setSelectedMessageId(timestamp);
  };

  const handleSendMessage = (text, parentTimestamp) => {
    const newTimestamp = chatStorage.addMessage(text, parentTimestamp);
    refreshTree();
    setSelectedMessageId(newTimestamp);
    
    // Broadcast the new message to other peers
    webrtcPeer.broadcastMessage({
      text,
      parentTimestamp,
      timestamp: newTimestamp
    });
    
    // Auto-scroll to new message
    scrollToMessage(newTimestamp);
  };

  if (!treeData) {
    return <div className="loading">Загрузка чата...</div>;
  }

  return (
    <div className="chat-tree">
      <div id="surface" ref={treeRef}>
        <ul>
          <TreeMessage
            message={treeData}
            selectedMessageId={selectedMessageId}
            onSelect={handleMessageSelect}
          />
        </ul>
      </div>
      <MessageInput
        onSendMessage={handleSendMessage}
        selectedMessageId={selectedMessageId}
      />
    </div>
  );
};