//document.addEventListener('DOMContentLoaded', () => {
//    let queryInput = query.querySelector('textarea');
//    queryInput.addEventListener('keydown', (e) => {
//        if (e.key == "Enter") {

//            if (queryInput.value.startsWith("queryplan")) {
//                queryPlan(queryInput.value.substring(9, queryInput.value.length))
//            }

//            console.log(queryInput.value);
//        }
//    });
//});

function indentedText(string) {
    let lines = string.split('\n');
    // Clear the surface
    surface.innerHTML = '';
    // Build a new tree
    var list = extractItems(lines);
    surface.appendChild(list);
    // Reset the surface
    moveToItem(getSurfaceFirstItem());
    refresh();
}

function extractItems(lines) {
    let list = document.createElement("ul");
    if (lines.length > 0) {
        let firstLine = lines[0];
        let firstLineIndentLength = firstLine.search(/\S/);
        for (let i = 0; i < lines.length; i++) {
            let itemIndentLength = lines[i].search(/\S/);
            if (itemIndentLength == firstLineIndentLength) {
                let listItem = document.createElement("li");
                let item = document.createElement("div");
                item.classList.add("item");
                item.innerText = lines[i];
                listItem.appendChild(item);
                let innerLines = [];
                for (let j = i + 1; j < lines.length; j++) {
                    let innerItemIndentLength = lines[j].search(/\S/);
                    if (innerItemIndentLength == itemIndentLength) {
                        break;
                    }
                    innerLines.push(lines[j].substring(2, lines[j].length));
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
