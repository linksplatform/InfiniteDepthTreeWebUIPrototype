import React, { useState } from 'react';
import { TreeNavigation } from '../../../packages/tree-navigation/src';
import { CommandInput } from '../../../packages/command-input/src';
import { IndentedTextParser, convertToTreeNavigation, parseIndentedTextToItems } from '../../../packages/indented-text-parser/src';
import './App.css';

// Sample data that matches the original HTML structure
const sampleIndentedText = `Википедия
    Википедия (англ. Wikipedia, произносится /ˌwɪkɪˈpiːdɪə/) — свободная[3] общедоступная мультиязычная универсальная интернет-энциклопедия. Расположена на интернет-сайте http://www.wikipedia.org/.
    Владелец сайта — американская некоммерческая организация «Фонд Викимедиа», имеющая 19 региональных представительств.
    Главной особенностью интернет-энциклопедии Википедия является то, что создавать и редактировать её статьи может, в принципе, каждый пользователь сети интернет.
    Сущность Википедии
        Википедия — свободная[3] общедоступная мультиязычная универсальная интернет-энциклопедия.
            Википедия — энциклопедия, а не толковый словарь.
            Википедия — не файловый архив.
            Википедия — не место размещения новостных репортажей.
        Краткие формулировки общепринятых правил русской Википедии можно найти на странице [1].
    Модель функционирования Википедии
        В отличие от традиционных энциклопедий, таких, как Encyclopædia Britannica, ни одна статья в Википедии не проходит формального процесса экспертной оценки.
        Содержимое Википедии подпадает под действие законов штата Флориды в США.`;

const App: React.FC = () => {
  const [treeData, setTreeData] = useState(() => {
    const parsedItems = parseIndentedTextToItems(sampleIndentedText);
    return convertToTreeNavigation(parsedItems);
  });
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [commandVisible, setCommandVisible] = useState(true);
  const [inputText, setInputText] = useState(sampleIndentedText);

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    console.log('Selected item:', item);
  };

  const handleCommand = (command: string) => {
    console.log('Command entered:', command);
    // Here you could implement command processing logic
  };

  const handleTextChange = (newText: string) => {
    setInputText(newText);
    const parsedItems = parseIndentedTextToItems(newText);
    setTreeData(convertToTreeNavigation(parsedItems));
  };

  const handleParsed = (items: any[]) => {
    console.log('Parsed items:', items);
  };

  return (
    <div className="App">
      <CommandInput
        logo="links"
        placeholder="Enter command..."
        visible={commandVisible}
        onCommand={handleCommand}
        onVisibilityChange={setCommandVisible}
        keyboardShortcut="Ctrl+Q"
        autoHideOnMouseMove={true}
      />

      <div className="content">
        <div className="tree-section">
          <TreeNavigation
            data={treeData}
            onItemSelect={handleItemSelect}
            animationDuration={500}
            enableScrollAnimation={true}
          />
        </div>

        <div className="parser-section" style={{ display: 'none' }}>
          <IndentedTextParser
            text={inputText}
            onParsed={handleParsed}
          />
        </div>

        <div className="info-panel">
          <h3>Controls:</h3>
          <ul>
            <li>Use arrow keys to navigate the tree</li>
            <li>Use mouse wheel to navigate (Shift+wheel for left/right)</li>
            <li>Click on items to select them</li>
            <li>Press Ctrl+Q to toggle command input</li>
          </ul>
          
          {selectedItem && (
            <div>
              <h4>Selected Item:</h4>
              <p><strong>ID:</strong> {selectedItem.id}</p>
              <p><strong>Content:</strong> {selectedItem.content}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;