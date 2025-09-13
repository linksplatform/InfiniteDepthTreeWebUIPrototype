/**
 * TreeMessage component - renders individual messages in the tree structure
 */

import React from 'react';

export const TreeMessage = ({ 
  message, 
  selectedMessageId, 
  onSelect, 
  level = 0 
}) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(message.timestamp);
  };

  const isSelected = selectedMessageId === message.timestamp;

  return (
    <li className={`tree-message level-${level}`}>
      <div 
        className={`message-item ${isSelected ? 'selected' : ''}`}
        onClick={handleClick}
        data-timestamp={message.timestamp}
      >
        {message.text}
      </div>
      {message.children && message.children.length > 0 && (
        <ul className="message-children">
          {message.children.map(child => (
            <TreeMessage
              key={child.timestamp}
              message={child}
              selectedMessageId={selectedMessageId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};