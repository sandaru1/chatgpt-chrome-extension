var currentClickedElement  = null;
// Everytime a context acton is done, a new hash is created to store the element.
// The element cannot be passed to the background worker because of the isolation
var hashes = {};

const LOADING_DIV_ID = "chat-gpt-loading";
const LOADING_HTML = '<div id="chat-gpt-loading" style="width:250px;height:60px;background-color: rgba(255,255,255,0.75);position:fixed;right:16px;top:16px;padding-left:5px;font-size:15px;border:1px solid #000;display:flex;color:#000;align-items:center;z-index:2147483647;"><svg version="1.1" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve" width="40px" height="40px"><path fill="#000" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform></path><path fill="#000" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite"></animateTransform></path><path fill="#000" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5L82,35.7z"><animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50" to="360 50 50" repeatCount="indefinite"></animateTransform></path></svg><div style="margin-left:16px">Querying ChatGPT...</div></div>';

document.addEventListener("contextmenu", function(event){
    currentClickedElement = event.target;
}, true);

function showLoadingIndicator() {
    let loading = document.getElementById(LOADING_DIV_ID);
    if (loading == null) {
        document.body.insertAdjacentHTML('beforeend',LOADING_HTML);
        loading = document.getElementById(LOADING_DIV_ID);
    }
    loading.style.display = "flex";
}

function hideLoadingIndicator() {
    const loading = document.getElementById(LOADING_DIV_ID);
    if (loading != null) {
        loading.style.display = "none";
    }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // Start saving the current element and selection first
    // The ChatGPT request is going to take time
    // The user could change their click and selection in the meantime
    if (message.type=="StartProcessing") {
        showLoadingIndicator();
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
        hideLoadingIndicator();
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