# Tree Editor Usage Guide

This document describes how to use the newly added tree editing functionality in the Infinite Depth Tree Web UI Prototype.

## Keyboard Shortcuts

### Navigation (existing functionality)
- **Arrow Keys**: Navigate through the tree
  - Up/Down: Move to previous/next item vertically
  - Left/Right: Move to parent/child items horizontally
  - Ctrl+Up/Down: Stay at same level when moving vertically
- **Mouse Click**: Click on any item to focus it
- **Mouse Wheel**: Navigate with scroll wheel (Shift+Wheel for horizontal movement)
- **Ctrl+Q**: Toggle query bar visibility

### New Editing Functionality

#### Creating Elements
- **Insert**: Create a new sibling item after the current item
- **Shift+Insert**: Create a new child item under the current item

#### Updating Elements  
- **F2**: Start editing the current item's text
- **Enter**: Save changes while editing
- **Escape**: Cancel editing without saving changes

#### Deleting Elements
- **Delete**: Delete the current item and all its children (with confirmation)

## Command Line Interface (JavaScript API)

The tree editor exposes a JavaScript API via `window.treeEditor` for programmatic access:

### Basic Operations
```javascript
// Create a new sibling item
treeEditor.createItem();

// Create a new child item  
treeEditor.createChild();

// Delete the current item
treeEditor.deleteItem();

// Start editing the current item
treeEditor.editItem();

// Get reference to current focused item
var currentItem = treeEditor.getCurrentItem();
```

### Import/Export Operations
```javascript
// Export tree structure to JSON file
treeEditor.exportTree();

// Import tree structure from JSON
var jsonData = '{"text":"Root","children":[{"text":"Child 1","children":[]}]}';
treeEditor.importTree(jsonData);
```

## Visual Feedback

- **Focused Item**: Orange text color (#EA7500) indicates the currently selected item
- **Editing Mode**: Orange border around the item being edited with inline text input
- **Confirmation Dialogs**: Deletion operations show confirmation prompts to prevent accidental data loss

## Data Format

The tree structure uses the following JSON format for import/export:

```json
[
  {
    "text": "Item text content",
    "children": [
      {
        "text": "Child item text",
        "children": []
      }
    ]
  }
]
```

## Browser Compatibility

This implementation uses modern JavaScript features and should work in all modern browsers that support:
- ES6 arrow functions (optional, fallback ES2015 version available)
- DOM manipulation APIs
- CSS3 styling features

## Getting Started

1. Open `index.html` in a web browser
2. Use arrow keys or mouse to navigate the existing Wikipedia tree structure
3. Press **F2** to edit any item's text
4. Use **Insert** to create new items
5. Use **Delete** to remove unwanted items
6. Use the JavaScript console to access the `treeEditor` API for advanced operations

The tree editor maintains all existing navigation functionality while adding comprehensive CRUD operations for dynamic tree manipulation.