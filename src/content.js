var currentClickedElement  = null;
// Everytime a context acton is done, a new hash is created to store the element.
// The element cannot be passed to the background worker because of the isolation
var hashes = {};

document.addEventListener("contextmenu", function(event){
    currentClickedElement = event.target;
}, true);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // Start saving the current element and selection first
    // The ChatGPT request is going to take time
    // The user could change their click and selection in the meantime
    if (message.type=="StartProcessing") {
        const hash = crypto.randomUUID();
        if (currentClickedElement.isContentEditable) {
            hashes[hash] = {
                element:currentClickedElement,
                selection: window.getSelection()
            };    
        } else {
            hashes[hash] = {
                element:currentClickedElement,
                start:currentClickedElement.selectionStart,
                end:currentClickedElement.selectionEnd
            };    
        }
        sendResponse(hash);
    } else if (message.type=="ReplaceText") {
        const info = hashes[message.hash];
        if (info.element.isContentEditable) {
            changeEditable(info,message.text);
        } else {
            changeField(info,message.text);
        }
    }
});

function changeField(info,text) {
    info.element.value = info.element.value.slice(0, info.start) + text + info.element.value.substr(info.end);
}

async function changeEditable(info,text) {
    if (info.element.isContentEditable) {
        info.selection.deleteFromDocument();
        if (info.selection.rangeCount == 0) {
            info.selection.addRange(document.createRange());
        }        
        const range = info.selection.getRangeAt(0);
        range.insertNode(document.createTextNode(text));
    }
}