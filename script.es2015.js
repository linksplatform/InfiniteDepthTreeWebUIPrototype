"use strict";

try {
    var update = function update(reset) {
        if (reset) {
            items = document.querySelectorAll(".item");

            for (var i = 0; i < items.length; i++) {
                items[i].dataset.index = i;
            }

            currentItem = getSurfaceFirstItem();
        }

        moveToItem(currentItem, false, true);
        refresh();
    };

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

        return (_element$closest = element.closest("li")) === null ||
            _element$closest === void 0
            ? void 0
            : (_element$closest$pare = _element$closest.parentElement) ===
                  null || _element$closest$pare === void 0
            ? void 0
            : (_element$closest$pare2 = _element$closest$pare.closest("li")) ===
                  null || _element$closest$pare2 === void 0
            ? void 0
            : _element$closest$pare2.querySelector(".item");
    };

    var getNextRightItem = function getNextRightItem(element) {
        var _element$closest2, _element$closest2$que;

        return (_element$closest2 = element.closest("li")) === null ||
            _element$closest2 === void 0
            ? void 0
            : (_element$closest2$que = _element$closest2.querySelector(
                  "ul"
              )) === null || _element$closest2$que === void 0
            ? void 0
            : _element$closest2$que.querySelector("li .item");
    };

    var getLastItem = function getLastItem(element) {
        var list = element.querySelector("ul");

        while (list) {
            var _items = list.querySelectorAll("li");

            if (_items.length > 0) {
                element = _items[_items.length - 1];
                list = element.querySelector("ul");
            }
        }

        return element.querySelector(".item");
    };

    var getSurfaceFirstItem = function getSurfaceFirstItem() {
        return items[0]; //return surface.querySelector('ul')?.querySelector('li .item');
    };

    var getSurfaceLastItem = function getSurfaceLastItem() {
        return items[items.length - 1]; //return getLastItem(surface);
    };

    var isFirstChild = function isFirstChild(element) {
        return element.parentElement.firstElementChild === element;
    };

    var getNextUpItem = function getNextUpItem(element) {
        var thisLevel =
            arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : false;

        if (!thisLevel) {
            // Optimization
            var currentIndex = parseInt(currentItem.dataset.index);

            if (currentIndex > 0) {
                return items[currentIndex - 1];
            }
        } // Universal logic

        var parent = element.closest("li"),
            prev = parent.previousElementSibling;

        if (prev) {
            if (thisLevel) {
                return prev.querySelector(".item");
            } else {
                return getLastItem(prev);
            }
        }

        if (isFirstChild(parent)) {
            var _parent$parentElement, _parent$parentElement2;

            var nextItem =
                (_parent$parentElement = parent.parentElement) === null ||
                _parent$parentElement === void 0
                    ? void 0
                    : (_parent$parentElement2 = _parent$parentElement.closest(
                          "li"
                      )) === null || _parent$parentElement2 === void 0
                    ? void 0
                    : _parent$parentElement2.querySelector(".item");
            if (nextItem) return nextItem;
        }

        return element;
    };

    var getNextDownItem = function getNextDownItem(element) {
        var _parent$querySelector;

        var thisLevel =
            arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : false;

        if (!thisLevel) {
            // Optimization
            var currentIndex = parseInt(currentItem.dataset.index);

            if (currentIndex < items.length - 1) {
                return items[currentIndex + 1];
            }
        } // Universal logic

        var parent = element.closest("li");
        var rightItem =
            (_parent$querySelector = parent.querySelector("ul")) === null ||
            _parent$querySelector === void 0
                ? void 0
                : _parent$querySelector.querySelector("li .item");
        if (rightItem && !thisLevel) return rightItem;

        while (parent) {
            var _parent$nextElementSi, _parent$parentElement3;

            var nextItem =
                (_parent$nextElementSi = parent.nextElementSibling) === null ||
                _parent$nextElementSi === void 0
                    ? void 0
                    : _parent$nextElementSi.querySelector(".item");
            if (nextItem) return nextItem;
            if (rightItem) break;
            parent =
                (_parent$parentElement3 = parent.parentElement) === null ||
                _parent$parentElement3 === void 0
                    ? void 0
                    : _parent$parentElement3.closest("li");
        }

        return null;
    };

    var showQuery = function showQuery() {
        query.style.top = "20px";
    };

    var hideQuery = function hideQuery() {
        query.style.top = 2 - query.offsetHeight + "px";
    };

    var refresh = function refresh() {
        var firstItem = getSurfaceFirstItem(),
            lastItem = getSurfaceLastItem();
        surface.style.paddingBottom =
            (document.body.clientHeight - firstItem.offsetHeight) /
                (window.innerWidth <= 600 ? 1.6 : 2) +
            "px";
        surface.style.paddingTop =
            (document.body.clientHeight - lastItem.offsetHeight) / 2 + "px";
        query.style.left =
            (document.body.clientWidth - query.offsetWidth) / 2 + "px";
        refreshPosition();
    };

    var moveToItem = function moveToItem(item, fromScroll, forceMove) {
        if (item && (forceMove || !currentItem || currentItem !== item)) {
            if (currentItem != null) {
                currentItem.classList.remove("focused");
            }

            currentItem = item;
            refreshPosition(fromScroll);
            item.classList.add("focused");
        }
    };

    var refreshPosition = function refreshPosition(fromScroll) {
        var newLeft =
            (document.body.clientWidth - currentItem.offsetWidth) / 2 -
            currentItem.offsetLeft +
            "px";
        var newScrollTop =
            currentItem.offsetTop -
            (document.body.clientHeight - currentItem.offsetHeight) / 2;

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

    var scrollStep = function scrollStep(newTimestamp) {
        if (scrollOldTimestamp !== null) {
            // if duration is 0 scrollCount will be Infinity
            scrollCount +=
                (Math.PI * (newTimestamp - scrollOldTimestamp)) /
                scrollDuration;

            if (scrollCount >= Math.PI) {
                animationStopped = true;
                scrollElement.scrollTop = scrollTargetY;
                if (scrollCallback) setTimeout(scrollCallback, 10);
                return;
            }

            scrollElement.scrollTop =
                scrollCosParameter +
                scrollTargetY +
                scrollCosParameter * Math.cos(scrollCount);
        }

        scrollOldTimestamp = newTimestamp;
        window.requestAnimationFrame(scrollStep);
    };

    var scrollToY = function scrollToY(y) {
        var duration =
            arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : 0;
        var callback = arguments.length > 2 ? arguments[2] : undefined;
        var element =
            arguments.length > 3 && arguments[3] !== undefined
                ? arguments[3]
                : document.scrollingElement;
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
        alert(msg + "\nLine number: " + linenumber);
        return true;
    };

    var items = [];
    var surface = null,
        query = null,
        currentItem = null;
    var lastScrollTop = 0,
        ignoreScrollEvent = false;
    var keys = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        ctrl: 17,
        alt: 18,
        q: 81,
    };
    var mouseButton = {
        left: 1,
        middle: 2,
        right: 3,
    };
    var scrollAnimationDuration = 500;
    var firstTimePositionRefresh = true,
        querySpaceEntered = false,
        queryShouldBeShown = true,
        animationStopped = true;
    document.addEventListener("DOMContentLoaded", function () {
        surface = document.getElementById("surface");
        query = document.getElementById("query");
        window.addEventListener("click", function (e) {
            if (
                e.which === mouseButton.left &&
                e.target.classList.contains("item")
            ) {
                moveToItem(e.target);
            }
        });
        window.addEventListener("keydown", function (e) {
            if (tryHandleKeyDown(e)) e.preventDefault();
        });
        window.addEventListener(
            "wheel",
            function (e) {
                e.preventDefault();

                if (e.deltaY < 0) {
                    moveToItem(getNextUpItem(currentItem));
                } else {
                    moveToItem(getNextDownItem(currentItem));
                }

                return false;
            },
            {
                passive: false,
            }
        );
        window.addEventListener("scroll", function (e) {
            if (ignoreScrollEvent) return;
            var baseOffset = items[0].offsetTop;
            var currentScrollTop = document.documentElement.scrollTop;

            var checkItem = function checkItem(item) {
                var min = item.offsetTop - baseOffset;
                var max = min + item.offsetHeight;

                if (currentScrollTop >= min && currentScrollTop < max) {
                    return true;
                }

                return false;
            };

            var delta = currentScrollTop - lastScrollTop;
            var currentIndex = parseInt(currentItem.dataset.index);

            if (delta > 0) {
                for (var i = currentIndex; i < items.length; i++) {
                    if (checkItem(items[i])) {
                        moveToItem(items[i], true);
                        break;
                    }
                }
            } else {
                for (var i = currentIndex; i >= 0; i--) {
                    if (checkItem(items[i])) {
                        moveToItem(items[i], true);
                        break;
                    }
                }
            }

            lastScrollTop = currentScrollTop;
        });
        window.addEventListener("mousemove", function (e) {
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
        window.addEventListener("resize", function () {
            update();
        });
        update(true); // Should be enabled for the first user interactions

        surface.classList.add("animated");
        query.classList.add("animated");
    });
    var scrollCosParameter,
        scrollCount,
        scrollOldTimestamp,
        scrollCallback,
        scrollDuration,
        scrollElement,
        scrollTargetY;
} catch (error) {
    alert(error.toString());
}
