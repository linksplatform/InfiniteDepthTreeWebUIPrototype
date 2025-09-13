import React, { useMemo } from 'react';

export interface ParsedItem {
  id: string;
  content: string;
  indentLevel: number;
  children?: ParsedItem[];
}

export interface IndentedTextParserProps {
  text: string;
  className?: string;
  generateId?: (content: string, index: number) => string;
  onParsed?: (items: ParsedItem[]) => void;
  renderItem?: (item: ParsedItem) => React.ReactNode;
}

export const IndentedTextParser: React.FC<IndentedTextParserProps> = ({
  text,
  className = '',
  generateId = (content, index) => `item-${index}`,
  onParsed,
  renderItem
}) => {
  
  const findFirstNonWhiteSpaceSymbol = (str: string): number => {
    return str.search(/\S/);
  };

  const parseIndentedText = useMemo(() => {
    const lines = text.split('\n').filter(line => line.trim()); // Remove empty lines
    
    const extractItems = (lines: string[], startIndex = 0): ParsedItem[] => {
      const items: ParsedItem[] = [];
      
      if (lines.length === 0) return items;
      
      const firstLineIndentLength = findFirstNonWhiteSpaceSymbol(lines[0]);
      let globalIndex = startIndex;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const itemIndentLength = findFirstNonWhiteSpaceSymbol(line);
        
        if (itemIndentLength === firstLineIndentLength) {
          const content = line.trim();
          const item: ParsedItem = {
            id: generateId(content, globalIndex++),
            content,
            indentLevel: itemIndentLength
          };
          
          // Find children (lines with deeper indentation)
          const innerLines: string[] = [];
          for (let j = i + 1; j < lines.length; j++) {
            const innerItemIndentLength = findFirstNonWhiteSpaceSymbol(lines[j]);
            if (innerItemIndentLength === itemIndentLength) {
              break; // Found sibling, stop looking for children
            }
            innerLines.push(lines[j]);
          }
          
          if (innerLines.length > 0) {
            item.children = extractItems(innerLines, globalIndex);
            globalIndex += countItems(item.children);
          }
          
          items.push(item);
        }
      }
      
      return items;
    };
    
    const countItems = (items: ParsedItem[]): number => {
      let count = 0;
      for (const item of items) {
        count++; // Count the item itself
        if (item.children) {
          count += countItems(item.children); // Count children recursively
        }
      }
      return count;
    };
    
    return extractItems(lines);
  }, [text, generateId]);

  // Notify parent component when parsing is complete
  React.useEffect(() => {
    if (onParsed) {
      onParsed(parseIndentedText);
    }
  }, [parseIndentedText, onParsed]);

  // Default render function
  const defaultRenderItem = (item: ParsedItem): React.ReactNode => (
    <div className="item" key={item.id}>
      {item.content}
    </div>
  );

  // Recursive render function
  const renderTree = (items: ParsedItem[]): JSX.Element => (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {renderItem ? renderItem(item) : defaultRenderItem(item)}
          {item.children && item.children.length > 0 && renderTree(item.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`indented-text-parser ${className}`}>
      {parseIndentedText.length > 0 ? renderTree(parseIndentedText) : null}
    </div>
  );
};

// Utility function to convert parsed items to tree navigation format
export const convertToTreeNavigation = (items: ParsedItem[]) => {
  return items.map(item => ({
    id: item.id,
    content: item.content,
    children: item.children ? convertToTreeNavigation(item.children) : undefined
  }));
};

// Utility function to parse indented text without rendering
export const parseIndentedTextToItems = (text: string, generateId = (content: string, index: number) => `item-${index}`): ParsedItem[] => {
  const findFirstNonWhiteSpaceSymbol = (str: string): number => {
    return str.search(/\S/);
  };

  const lines = text.split('\n').filter(line => line.trim());
  
  const extractItems = (lines: string[], startIndex = 0): ParsedItem[] => {
    const items: ParsedItem[] = [];
    
    if (lines.length === 0) return items;
    
    const firstLineIndentLength = findFirstNonWhiteSpaceSymbol(lines[0]);
    let globalIndex = startIndex;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const itemIndentLength = findFirstNonWhiteSpaceSymbol(line);
      
      if (itemIndentLength === firstLineIndentLength) {
        const content = line.trim();
        const item: ParsedItem = {
          id: generateId(content, globalIndex++),
          content,
          indentLevel: itemIndentLength
        };
        
        const innerLines: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
          const innerItemIndentLength = findFirstNonWhiteSpaceSymbol(lines[j]);
          if (innerItemIndentLength === itemIndentLength) {
            break;
          }
          innerLines.push(lines[j]);
        }
        
        if (innerLines.length > 0) {
          item.children = extractItems(innerLines, globalIndex);
          globalIndex += countItems(item.children);
        }
        
        items.push(item);
      }
    }
    
    return items;
  };
  
  const countItems = (items: ParsedItem[]): number => {
    let count = 0;
    for (const item of items) {
      count++;
      if (item.children) {
        count += countItems(item.children);
      }
    }
    return count;
  };
  
  return extractItems(lines);
};

export default IndentedTextParser;