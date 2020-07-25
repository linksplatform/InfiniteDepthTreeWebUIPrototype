function indentedText(string) {
    let lines = string.split('\n');
    // Clear the surface
    surface.innerHTML = '';
    // Build a new tree
    var list = extractItems(lines);
    surface.appendChild(list);
    // Reset the surface
    update(true);
}

function extractItems(lines) {
    let list = document.createElement("ul");
    if (lines.length > 0) {
        let firstLine = lines[0];
        let firstLineIndentLength = findFirstNonWhiteSpaceSymbol(firstLine);
        for (let i = 0; i < lines.length; i++) {
            let itemIndentLength = findFirstNonWhiteSpaceSymbol(lines[i]);
            if (itemIndentLength == firstLineIndentLength) {
                let listItem = document.createElement("li");
                let item = document.createElement("div");
                item.classList.add("item");
                item.innerText = lines[i].trim();
                listItem.appendChild(item);
                let innerLines = [];
                for (let j = i + 1; j < lines.length; j++) {
                    let innerItemIndentLength = findFirstNonWhiteSpaceSymbol(lines[j]);
                    if (innerItemIndentLength == itemIndentLength) {
                        break;
                    }
                    innerLines.push(lines[j]);
                }
                if (innerLines.length > 0) {
                    let innerList = extractItems(innerLines);
                    listItem.appendChild(innerList);
                }
                list.appendChild(listItem);
            }
        }
    }
    return list;
}

function findFirstNonWhiteSpaceSymbol(string) {
    return string.search(/\S/);
}