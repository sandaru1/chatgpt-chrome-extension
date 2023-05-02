import {getAPIKey} from "../common.js"
import {checkAPIkey} from '../chatGPT.js'

const saveOptions = () => {
    const apiKey = document.getElementById('api_key').value;
    const loading = document.getElementById("loadingContainer");
    const saveButton = document.getElementById('save');
    const successContainer = document.getElementById('successContainer');
    const errorContainer = document.getElementById('errorContainer');
    
    saveButton.disabled = true;
    loading.classList.remove("hidden");

    checkAPIkey(apiKey).then((valid) => {
        saveButton.disabled = false;
        loading.classList.add("hidden");
        if (valid) {
            chrome.storage.sync.set(
                { api_key: apiKey },
                () => {
                    successContainer.classList.remove("hidden");
                    setTimeout(() => successContainer.classList.add("hidden"), 5000);
                }
            );        
        } else {
            document.getElementById('api_key').focus();
            errorContainer.classList.remove("hidden");
            setTimeout(() => errorContainer.classList.add("hidden"), 5000);
        }
    });
};

const restoreOptions = () => {
    getAPIKey().then((key) => {
        if (key != null) {
            document.getElementById('api_key').value = key;
        }
    });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);