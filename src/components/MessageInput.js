/**
 * MessageInput component - handles message input with auto-focus functionality
 */

import React, { useState, useEffect, useRef } from 'react';

export const MessageInput = ({ onSendMessage, selectedMessageId }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  // Auto-focus functionality
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Auto-focus on alphanumeric keys without Ctrl/Alt modifiers
      if (
        !e.ctrlKey && 
        !e.altKey && 
        !e.metaKey &&
        document.activeElement !== inputRef.current &&
        ((e.key >= 'a' && e.key <= 'z') ||
         (e.key >= 'A' && e.key <= 'Z') ||
         (e.key >= '0' && e.key <= '9') ||
         e.key === ' ')
      ) {
        inputRef.current.focus();
        // Don't prevent default to allow the character to be typed
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && selectedMessageId) {
      onSendMessage(message.trim(), selectedMessageId);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div id="message-input-container">
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedMessageId ? "Введите сообщение..." : "Выберите сообщение для ответа"}
          disabled={!selectedMessageId}
          autoComplete="off"
          spellCheck="false"
          tabIndex="0"
        />
      </form>
    </div>
  );
};