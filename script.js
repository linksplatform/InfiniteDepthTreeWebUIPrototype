try {
    window.onerror = (msg, url, linenumber) => {
        alert(msg + '\nLine number: ' + linenumber);
    };

    let items = [];

    let surface = null,
        query = null,
        currentItem = null;

    let lastScrollTop = 0,
        ignoreScrollEvent = false;

    const keys = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        ctrl: 17,
        alt: 18,
        q: 81,
        enter: 13,
        del: 46,
        insert: 45,
        f2: 113,
        escape: 27
    };

    const mouseButton = {
        left: 1,
        middle: 2,
        right: 3
    };

    const scrollAnimationDuration = 500;

    let firstTimePositionRefresh = true,
        querySpaceEntered = false,
        queryShouldBeShown = true,
        animationStopped = true,
        isEditing = false,
        editingElement = null;

    document.addEventListener('DOMContentLoaded', () => {
        surface = document.getElementById('surface');
        query = document.getElementById('query');

        window.addEventListener('click', (e) => {
            if (e.which === mouseButton.left && e.target.classList.contains('item')) {
                moveToItem(e.target);
            }
        });

        window.addEventListener('keydown', (e) => {
            if (tryHandleKeyDown(e)) e.preventDefault();
        });

        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (event.shiftKey && e.deltaY < 0) {
                moveToItem(getNextLeftItem(currentItem));
            } else if (event.shiftKey && e.deltaY > 0) {
                moveToItem(getNextRightItem(currentItem));
            } else if (e.deltaY < 0) {
                moveToItem(getNextUpItem(currentItem));
            } else {
                moveToItem(getNextDownItem(currentItem));
            }
        }, { passive: false });

        window.addEventListener('scroll', (e) => {
            if (ignoreScrollEvent) return;
            const baseOffset = items[0].offsetTop;
            const currentScrollTop = document.documentElement.scrollTop;
            const checkItem = item => {
                const min = item.offsetTop - baseOffset;
                const max = min + item.offsetHeight;
                if (currentScrollTop >= min && currentScrollTop < max) {
                    return true;
                }
                return false;
            }
            
            const delta = currentScrollTop - lastScrollTop;
            const currentIndex = parseInt(currentItem.dataset.index);
            if (delta > 0) {
                for (let i = currentIndex; i < items.length; i++) {
                    if (checkItem(items[i])) {
                        moveToItem(items[i], true);
                        break;
                    }
                }
            } else {
                for (let i = currentIndex; i >= 0; i--) {
                    if (checkItem(items[i])) {
                        moveToItem(items[i], true);
                        break;
                    }
                }
            }
            lastScrollTop = currentScrollTop;
        });

        window.addEventListener('mousemove', (e) => {
            if (queryShouldBeShown) return;
            if (e.clientY < 90 && !querySpaceEntered) {
                showQuery();
                querySpaceEntered = true;
            } else if (querySpaceEntered) {  
                hideQuery();
                querySpaceEntered = false;
            }
        });

        window.addEventListener('resize', () => {
            update();
        });

        update(true);

        // Should be enabled for the first user interactions
        surface.classList.add('animated');
        query.classList.add('animated');
    });

    function update(reset) {
        if (reset) {
            items = document.querySelectorAll('.item');
            for (let i = 0; i < items.length; i++) {
                items[i].dataset.index = i;
            }
            currentItem = getSurfaceFirstItem();
        }
        moveToItem(currentItem, false, true);
        refresh();
    }

    function tryHandleKeyDown(e) {
        const ctrlOrAltIsPressed = e.ctrlKey || e.altKey;
        
        if (isEditing) {
            if (e.keyCode === keys.enter) {
                finishEditing();
                return true;
            }
            if (e.keyCode === keys.escape) {
                cancelEditing();
                return true;
            }
            return false;
        }
        
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
        if (e.keyCode === keys.f2) {
            startEditing(currentItem);
            return true;
        }
        if (e.keyCode === keys.insert) {
            if (e.shiftKey) {
                createChildItem();
            } else {
                createNewItem();
            }
            return true;
        }
        if (e.keyCode === keys.del) {
            deleteCurrentItem();
            return true;
        }
        if (ctrlOrAltIsPressed && e.which === keys.q) {
            if (queryShouldBeShown) {
                hideQuery();
            } else {
                showQuery();
            }
            queryShouldBeShown = !queryShouldBeShown;
            return true;
        }
        return false;
    }

    function getNextLeftItem(element) {
        return element.closest('li')?.parentElement?.closest('li')?.querySelector('.item');
    }

    function getNextRightItem(element) {
        return element.closest('li')?.querySelector('ul')?.querySelector('li .item');
    }

    function getLastItem(element) {
        let list = element.querySelector('ul');
        while (list) {
            let items = list.querySelectorAll('li');
            if (items.length > 0) {
                element = items[items.length - 1];
                list = element.querySelector('ul');
            }
        }
        return element.querySelector('.item');
    }

    function getSurfaceFirstItem() {
        return items[0];
        //return surface.querySelector('ul')?.querySelector('li .item');
    }

    function getSurfaceLastItem() {
        return items[items.length - 1];
        //return getLastItem(surface);
    }

    function isFirstChild(element) {
        return element.parentElement.firstElementChild === element;
    }

    function getNextUpItem(element, thisLevel = false) {
        if (!thisLevel) {
            // Optimization
            const currentIndex = parseInt(currentItem.dataset.index);
            if (currentIndex > 0) {
                return items[currentIndex - 1]; 
            }
        }
        // Universal logic
        const parent = element.closest('li'), prev = parent.previousElementSibling;
        if (prev) {
            if (thisLevel) {
                return prev.querySelector('.item');
            } else {
                return getLastItem(prev);
            }
        }
        if (isFirstChild(parent)) {
            const nextItem = parent.parentElement?.closest('li')?.querySelector('.item');
            if (nextItem) return nextItem;
        }
        return element;
    }

    function getNextDownItem(element, thisLevel = false) {
        if (!thisLevel) { 
            // Optimization
            const currentIndex = parseInt(currentItem.dataset.index);
            if (currentIndex < (items.length - 1)) {
                return items[currentIndex + 1];
            }
        }
        // Universal logic
        let parent = element.closest('li');
        const rightItem = parent.querySelector('ul')?.querySelector('li .item');
        if (rightItem && !thisLevel) return rightItem;
        while (parent) {
            const nextItem = parent.nextElementSibling?.querySelector('.item');
            if (nextItem) return nextItem;
            if (rightItem) break;
            parent = parent.parentElement?.closest('li');
        }
        return null;
    }

    function showQuery() {
        query.style.top = '20px';
    }

    function hideQuery() {
        query.style.top = (2 - query.offsetHeight) + 'px';
    }

    function refresh() {
        const firstItem = getSurfaceFirstItem(), lastItem = getSurfaceLastItem();
        surface.style.paddingBottom = (document.body.clientHeight - firstItem.offsetHeight) / (window.innerWidth <= 600 ? 1.6 : 2) + 'px';
        surface.style.paddingTop = ((document.body.clientHeight - lastItem.offsetHeight) / 2) + 'px';
        query.style.left = ((document.body.clientWidth - query.offsetWidth) / 2) + 'px';
        refreshPosition();
    }

    function moveToItem(item, fromScroll, forceMove) {
        if (item && (forceMove || !currentItem || currentItem !== item)) {
            if (currentItem != null) {
                currentItem.classList.remove('focused');
            }
            currentItem = item;
            refreshPosition(fromScroll);
            item.classList.add('focused');
        }
    }

    function refreshPosition(fromScroll) {
        const newLeft = ((document.body.clientWidth - currentItem.offsetWidth) / 2 - currentItem.offsetLeft) + 'px';
        const newScrollTop = (currentItem.offsetTop - (document.body.clientHeight - currentItem.offsetHeight) / 2);
        if (firstTimePositionRefresh) {
            surface.style.left = newLeft;
            if (!fromScroll) {
                document.documentElement.scrollTop = newScrollTop;
            }
            firstTimePositionRefresh = false;
        } else {
            surface.style.left = newLeft;
            if (!fromScroll) {
                ignoreScrollEvent = true;
                scrollToY(newScrollTop, scrollAnimationDuration, () => {
                    ignoreScrollEvent = false;
                });
            }
        }
    }

    let scrollCosParameter, scrollCount, scrollOldTimestamp, scrollCallback, scrollDuration, scrollElement, scrollTargetY;

    function scrollStep(newTimestamp) {
        if (scrollOldTimestamp !== null) {
            // if duration is 0 scrollCount will be Infinity
            scrollCount += Math.PI * (newTimestamp - scrollOldTimestamp) / scrollDuration;
            if (scrollCount >= Math.PI) {
                animationStopped = true;
                scrollElement.scrollTop = scrollTargetY;
                if (scrollCallback) setTimeout(scrollCallback, 10);
                return;
            }
            scrollElement.scrollTop = scrollCosParameter + scrollTargetY + scrollCosParameter * Math.cos(scrollCount);
        }
        scrollOldTimestamp = newTimestamp;
        window.requestAnimationFrame(scrollStep);
    }

    function scrollToY(y, duration = 0, callback, element = document.scrollingElement) {
        // cancel if already on target position
        if (element.scrollTop === y) return;
        scrollCosParameter = (element.scrollTop - y) / 2;
        scrollCount = 0;
        scrollOldTimestamp = null;
        scrollCallback = callback;
        scrollDuration = duration;
        scrollElement = element;
        scrollTargetY = y;
        if (animationStopped) {
            animationStopped = false;
            window.requestAnimationFrame(scrollStep);
        }
    }

    function startEditing(item) {
        if (!item) return;
        
        isEditing = true;
        editingElement = item;
        
        const originalText = item.textContent.trim();
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.className = 'edit-input';
        input.style.cssText = `
            width: 100%;
            background: transparent;
            border: 2px solid #EA7500;
            color: #EA7500;
            font-family: inherit;
            font-size: inherit;
            padding: 5px;
            box-sizing: border-box;
            outline: none;
        `;
        
        item.innerHTML = '';
        item.appendChild(input);
        item.classList.add('editing');
        
        input.focus();
        input.select();
    }

    function finishEditing() {
        if (!isEditing || !editingElement) return;
        
        const input = editingElement.querySelector('.edit-input');
        if (input) {
            const newText = input.value.trim();
            if (newText) {
                editingElement.textContent = newText;
            }
        }
        
        editingElement.classList.remove('editing');
        isEditing = false;
        editingElement = null;
    }

    function cancelEditing() {
        if (!isEditing || !editingElement) return;
        
        const input = editingElement.querySelector('.edit-input');
        if (input && input.hasAttribute('data-original-text')) {
            editingElement.textContent = input.getAttribute('data-original-text');
        }
        
        editingElement.classList.remove('editing');
        isEditing = false;
        editingElement = null;
    }

    function createNewItem() {
        if (!currentItem) return;
        
        const currentLi = currentItem.closest('li');
        const newLi = document.createElement('li');
        const newItem = document.createElement('div');
        newItem.className = 'item';
        newItem.textContent = 'New Item';
        newLi.appendChild(newItem);
        
        currentLi.parentNode.insertBefore(newLi, currentLi.nextSibling);
        
        update(true);
        moveToItem(newItem);
        startEditing(newItem);
    }

    function deleteCurrentItem() {
        if (!currentItem) return;
        
        const confirmDelete = confirm('Are you sure you want to delete this item and all its children?');
        if (!confirmDelete) return;
        
        const currentLi = currentItem.closest('li');
        const nextItem = getNextDownItem(currentItem, true) || getNextUpItem(currentItem, true) || getNextLeftItem(currentItem);
        
        currentLi.remove();
        
        update(true);
        if (nextItem && nextItem.closest('li')) {
            moveToItem(nextItem);
        }
    }

    function createChildItem() {
        if (!currentItem) return;
        
        const currentLi = currentItem.closest('li');
        let childrenUl = currentLi.querySelector('ul');
        
        if (!childrenUl) {
            childrenUl = document.createElement('ul');
            currentLi.appendChild(childrenUl);
        }
        
        const newLi = document.createElement('li');
        const newItem = document.createElement('div');
        newItem.className = 'item';
        newItem.textContent = 'New Child Item';
        newLi.appendChild(newItem);
        
        childrenUl.appendChild(newLi);
        
        update(true);
        moveToItem(newItem);
        startEditing(newItem);
    }

    function exportTree() {
        const exportData = extractTreeData(surface.querySelector('ul'));
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'tree_data.json';
        link.click();
    }

    function extractTreeData(ul) {
        if (!ul) return [];
        
        const items = [];
        const liElements = ul.querySelectorAll(':scope > li');
        
        liElements.forEach(li => {
            const itemDiv = li.querySelector(':scope > .item');
            if (itemDiv) {
                const itemData = {
                    text: itemDiv.textContent.trim(),
                    children: extractTreeData(li.querySelector(':scope > ul'))
                };
                items.push(itemData);
            }
        });
        
        return items;
    }

    function importTree(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            const newUl = buildTreeFromData(data);
            
            const surface = document.getElementById('surface');
            surface.innerHTML = '';
            surface.appendChild(newUl);
            
            update(true);
        } catch (error) {
            alert('Invalid JSON data: ' + error.message);
        }
    }

    function buildTreeFromData(data) {
        const ul = document.createElement('ul');
        
        data.forEach(item => {
            const li = document.createElement('li');
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.textContent = item.text;
            li.appendChild(itemDiv);
            
            if (item.children && item.children.length > 0) {
                const childUl = buildTreeFromData(item.children);
                li.appendChild(childUl);
            }
            
            ul.appendChild(li);
        });
        
        return ul;
    }

    window.treeEditor = {
        createItem: createNewItem,
        createChild: createChildItem,
        deleteItem: deleteCurrentItem,
        editItem: () => startEditing(currentItem),
        exportTree: exportTree,
        importTree: importTree,
        getCurrentItem: () => currentItem
    };

} catch (error) {
    alert(error.toString());
}
