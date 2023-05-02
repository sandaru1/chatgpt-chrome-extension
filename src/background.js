import {getAPIKey} from "./common.js"
import {rewriteText,askChatGPT,USAGE_URL} from './chatGPT.js'

chrome.runtime.onInstalled.addListener(async () => {
    getAPIKey().then((key) => {
        if (key == null) {
            chrome.runtime.openOptionsPage();
        }
    });
    chrome.contextMenus.create({
        id:"rewrite",
        title: "Rewrite using ChatGPT",
        type: 'normal',
        contexts: ['editable']
    });
    chrome.contextMenus.create({
        id:"ask",
        title: "Ask ChatGPT",
        type: 'normal',
        contexts: ['editable']
    });
});

function processResults(results,tab,hash,item) {
    if (results && results.choices) {
        if (results.choices.length>0) {
            chrome.tabs.sendMessage(tab.id, {
                type:"ReplaceText",
                text:results.choices[0].message.content,
                hash:hash
            }, {frameId: item.frameId});        
        }
    } else if (results.error) {
        if (results.error.type=="insufficient_quota") {
            chrome.tabs.create({ url: USAGE_URL });
        }
    }
}

chrome.contextMenus.onClicked.addListener((item, tab) => {
    chrome.tabs.sendMessage(tab.id, {
        type:"StartProcessing"
    }, {frameId: item.frameId},function(hash) {
        if (item.menuItemId=="rewrite")  {
            rewriteText(item.selectionText).then((results) => processResults(results,tab,hash,item));
        } else if (item.menuItemId=="ask") {
            askChatGPT(item.selectionText).then((results) => processResults(results,tab,hash,item));
        }
    });
});

