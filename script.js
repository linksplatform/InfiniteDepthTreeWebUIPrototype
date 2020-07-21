﻿let surface = null,
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

let firstTimePositionRefresh = true,
    firstTimeQueryPositionRefresh = true,
    querySpaceEntered = false,
    queryForcedToShow = true,
    ctrlKeyIsPressed = false,
    altKeyIsPressed = false;

document.addEventListener('DOMContentLoaded', () => {
    surface = document.getElementById('surface');
    query = document.getElementById('query');

    let items = document.getElementsByClassName('item')
    Array.from(items).forEach((i) => {
        i.addEventListener('selectstart', (e) => e.preventDefault());
        i.onclick = (e) => {
            if (e.which === mouseButton.left) moveToItem(i)
        }
    })

    window.onkeyup = (e) => {
        if (e.which === keys.ctrl)
            ctrlKeyIsPressed = false;
        if (e.which === keys.alt)
            altKeyIsPressed = false;
    };

    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            moveToItem(getNextUpItem(currentItem));
        } else {
            moveToItem(getNextDownItem(currentItem));
        }
        return false;
    }, {
        passive: false
    });

    window.addEventListener('scroll', (e) => {
        if (ignoreScrollEvent) return;

        let element = document.elementFromPoint(document.body.clientWidth / 2, document.body.clientHeight / 2);

        if (element.classList.contains('item')) {
            moveToItem(element, true);
        }
    });

    window.addEventListener('keydown', (e) => {
        let parent,
            item,
            ctrlOrAltIsPressed = (e.which === keys.ctrl) || (e.which === keys.alt);
        if (e.keyCode === keys.up) {
            item = getNextUpItem(currentItem, ctrlOrAltIsPressed);
            moveToItem(item);
            return false;
        }
        if (e.keyCode === keys.down) {
            item = getNextDownItem(currentItem, ctrlOrAltIsPressed);
            moveToItem(item);
            return false;
        }
        if (e.keyCode === keys.left) {
            parent = currentItem.closest('li').parent().closest('li');
            item = parent.find('> .item');
            moveToItem(item);
            return false;
        }
        if (e.keyCode === keys.right) {
            parent = currentItem.closest('li');
            item = parent.find('> ul > li:first-child > .item');
            moveToItem(item);
            return false;
        }
        if (ctrlOrAltIsPressed && e.which === keys.q) {
            if (queryForcedToShow) {
                hideQuery();
            } else {
                showQuery();
            }
            queryForcedToShow = !queryForcedToShow;
            return false;
        }
    });

    document.body.onmousemove = (e) => {
        if (e.clientY < 90) {
            if (!querySpaceEntered) {
                if (!queryForcedToShow) showQuery();
                querySpaceEntered = true;
            }
        } else {
            if (querySpaceEntered) {
                if (!queryForcedToShow) hideQuery();
                querySpaceEntered = false;
            }
        }
    };

    window.onresize = () => refresh();

    moveToItem(getSurfaceFirstItem());
    refresh();
});

function enableSelection(item) {
    item.onselectstart = () => { };
    item.unselectable = 'off';
    item.style.userSelect = 'auto';
}

function disableSelection(item) {
    item.onselectstart = () => false;
    item.unselectable = 'on';
    item.style.userSelect = 'none';
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
    return surface.querySelector('ul > li:first-child > .item');
}

function getSurfaceLastItem() {
    return getLastItem(surface);
}

function isFirstChild(element) {
    return element.parentElement.firstChild === element
}

function getNextUpItem(element, thisLevel = false) {
    let parent = element.closest('li'),
        prev = parent.previousElementSibling;

    if (prev) return thisLevel ? prev.querySelector('.item') : getLastItem(prev);

    if (isFirstChild(parent) && parent.parentNode.closest('li')) return parent.parentNode.closest('li').querySelector('.item');
}

function getNextDownItem(element, thisLevel = false) {
    const item = element.closest('li');

    if (!thisLevel) {
        const rightItem = item.querySelector('ul > li:first-child > .item');
        if (rightItem) return rightItem;
    }

    const next = item.nextElementSibling;
    if (next) return next.querySelector('.item');

    const parentList = item.closest('ul');
    if (!parentList) return null;

    const parentItem = parentList.closest('li');
    if (!parentItem) return null;

    return parentItem.nextElementSibling.querySelector('.item');
}

function showQuery() {
    query.style.top = '20px';
    /*
    setInterval(function () // Иначе страница прыгает
    {
        $(query).find('input').focus();
    }, 10);*/
}

function hideQuery() {
    query.style.top = (2 - query.offsetHeight) + 'px';
    /*
    setInterval(function () // Иначе страница прыгает
    {
        $(query).find('input').blur();
    }, 10); */
}

function refresh() {
    const firstItem = getSurfaceFirstItem(),
        lastItem = getSurfaceLastItem();
    $(surface).css('padding-bottom', ((document.body.clientHeight - firstItem.offsetHeight) / 2) + 'px');
    $(surface).css('padding-top', ((document.body.clientHeight - lastItem.offsetHeight) / 2) + 'px');
    query.style.left = ((document.body.clientWidth - query.offsetWidth) / 2) + 'px';
    if (firstTimeQueryPositionRefresh) {
        setTimeout(() => {
            // Иначе анимация начинает работать сразу
            query.className = 'animated';
            firstTimeQueryPositionRefresh = false;
        }, 10);
    }
    refreshPosition();
}

function moveToItem(item, fromScroll) {
    if (item != null && (currentItem == null || currentItem !== item)) {
        if (currentItem !== null) {
            currentItem.classList.remove('focused');
            disableSelection(currentItem);
        }
        setPositionOffset(item);
        refreshPosition(fromScroll);
        item.classList.add('focused');
        enableSelection(item);
        currentItem = item;
    }
}

function refreshPosition(fromScroll) {
    const newLeft = ((document.body.clientWidth - offsetWidth) / 2 - offsetLeft) + 'px',
        newScrollTop = (offsetTop - (document.body.clientHeight - offsetHeight) / 2);
    if (firstTimePositionRefresh) {
        surface.style.left = newLeft;
        if (!fromScroll) {
            $(window).scrollTop(newScrollTop);
        }
        firstTimePositionRefresh = false;
    } else {
        $(surface).stop(true);
        if (fromScroll) {
            $(surface).animate({
                left: newLeft,
                queue: false
            }, 600);
        } else {
            $('html').stop(true);
            ignoreScrollEvent = true;
            $(surface).animate({
                left: newLeft,
                queue: false
            }, 500, function () {
                ignoreScrollEvent = false;
            });
            $('html').animate({
                scrollTop: newScrollTop,
                queue: false
            }, 500, function () {
                currentScrollTop = newScrollTop;
                ignoreScrollEvent = false;
            })
        }
    }
}

function setPositionOffset(obj) {
    const p = getPosition(obj, surface);
    offsetLeft = p.left;
    offsetTop = p.top;
    offsetWidth = obj.offsetWidth;
    offsetHeight = obj.offsetHeight;
}

function getPosition(obj, relativeTo) {
    let left = 0,
        top = 0

    if (!obj.offsetParent) return { 'left': left, 'top': top };

    do {
        left += obj.offsetLeft;
        top += obj.offsetTop;
    } while (obj === obj.offsetParent && obj !== relativeTo);
    return { 'left': left, 'top': top };
}
