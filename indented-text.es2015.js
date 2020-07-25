"use strict";

function indentedText(string) {
    var lines = string.split('\n'); // Clear the surface

    surface.innerHTML = ''; // Build a new tree

    var list = extractItems(lines);
    surface.appendChild(list); // Reset the surface

    moveToItem(getSurfaceFirstItem());
    refresh();
}

function extractItems(lines) {
    var list = document.createElement("ul");

    if (lines.length > 0) {
        var firstLine = lines[0];
        var firstLineIndentLength = firstLine.search(/\S/);

        for (var i = 0; i < lines.length; i++) {
            var itemIndentLength = lines[i].search(/\S/);

            if (itemIndentLength == firstLineIndentLength) {
                var listItem = document.createElement("li");
                var item = document.createElement("div");
                item.classList.add("item");
                item.innerText = lines[i];
                listItem.appendChild(item);
                var innerLines = [];

                for (var j = i + 1; j < lines.length; j++) {
                    var innerItemIndentLength = lines[j].search(/\S/);

                    if (innerItemIndentLength == itemIndentLength) {
                        break;
                    }

                    innerLines.push(lines[j].substring(2, lines[j].length));
                }

                if (innerLines.length > 0) {
                    var innerList = extractItems(innerLines);
                    listItem.appendChild(innerList);
                }

                list.appendChild(listItem);
            }
        }
    }

    return list;
}