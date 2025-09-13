try {
    window.onerror = (msg, url, linenumber) => {
        alert(msg + '\nLine number: ' + linenumber);
    };

    let leftItems = [], rightItems = [];

    let surfaceLeft = null, surfaceRight = null,
        query = null,
        currentLeftItem = null, currentRightItem = null,
        activeSurface = 'left';

    let lastScrollTop = 0,
        ignoreScrollEvent = false;

    const keys = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        ctrl: 17,
        alt: 18,
        shift: 16,
        tab: 9,
        space: 32,
        q: 81
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
        animationStopped = true;

    document.addEventListener('DOMContentLoaded', () => {
        surfaceLeft = document.getElementById('surface-left');
        surfaceRight = document.getElementById('surface-right');
        query = document.getElementById('query');

        window.addEventListener('click', (e) => {
            if (e.which === mouseButton.left && e.target.classList.contains('item')) {
                const isLeftSurface = e.target.closest('#surface-left') !== null;
                activeSurface = isLeftSurface ? 'left' : 'right';
                moveToItem(e.target, activeSurface);
            }
        });

        window.addEventListener('keydown', (e) => {
            if (tryHandleKeyDown(e)) e.preventDefault();
        });

        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            const currentItem = getCurrentItem();
            if (event.shiftKey && e.deltaY < 0) {
                moveToItem(getNextLeftItem(currentItem), activeSurface);
            } else if (event.shiftKey && e.deltaY > 0) {
                moveToItem(getNextRightItem(currentItem), activeSurface);
            } else if (e.deltaY < 0) {
                moveToItem(getNextUpItem(currentItem), activeSurface);
            } else {
                moveToItem(getNextDownItem(currentItem), activeSurface);
            }
        }, { passive: false });

        window.addEventListener('scroll', (e) => {
            if (ignoreScrollEvent) return;
            const items = getActiveItems();
            const currentItem = getCurrentItem();
            if (!items.length || !currentItem) return;
            
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
                        moveToItem(items[i], activeSurface, true);
                        break;
                    }
                }
            } else {
                for (let i = currentIndex; i >= 0; i--) {
                    if (checkItem(items[i])) {
                        moveToItem(items[i], activeSurface, true);
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
        surfaceLeft.classList.add('animated');
        surfaceRight.classList.add('animated');
        query.classList.add('animated');
    });

    function update(reset) {
        if (reset) {
            leftItems = surfaceLeft.querySelectorAll('.item');
            rightItems = surfaceRight.querySelectorAll('.item');
            
            for (let i = 0; i < leftItems.length; i++) {
                leftItems[i].dataset.index = i;
            }
            for (let i = 0; i < rightItems.length; i++) {
                rightItems[i].dataset.index = i;
            }
            
            currentLeftItem = leftItems[0] || null;
            currentRightItem = rightItems[0] || null;
        }
        
        if (currentLeftItem) moveToItem(currentLeftItem, 'left', false, true);
        if (currentRightItem) moveToItem(currentRightItem, 'right', false, true);
        refresh();
    }

    function tryHandleKeyDown(e) {
        const ctrlOrAltIsPressed = e.ctrlKey || e.altKey;
        const currentItem = getCurrentItem();
        
        // Tab to switch between trees
        if (e.keyCode === keys.tab) {
            activeSurface = (activeSurface === 'left') ? 'right' : 'left';
            return true;
        }
        
        if (e.keyCode === keys.up) {
            moveToItem(getNextUpItem(currentItem, !ctrlOrAltIsPressed), activeSurface);
            return true;
        }
        if (e.keyCode === keys.down) {
            moveToItem(getNextDownItem(currentItem, !ctrlOrAltIsPressed), activeSurface);
            return true;
        }
        if (e.keyCode === keys.left) {
            if (e.shiftKey) {
                // Shift+Left: switch to left tree and navigate
                activeSurface = 'left';
                moveToItem(getNextLeftItem(currentItem), activeSurface);
            } else {
                moveToItem(getNextLeftItem(currentItem), activeSurface);
            }
            return true;
        }
        if (e.keyCode === keys.right) {
            if (e.shiftKey) {
                // Shift+Right: switch to right tree and navigate
                activeSurface = 'right';
                moveToItem(getNextRightItem(currentItem), activeSurface);
            } else {
                moveToItem(getNextRightItem(currentItem), activeSurface);
            }
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

    function getCurrentItem() {
        return activeSurface === 'left' ? currentLeftItem : currentRightItem;
    }

    function getActiveItems() {
        return activeSurface === 'left' ? leftItems : rightItems;
    }

    function getActiveSurface() {
        return activeSurface === 'left' ? surfaceLeft : surfaceRight;
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

    function getSurfaceFirstItem(surface = null) {
        const items = surface === 'left' ? leftItems : surface === 'right' ? rightItems : getActiveItems();
        return items[0];
    }

    function getSurfaceLastItem(surface = null) {
        const items = surface === 'left' ? leftItems : surface === 'right' ? rightItems : getActiveItems();
        return items[items.length - 1];
    }

    function isFirstChild(element) {
        return element.parentElement.firstElementChild === element;
    }

    function getNextUpItem(element, thisLevel = false) {
        if (!element) return null;
        const items = getActiveItems();
        
        if (!thisLevel) {
            // Optimization
            const currentIndex = parseInt(element.dataset.index);
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
        if (!element) return null;
        const items = getActiveItems();
        
        if (!thisLevel) { 
            // Optimization
            const currentIndex = parseInt(element.dataset.index);
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
        // Refresh left surface
        const firstLeftItem = getSurfaceFirstItem('left'), lastLeftItem = getSurfaceLastItem('left');
        if (firstLeftItem && lastLeftItem) {
            surfaceLeft.style.paddingBottom = (document.body.clientHeight - firstLeftItem.offsetHeight) / (window.innerWidth <= 600 ? 1.6 : 2) + 'px';
            surfaceLeft.style.paddingTop = ((document.body.clientHeight - lastLeftItem.offsetHeight) / 2) + 'px';
        }
        
        // Refresh right surface
        const firstRightItem = getSurfaceFirstItem('right'), lastRightItem = getSurfaceLastItem('right');
        if (firstRightItem && lastRightItem) {
            surfaceRight.style.paddingBottom = (document.body.clientHeight - firstRightItem.offsetHeight) / (window.innerWidth <= 600 ? 1.6 : 2) + 'px';
            surfaceRight.style.paddingTop = ((document.body.clientHeight - lastRightItem.offsetHeight) / 2) + 'px';
        }
        
        query.style.left = ((document.body.clientWidth - query.offsetWidth) / 2) + 'px';
        refreshPosition();
    }

    function moveToItem(item, surface, fromScroll, forceMove) {
        if (!item) return;
        
        const isLeft = surface === 'left';
        const currentItem = isLeft ? currentLeftItem : currentRightItem;
        
        if (forceMove || !currentItem || currentItem !== item) {
            // Remove focus from current item
            if (currentItem != null) {
                currentItem.classList.remove('focused', 'focused-left', 'focused-right');
            }
            
            // Set new current item
            if (isLeft) {
                currentLeftItem = item;
            } else {
                currentRightItem = item;
            }
            
            // Add appropriate focus class
            const focusClass = isLeft ? 'focused-left' : 'focused-right';
            item.classList.add(focusClass);
            
            // Update active surface if this item was clicked/navigated to
            if (surface) activeSurface = surface;
            
            refreshPosition(fromScroll);
        }
    }

    function refreshPosition(fromScroll) {
        const leftItem = currentLeftItem;
        const rightItem = currentRightItem;
        
        // Position left surface
        if (leftItem) {
            const leftSurfaceWidth = document.body.clientWidth / 2;
            const newLeftLeft = ((leftSurfaceWidth - leftItem.offsetWidth) / 2 - leftItem.offsetLeft) + 'px';
            surfaceLeft.style.left = newLeftLeft;
        }
        
        // Position right surface  
        if (rightItem) {
            const rightSurfaceWidth = document.body.clientWidth / 2;
            const newRightLeft = ((rightSurfaceWidth - rightItem.offsetWidth) / 2 - rightItem.offsetLeft) + 'px';
            surfaceRight.style.left = newRightLeft;
        }
        
        // Handle scroll for active surface
        const activeItem = getCurrentItem();
        if (activeItem) {
            const newScrollTop = (activeItem.offsetTop - (document.body.clientHeight - activeItem.offsetHeight) / 2);
            if (firstTimePositionRefresh) {
                if (!fromScroll) {
                    document.documentElement.scrollTop = newScrollTop;
                }
                firstTimePositionRefresh = false;
            } else {
                if (!fromScroll) {
                    ignoreScrollEvent = true;
                    scrollToY(newScrollTop, scrollAnimationDuration, () => {
                        ignoreScrollEvent = false;
                    });
                }
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

} catch (error) {
    alert(error.toString());
}
