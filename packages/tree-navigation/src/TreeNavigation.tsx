import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface TreeItem {
  id: string;
  content: string;
  children?: TreeItem[];
}

export interface TreeNavigationProps {
  data: TreeItem[];
  className?: string;
  onItemSelect?: (item: TreeItem) => void;
  animationDuration?: number;
  enableScrollAnimation?: boolean;
}

export const TreeNavigation: React.FC<TreeNavigationProps> = ({
  data,
  className = '',
  onItemSelect,
  animationDuration = 500,
  enableScrollAnimation = true
}) => {
  const [currentItem, setCurrentItem] = useState<HTMLElement | null>(null);
  const [items, setItems] = useState<HTMLElement[]>([]);
  const [ignoreScrollEvent, setIgnoreScrollEvent] = useState(false);
  const [animationStopped, setAnimationStopped] = useState(true);
  const [firstTimePositionRefresh, setFirstTimePositionRefresh] = useState(true);
  
  const surfaceRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef({
    cosParameter: 0,
    count: 0,
    oldTimestamp: null as number | null,
    callback: null as (() => void) | null,
    duration: 0,
    element: null as Element | null,
    targetY: 0
  });

  const keys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
  };

  const mouseButton = {
    left: 1,
    middle: 2,
    right: 3
  };

  // Convert tree data to flat array of items for navigation
  const flattenItems = useCallback((data: TreeItem[]): TreeItem[] => {
    const result: TreeItem[] = [];
    const traverse = (items: TreeItem[]) => {
      for (const item of items) {
        result.push(item);
        if (item.children) {
          traverse(item.children);
        }
      }
    };
    traverse(data);
    return result;
  }, []);

  // Initialize items when data changes
  useEffect(() => {
    if (surfaceRef.current) {
      const itemElements = Array.from(surfaceRef.current.querySelectorAll('.item')) as HTMLElement[];
      setItems(itemElements);
      
      // Set dataset index for each item
      itemElements.forEach((item, index) => {
        item.dataset.index = index.toString();
      });
      
      if (itemElements.length > 0) {
        moveToItem(itemElements[0], false, true);
      }
    }
  }, [data]);

  const scrollStep = useCallback((newTimestamp: number) => {
    const scroll = scrollRef.current;
    if (scroll.oldTimestamp !== null && scroll.element) {
      scroll.count += Math.PI * (newTimestamp - scroll.oldTimestamp) / scroll.duration;
      if (scroll.count >= Math.PI) {
        setAnimationStopped(true);
        scroll.element.scrollTop = scroll.targetY;
        if (scroll.callback) setTimeout(scroll.callback, 10);
        return;
      }
      scroll.element.scrollTop = scroll.cosParameter + scroll.targetY + scroll.cosParameter * Math.cos(scroll.count);
    }
    scroll.oldTimestamp = newTimestamp;
    window.requestAnimationFrame(scrollStep);
  }, []);

  const scrollToY = useCallback((y: number, duration = 0, callback?: () => void, element = document.scrollingElement) => {
    if (!element || element.scrollTop === y) return;
    
    const scroll = scrollRef.current;
    scroll.cosParameter = (element.scrollTop - y) / 2;
    scroll.count = 0;
    scroll.oldTimestamp = null;
    scroll.callback = callback || null;
    scroll.duration = duration;
    scroll.element = element;
    scroll.targetY = y;
    
    if (animationStopped) {
      setAnimationStopped(false);
      window.requestAnimationFrame(scrollStep);
    }
  }, [animationStopped, scrollStep]);

  const refreshPosition = useCallback((fromScroll = false) => {
    if (!currentItem || !surfaceRef.current) return;
    
    const newLeft = ((document.body.clientWidth - currentItem.offsetWidth) / 2 - currentItem.offsetLeft);
    const newScrollTop = (currentItem.offsetTop - (document.body.clientHeight - currentItem.offsetHeight) / 2);
    
    surfaceRef.current.style.left = newLeft + 'px';
    
    if (firstTimePositionRefresh) {
      if (!fromScroll) {
        document.documentElement.scrollTop = newScrollTop;
      }
      setFirstTimePositionRefresh(false);
    } else {
      if (!fromScroll && enableScrollAnimation) {
        setIgnoreScrollEvent(true);
        scrollToY(newScrollTop, animationDuration, () => {
          setIgnoreScrollEvent(false);
        });
      }
    }
  }, [currentItem, firstTimePositionRefresh, enableScrollAnimation, animationDuration, scrollToY]);

  const moveToItem = useCallback((item: HTMLElement | null, fromScroll = false, forceMove = false) => {
    if (item && (forceMove || !currentItem || currentItem !== item)) {
      if (currentItem) {
        currentItem.classList.remove('focused');
      }
      setCurrentItem(item);
      item.classList.add('focused');
      refreshPosition(fromScroll);
      
      // Find corresponding tree item and call onItemSelect
      if (onItemSelect) {
        const flatItems = flattenItems(data);
        const index = parseInt(item.dataset.index || '0');
        if (flatItems[index]) {
          onItemSelect(flatItems[index]);
        }
      }
    }
  }, [currentItem, refreshPosition, onItemSelect, data, flattenItems]);

  const getNextLeftItem = useCallback((element: HTMLElement) => {
    return element.closest('li')?.parentElement?.closest('li')?.querySelector('.item') as HTMLElement | null;
  }, []);

  const getNextRightItem = useCallback((element: HTMLElement) => {
    return element.closest('li')?.querySelector('ul')?.querySelector('li .item') as HTMLElement | null;
  }, []);

  const getLastItem = useCallback((element: HTMLElement): HTMLElement | null => {
    let list = element.querySelector('ul');
    while (list) {
      const listItems = list.querySelectorAll('li');
      if (listItems.length > 0) {
        element = listItems[listItems.length - 1] as HTMLElement;
        list = element.querySelector('ul');
      }
    }
    return element.querySelector('.item') as HTMLElement | null;
  }, []);

  const getNextUpItem = useCallback((element: HTMLElement, thisLevel = false) => {
    if (!thisLevel && currentItem) {
      const currentIndex = parseInt(currentItem.dataset.index || '0');
      if (currentIndex > 0) {
        return items[currentIndex - 1] || null;
      }
    }
    
    const parent = element.closest('li');
    const prev = parent?.previousElementSibling;
    if (prev) {
      if (thisLevel) {
        return prev.querySelector('.item') as HTMLElement | null;
      } else {
        return getLastItem(prev as HTMLElement);
      }
    }
    
    if (parent && parent === parent.parentElement?.firstElementChild) {
      const nextItem = parent.parentElement?.closest('li')?.querySelector('.item') as HTMLElement | null;
      if (nextItem) return nextItem;
    }
    return element;
  }, [currentItem, items, getLastItem]);

  const getNextDownItem = useCallback((element: HTMLElement, thisLevel = false) => {
    if (!thisLevel && currentItem) {
      const currentIndex = parseInt(currentItem.dataset.index || '0');
      if (currentIndex < (items.length - 1)) {
        return items[currentIndex + 1] || null;
      }
    }
    
    let parent = element.closest('li');
    const rightItem = parent?.querySelector('ul')?.querySelector('li .item') as HTMLElement | null;
    if (rightItem && !thisLevel) return rightItem;
    
    while (parent) {
      const nextItem = parent.nextElementSibling?.querySelector('.item') as HTMLElement | null;
      if (nextItem) return nextItem;
      if (rightItem) break;
      parent = parent.parentElement?.closest('li') || null;
    }
    return null;
  }, [currentItem, items]);

  const tryHandleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!currentItem) return false;
    
    const ctrlOrAltIsPressed = e.ctrlKey || e.altKey;
    
    if (e.keyCode === keys.up) {
      moveToItem(getNextUpItem(currentItem, !ctrlOrAltIsPressed));
      return true;
    }
    if (e.keyCode === keys.down) {
      moveToItem(getNextDownItem(currentItem, !ctrlOrAltIsPressed));
      return true;
    }
    if (e.keyCode === keys.left) {
      moveToItem(getNextLeftItem(currentItem));
      return true;
    }
    if (e.keyCode === keys.right) {
      moveToItem(getNextRightItem(currentItem));
      return true;
    }
    return false;
  }, [currentItem, getNextUpItem, getNextDownItem, getNextLeftItem, getNextRightItem, moveToItem]);

  // Event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (tryHandleKeyDown(e)) e.preventDefault();
    };

    const handleClick = (e: MouseEvent) => {
      if (e.which === mouseButton.left && (e.target as Element).classList.contains('item')) {
        moveToItem(e.target as HTMLElement);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!currentItem) return;
      
      if (e.shiftKey && e.deltaY < 0) {
        moveToItem(getNextLeftItem(currentItem));
      } else if (e.shiftKey && e.deltaY > 0) {
        moveToItem(getNextRightItem(currentItem));
      } else if (e.deltaY < 0) {
        moveToItem(getNextUpItem(currentItem));
      } else {
        moveToItem(getNextDownItem(currentItem));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [tryHandleKeyDown, moveToItem, currentItem, getNextLeftItem, getNextRightItem, getNextUpItem, getNextDownItem]);

  // Render tree recursively
  const renderTree = (items: TreeItem[]): JSX.Element => (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <div className="item">
            {item.content}
          </div>
          {item.children && item.children.length > 0 && renderTree(item.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div 
      ref={surfaceRef}
      className={`tree-navigation ${className}`}
      style={{ position: 'relative', transition: 'left 0.3s ease' }}
    >
      {renderTree(data)}
    </div>
  );
};

export default TreeNavigation;