try {
    window.onerror = function (msg, url, linenumber) {
        alert(msg + '\nLine number: ' + linenumber)
        return true
    };

    let surface = null,
        query = null,
        currentItem = null;

    let offsetLeft = 0,
        offsetTop = 0,
        offsetWidth = 0,
        offsetHeight = 0;

    let currentScrollTop = 0,
        ignoreScrollEvent = false;

    const keys = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        ctrl: 17,
        alt: 18,
        q: 81
    };

    const mouseButton = {
        left: 1,
        middle: 2,
        right: 3
    };

    const scrollAnimationDuration = 500;

    let firstTimePositionRefresh = true,
        firstTimeQueryPositionRefresh = true,
        querySpaceEntered = false,
        queryShouldBeShown = true,
        animationStopRequested = false,
        animationStopped = true;

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
            if (e.deltaY < 0) {
                moveToItem(getNextUpItem(currentItem));
            } else {
                moveToItem(getNextDownItem(currentItem));
            }
            return false;
        }, { passive: false });

        window.addEventListener('scroll', (e) => {
            if (ignoreScrollEvent) return;
            let element = document.elementFromPoint(document.body.clientWidth / 2, document.body.clientHeight / 2);
            if (element.classList.contains('item')) {
                moveToItem(element, true);
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!queryShouldBeShown) {
                if (e.clientY < 90) {
                    if (!querySpaceEntered) {
                        showQuery();
                        querySpaceEntered = true;
                    }
                } else {
                    if (querySpaceEntered) {
                        hideQuery();
                        querySpaceEntered = false;
                    }
                }
            }
        });

        window.addEventListener('resize', () => {
            moveToItem(currentItem, false, true);
            refresh();
        });

        moveToItem(getSurfaceFirstItem());
        refresh();

        // Should be enabled for the first user interactions

        surface.classList.add('animated');
        query.classList.add('animated');
    });

    function tryHandleKeyDown(e) {
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
        return surface.querySelector('ul')?.querySelector('li .item');
    }

    function getSurfaceLastItem() {
        return getLastItem(surface);
    }

    function isFirstChild(element) {
        return element.parentElement.firstElementChild === element;
    }

    function getNextUpItem(element, thisLevel = false) {
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
        const parent = element.closest('li');
        if (!thisLevel) {
            const rightItem = parent.querySelector('ul')?.querySelector('li .item');
            if (rightItem) return rightItem;
        }
        const nextItem = parent.nextElementSibling?.querySelector('.item');
        if (nextItem) return nextItem;
        const nextParentItem = parent.parentElement?.closest('li')?.nextElementSibling?.querySelector('.item');
        if (nextParentItem) return nextParentItem;
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
        surface.style.paddingBottom = ((document.body.clientHeight - firstItem.offsetHeight) / 2) + 'px';
        surface.style.paddingTop = ((document.body.clientHeight - lastItem.offsetHeight) / 2) + 'px';
        query.style.left = ((document.body.clientWidth - query.offsetWidth) / 2) + 'px';
        refreshPosition();
    }

    function moveToItem(item, fromScroll, forceMove) {
        if (item && (forceMove || !currentItem || currentItem !== item)) {
            if (currentItem != null) {
                currentItem.classList.remove('focused');
            }
            setPositionOffset(item);
            refreshPosition(fromScroll);
            item.classList.add('focused');
            currentItem = item;
        }
    }

    function refreshPosition(fromScroll) {
        const newLeft = ((document.body.clientWidth - offsetWidth) / 2 - offsetLeft) + 'px';
        const newScrollTop = (offsetTop - (document.body.clientHeight - offsetHeight) / 2);
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
                scrollToY(newScrollTop, scrollAnimationDuration, function () {
                    ignoreScrollEvent = false;
                });
            }
        }
    }

    function setPositionOffset(obj) {
        const position = getPosition(obj, surface);
        offsetLeft = position.left;
        offsetTop = position.top;
        offsetWidth = obj.offsetWidth;
        offsetHeight = obj.offsetHeight;
    }

    function getPosition(obj, relativeTo) {
        let left = 0, top = 0;
        if (obj.offsetParent) {
            do {
                left += obj.offsetLeft;
                top += obj.offsetTop;
            } while (obj === obj.offsetParent && obj !== relativeTo);
        }
        return { 'left': left, 'top': top };
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