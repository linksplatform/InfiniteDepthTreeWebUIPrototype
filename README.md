# Infinite Depth Tree Web UI React Packages

This repository contains React packages extracted from the original vanilla JavaScript implementation of the Infinite Depth Tree Web UI Prototype.

The Web UI Prototype supports viewing and editing graphs/networks with deep structure that can be easily mapped to Tree structures even when they contain self-references.

## Packages

### [@linksplatform/tree-navigation](./packages/tree-navigation)
React component for infinite depth tree navigation with full keyboard and mouse support.

**Features:**
- Arrow key navigation (up/down/left/right)
- Mouse click navigation
- Scroll wheel navigation with Shift modifier for horizontal movement
- Focus management with visual highlighting
- Smooth scrolling animation
- Customizable animation duration

**Installation:**
```bash
npm install @linksplatform/tree-navigation
```

**Basic Usage:**
```tsx
import { TreeNavigation } from '@linksplatform/tree-navigation';

const data = [
  {
    id: '1',
    content: 'Root Item',
    children: [
      {
        id: '1-1',
        content: 'Child Item',
        children: []
      }
    ]
  }
];

<TreeNavigation
  data={data}
  onItemSelect={(item) => console.log('Selected:', item)}
  animationDuration={500}
/>
```

### [@linksplatform/command-input](./packages/command-input)
React component for command input with search functionality and keyboard shortcuts.

**Features:**
- Customizable logo and placeholder
- Keyboard shortcuts (Ctrl+Q, Alt+Q, etc.)
- Auto-hide on mouse movement
- Smooth show/hide animations
- Command execution callbacks

**Installation:**
```bash
npm install @linksplatform/command-input
```

**Basic Usage:**
```tsx
import { CommandInput } from '@linksplatform/command-input';

<CommandInput
  logo="links"
  placeholder="Enter command..."
  onCommand={(command) => console.log('Command:', command)}
  keyboardShortcut="Ctrl+Q"
  autoHideOnMouseMove={true}
/>
```

### [@linksplatform/indented-text-parser](./packages/indented-text-parser)
React component for parsing indented text into hierarchical tree structures.

**Features:**
- Automatic indentation level detection
- Hierarchical tree structure generation
- Custom item rendering
- Utility functions for data conversion
- Compatible with TreeNavigation component

**Installation:**
```bash
npm install @linksplatform/indented-text-parser
```

**Basic Usage:**
```tsx
import { IndentedTextParser, convertToTreeNavigation } from '@linksplatform/indented-text-parser';

const text = `Root
    Child 1
        Grandchild 1
    Child 2`;

<IndentedTextParser
  text={text}
  onParsed={(items) => console.log('Parsed:', items)}
/>
```

## Development

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run in development mode
npm run dev
```

### Project Structure
```
packages/
├── tree-navigation/          # Tree navigation component
├── command-input/            # Command input component
├── indented-text-parser/     # Indented text parser component
examples/
├── demo/                     # Demo application
```

### Building Packages
```bash
# Build all packages
npm run build

# Build specific package
cd packages/tree-navigation
npm run build
```

### Testing
```bash
# Run tests for all packages
npm test

# Run tests for specific package
cd packages/tree-navigation  
npm test
```

## Usage Example

Here's a complete example combining all three components:

```tsx
import React, { useState } from 'react';
import { TreeNavigation } from '@linksplatform/tree-navigation';
import { CommandInput } from '@linksplatform/command-input';
import { 
  IndentedTextParser, 
  convertToTreeNavigation, 
  parseIndentedTextToItems 
} from '@linksplatform/indented-text-parser';

const App = () => {
  const sampleText = `Root Item
    Child 1
        Grandchild 1
        Grandchild 2
    Child 2
        Grandchild 3`;

  const [treeData, setTreeData] = useState(() => {
    const parsedItems = parseIndentedTextToItems(sampleText);
    return convertToTreeNavigation(parsedItems);
  });

  return (
    <div>
      <CommandInput
        logo="MyApp"
        onCommand={(cmd) => console.log('Command:', cmd)}
      />
      
      <TreeNavigation
        data={treeData}
        onItemSelect={(item) => console.log('Selected:', item)}
      />
    </div>
  );
};
```

## Migration from Original

If you're migrating from the original vanilla JavaScript implementation:

1. **Tree Navigation**: Replace DOM manipulation with TreeNavigation component
2. **Command Input**: Replace HTML input with CommandInput component  
3. **Text Parsing**: Use IndentedTextParser or parseIndentedTextToItems utility

## Browser Support

- Modern browsers with ES2015+ support
- React 16.8+ (hooks support required)

## License

Unlicensed - see [LICENSE](./LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
