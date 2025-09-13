import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface CommandInputProps {
  logo?: string;
  placeholder?: string;
  className?: string;
  onCommand?: (command: string) => void;
  onChange?: (value: string) => void;
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  keyboardShortcut?: string; // e.g., "Ctrl+Q" or "Alt+Q"
  autoHideOnMouseMove?: boolean;
  autoHideThreshold?: number; // pixels from top to trigger auto-hide
}

export const CommandInput: React.FC<CommandInputProps> = ({
  logo = 'links',
  placeholder = '',
  className = '',
  onCommand,
  onChange,
  visible = true,
  onVisibilityChange,
  keyboardShortcut = 'Ctrl+Q',
  autoHideOnMouseMove = true,
  autoHideThreshold = 90
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [inputValue, setInputValue] = useState('');
  const [querySpaceEntered, setQuerySpaceEntered] = useState(false);
  const [shouldBeShown, setShouldBeShown] = useState(visible);
  
  const queryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const keys = {
    ctrl: 17,
    alt: 18,
    q: 81
  };

  // Parse keyboard shortcut
  const parseShortcut = useCallback((shortcut: string) => {
    const parts = shortcut.toLowerCase().split('+');
    return {
      ctrl: parts.includes('ctrl'),
      alt: parts.includes('alt'),
      key: parts[parts.length - 1]
    };
  }, []);

  const showQuery = useCallback(() => {
    if (queryRef.current) {
      queryRef.current.style.top = '20px';
      setIsVisible(true);
      if (onVisibilityChange) onVisibilityChange(true);
    }
  }, [onVisibilityChange]);

  const hideQuery = useCallback(() => {
    if (queryRef.current) {
      queryRef.current.style.top = (2 - queryRef.current.offsetHeight) + 'px';
      setIsVisible(false);
      if (onVisibilityChange) onVisibilityChange(false);
    }
  }, [onVisibilityChange]);

  const refresh = useCallback(() => {
    if (queryRef.current) {
      const left = ((document.body.clientWidth - queryRef.current.offsetWidth) / 2) + 'px';
      queryRef.current.style.left = left;
    }
  }, []);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (onChange) onChange(value);
  }, [onChange]);

  // Handle input submit
  const handleInputSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onCommand) onCommand(inputValue);
      setInputValue('');
    }
  }, [inputValue, onCommand]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = parseShortcut(keyboardShortcut);
      const ctrlOrAltPressed = e.ctrlKey || e.altKey;
      
      if (
        ((shortcut.ctrl && e.ctrlKey) || (shortcut.alt && e.altKey)) &&
        e.which === keys.q
      ) {
        if (shouldBeShown) {
          hideQuery();
        } else {
          showQuery();
        }
        setShouldBeShown(!shouldBeShown);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardShortcut, shouldBeShown, showQuery, hideQuery, parseShortcut]);

  // Handle mouse movement for auto-hide
  useEffect(() => {
    if (!autoHideOnMouseMove) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (shouldBeShown) return;
      
      if (e.clientY < autoHideThreshold && !querySpaceEntered) {
        showQuery();
        setQuerySpaceEntered(true);
      } else if (querySpaceEntered && e.clientY >= autoHideThreshold) {
        hideQuery();
        setQuerySpaceEntered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [autoHideOnMouseMove, autoHideThreshold, shouldBeShown, querySpaceEntered, showQuery, hideQuery]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => refresh();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [refresh]);

  // Initial setup
  useEffect(() => {
    refresh();
    if (visible) {
      showQuery();
    } else {
      hideQuery();
    }
  }, [visible, showQuery, hideQuery, refresh]);

  // Sync visibility prop with internal state
  useEffect(() => {
    setIsVisible(visible);
    setShouldBeShown(visible);
    if (visible) {
      showQuery();
    } else {
      hideQuery();
    }
  }, [visible, showQuery, hideQuery]);

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: visible ? '20px' : `${2 - (queryRef.current?.offsetHeight || 60)}px`,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    transition: 'top 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '8px 12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const logoStyle: React.CSSProperties = {
    marginRight: '12px',
    fontWeight: 'bold',
    color: '#333',
    userSelect: 'none'
  };

  const inputStyle: React.CSSProperties = {
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    minWidth: '200px',
    backgroundColor: 'transparent'
  };

  return (
    <div
      ref={queryRef}
      className={`command-input animated ${className}`}
      style={containerStyle}
    >
      {logo && (
        <div className="command-input-logo" style={logoStyle}>
          {logo}
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        placeholder={placeholder}
        onChange={handleInputChange}
        onKeyDown={handleInputSubmit}
        autoComplete="off"
        spellCheck={false}
        tabIndex={0}
        style={inputStyle}
        className="command-input-field"
      />
    </div>
  );
};

export default CommandInput;