import {getAPIKey} from "./common.js"

const EDIT_API_ENDPOINT = "https://api.openai.com/v1/edits";
const EDIT_MODEL = "text-davinci-edit-001";
const EDIT_INSTRUCTION = "Rewrite following text";

const CHAT_COMPLETION_EDNPOINT = "https://api.openai.com/v1/chat/completions";
const CHAT_COMPLETION_MODEL = "gpt-3.5-turbo";

const MODELS_LIST = "https://api.openai.com/v1/models";

export const USAGE_URL = "https://platform.openai.com/account/usage";

export async function checkAPIkey(apiKey) {
    const res = await fetch(MODELS_LIST, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
        }
    });
    const json = await res.json();
    if (json.error) {
        return false;
    }
    return true;
} 

async function chatGPT(api,body) {
    const apiKey = await getAPIKey();
    if (apiKey != null && apiKey != "") {
        const res = await fetch(api, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify(body)
        }); 
        return await res.json();
    } else {
        chrome.runtime.openOptionsPage();
    }
    return null;
}

export async function rewriteText(input) {
    /*return await chatGPT(EDIT_API_ENDPOINT,{
        "model":EDIT_MODEL,
        "input":input,
        "instruction":EDIT_INSTRUCTION
    });*/

    return await chatGPT(CHAT_COMPLETION_EDNPOINT,{
        "model":CHAT_COMPLETION_MODEL,
        "messages":[
            {
                "role":"user",
                "content":EDIT_INSTRUCTION
            },
            {
                "role":"user",
                "content":input
            }
        ]
    });
}

export async function askChatGPT(input) {
    return await chatGPT(CHAT_COMPLETION_EDNPOINT,{
        "model":CHAT_COMPLETION_MODEL,
        "messages":[
            {
                "role":"user",
                "content":input
            }
        ]
    });
}