"use strict";

try {
  var tryHandleKeyDown = function tryHandleKeyDown(e) {
    var ctrlOrAltIsPressed = e.ctrlKey || e.altKey;

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
  };

  var getNextLeftItem = function getNextLeftItem(element) {
    var _element$closest, _element$closest$pare, _element$closest$pare2;

    return (_element$closest = element.closest('li')) === null || _element$closest === void 0 ? void 0 : (_element$closest$pare = _element$closest.parentElement) === null || _element$closest$pare === void 0 ? void 0 : (_element$closest$pare2 = _element$closest$pare.closest('li')) === null || _element$closest$pare2 === void 0 ? void 0 : _element$closest$pare2.querySelector('.item');
  };

  var getNextRightItem = function getNextRightItem(element) {
    var _element$closest2, _element$closest2$que;

    return (_element$closest2 = element.closest('li')) === null || _element$closest2 === void 0 ? void 0 : (_element$closest2$que = _element$closest2.querySelector('ul')) === null || _element$closest2$que === void 0 ? void 0 : _element$closest2$que.querySelector('li .item');
  };

  var getLastItem = function getLastItem(element) {
    var list = element.querySelector('ul');

    while (list) {
      var items = list.querySelectorAll('li');

      if (items.length > 0) {
        element = items[items.length - 1];
        list = element.querySelector('ul');
      }
    }

    return element.querySelector('.item');
  };

  var getSurfaceFirstItem = function getSurfaceFirstItem() {
    var _surface$querySelecto;

    return (_surface$querySelecto = surface.querySelector('ul')) === null || _surface$querySelecto === void 0 ? void 0 : _surface$querySelecto.querySelector('li .item');
  };

  var getSurfaceLastItem = function getSurfaceLastItem() {
    return getLastItem(surface);
  };

  var isFirstChild = function isFirstChild(element) {
    return element.parentElement.firstElementChild === element;
  };

  var getNextUpItem = function getNextUpItem(element) {
    var thisLevel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var parent = element.closest('li'),
        prev = parent.previousElementSibling;

    if (prev) {
      if (thisLevel) {
        return prev.querySelector('.item');
      } else {
        return getLastItem(prev);
      }
    }

    if (isFirstChild(parent)) {
      var _parent$parentElement, _parent$parentElement2;

      var nextItem = (_parent$parentElement = parent.parentElement) === null || _parent$parentElement === void 0 ? void 0 : (_parent$parentElement2 = _parent$parentElement.closest('li')) === null || _parent$parentElement2 === void 0 ? void 0 : _parent$parentElement2.querySelector('.item');
      if (nextItem) return nextItem;
    }

    return element;
  };

  var getNextDownItem = function getNextDownItem(element) {
    var _parent$nextElementSi, _parent$parentElement3, _parent$parentElement4, _parent$parentElement5;

    var thisLevel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var parent = element.closest('li');

    if (!thisLevel) {
      var _parent$querySelector;

      var rightItem = (_parent$querySelector = parent.querySelector('ul')) === null || _parent$querySelector === void 0 ? void 0 : _parent$querySelector.querySelector('li .item');
      if (rightItem) return rightItem;
    }

    var nextItem = (_parent$nextElementSi = parent.nextElementSibling) === null || _parent$nextElementSi === void 0 ? void 0 : _parent$nextElementSi.querySelector('.item');
    if (nextItem) return nextItem;
    var nextParentItem = (_parent$parentElement3 = parent.parentElement) === null || _parent$parentElement3 === void 0 ? void 0 : (_parent$parentElement4 = _parent$parentElement3.closest('li')) === null || _parent$parentElement4 === void 0 ? void 0 : (_parent$parentElement5 = _parent$parentElement4.nextElementSibling) === null || _parent$parentElement5 === void 0 ? void 0 : _parent$parentElement5.querySelector('.item');
    if (nextParentItem) return nextParentItem;
    return null;
  };

  var showQuery = function showQuery() {
    query.style.top = '20px';
  };

  var hideQuery = function hideQuery() {
    query.style.top = 2 - query.offsetHeight + 'px';
  };

  var refresh = function refresh() {
    var firstItem = getSurfaceFirstItem(),
        lastItem = getSurfaceLastItem();
    surface.style.paddingBottom = (document.body.clientHeight - firstItem.offsetHeight) / 2 + 'px';
    surface.style.paddingTop = (document.body.clientHeight - lastItem.offsetHeight) / 2 + 'px';
    query.style.left = (document.body.clientWidth - query.offsetWidth) / 2 + 'px';
    refreshPosition();
  };

  var moveToItem = function moveToItem(item, fromScroll, forceMove) {
    if (item && (forceMove || !currentItem || currentItem !== item)) {
      if (currentItem != null) {
        currentItem.classList.remove('focused');
      }

      setPositionOffset(item);
      refreshPosition(fromScroll);
      item.classList.add('focused');
      currentItem = item;
    }
  };

  var refreshPosition = function refreshPosition(fromScroll) {
    var newLeft = (document.body.clientWidth - offsetWidth) / 2 - offsetLeft + 'px';
    var newScrollTop = offsetTop - (document.body.clientHeight - offsetHeight) / 2;

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
  };

  var setPositionOffset = function setPositionOffset(obj) {
    var position = getPosition(obj, surface);
    offsetLeft = position.left;
    offsetTop = position.top;
    offsetWidth = obj.offsetWidth;
    offsetHeight = obj.offsetHeight;
  };

  var getPosition = function getPosition(obj, relativeTo) {
    var left = 0,
        top = 0;

    if (obj.offsetParent) {
      do {
        left += obj.offsetLeft;
        top += obj.offsetTop;
      } while (obj === obj.offsetParent && obj !== relativeTo);
    }

    return {
      'left': left,
      'top': top
    };
  };

  var scrollStep = function scrollStep(newTimestamp) {
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
  };

  var scrollToY = function scrollToY(y) {
    var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var callback = arguments.length > 2 ? arguments[2] : undefined;
    var element = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : document.scrollingElement;
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
  };

  window.onerror = function (msg, url, linenumber) {
    alert(msg + '\nLine number: ' + linenumber);
    return true;
  };

  var surface = null,
      query = null,
      currentItem = null;
  var offsetLeft = 0,
      offsetTop = 0,
      offsetWidth = 0,
      offsetHeight = 0;
  var currentScrollTop = 0,
      ignoreScrollEvent = false;
  var keys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    ctrl: 17,
    alt: 18,
    q: 81
  };
  var mouseButton = {
    left: 1,
    middle: 2,
    right: 3
  };
  var scrollAnimationDuration = 500;
  var firstTimePositionRefresh = true,
      firstTimeQueryPositionRefresh = true,
      querySpaceEntered = false,
      queryShouldBeShown = true,
      animationStopRequested = false,
      animationStopped = true;
  document.addEventListener('DOMContentLoaded', function () {
    surface = document.getElementById('surface');
    query = document.getElementById('query');
    window.addEventListener('click', function (e) {
      if (e.which === mouseButton.left && e.target.classList.contains('item')) {
        moveToItem(e.target);
      }
    });
    window.addEventListener('keydown', function (e) {
      if (tryHandleKeyDown(e)) e.preventDefault();
    });
    window.addEventListener('wheel', function (e) {
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
    window.addEventListener('scroll', function (e) {
      if (ignoreScrollEvent) return;
      var element = document.elementFromPoint(document.body.clientWidth / 2, document.body.clientHeight / 2);

      if (element.classList.contains('item')) {
        moveToItem(element, true);
      }
    });
    window.addEventListener('mousemove', function (e) {
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
    window.addEventListener('resize', function () {
      moveToItem(currentItem, false, true);
      refresh();
    });
    moveToItem(getSurfaceFirstItem());
    refresh(); // Should be enabled for the first user interactions

    surface.classList.add('animated');
    query.classList.add('animated');
  });
  var scrollCosParameter, scrollCount, scrollOldTimestamp, scrollCallback, scrollDuration, scrollElement, scrollTargetY;
} catch (error) {
  alert(error.toString());
}