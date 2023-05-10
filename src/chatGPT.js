import { getAPIKey } from "./common.js"

import { Configuration, OpenAIApi } from "../node_modules/openai-web/dist/openai.module.min.js"

const EDIT_INSTRUCTION = "Rewrite following text";

const CHAT_COMPLETION_MODEL = "gpt-3.5-turbo";

export const USAGE_URL = "https://platform.openai.com/account/usage";

export async function checkAPIkey(apiKey) {
    const configuration = new Configuration({
        apiKey: apiKey,
    });                
    const openai = new OpenAIApi(configuration);

    try {
        const response = await openai.listEngines();
        return true;
    } catch (e) {
        return false;
    }
}

async function chatCompletion(messages) {
    const apiKey = await getAPIKey();
    if (apiKey != null && apiKey != "") {
        const configuration = new Configuration({
            apiKey: apiKey,
        });
        const openai = new OpenAIApi(configuration);

        const response = await openai.createChatCompletion({
            model: CHAT_COMPLETION_MODEL,
            messages: messages,
        });

        return response.data;
    } else {
        chrome.runtime.openOptionsPage();
    }
    return null;
}


export async function rewriteText(input) {
    return await chatCompletion(
        [
            {
                "role": "user",
                "content": EDIT_INSTRUCTION
            },
            {
                "role": "user",
                "content": input
            }
        ]
    );
}

export async function askChatGPT(input) {
    return await chatCompletion(
        [
            {
                "role": "user",
                "content": input
            }
        ]
    );
}