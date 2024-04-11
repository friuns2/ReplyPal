
let dev = true;
if (chrome.runtime.id !== "obdlnchegmepijlajfencdfpaikleolk") {
    console.log = function () {
    };
    dev=false;
}


String.prototype.replaceRN = function () {
    return this.replace(/[\r\n]/g, " ").replace(/"/g, "'");
}





/** @type {ChatApp} */
let chatApp;

const initialized = new Set();

async function main() {
    await LoadSettings();
    SelectionPopupButtons();
    let host = window.location.host;
    if (host === "outlook.live.com")
        chatApp = new Outlook();
    else if (host === "web.whatsapp.com")
        chatApp = new Whatsapp();
    else if (host === "web.telegram.org")
        chatApp = new Telegram();
    else if (host === "mail.google.com")
        chatApp = new Gmail();
    else if (host === "www.messenger.com")
        chatApp = new Messenger();
    else if (host === "discord.com")
        chatApp = new Discord();
    else if (host === "www.reddit.com")
        setInterval(() => {
            for (const element of document.querySelectorAll(".DraftEditor-root")) {
                if (!initialized.has(element)) {
                    initialized.add(element)
                    if (!chatApp) chatApp = [];
                    let ln = new Reddit();
                    ln.rootPanel = document.body;
                    chatApp.push(ln);
                }
            }
        }, 1000);
    else if (host === "twitter.com")
        chatApp = new Twitter();
    else if (host === "app.slack.com") {
        setInterval(() => {
            for (const element of document.querySelectorAll(".p-workspace__secondary_view_contents,.p-workspace__primary_view_contents")) {
                if (!initialized.has(element)) {
                    initialized.add(element)
                    if (!chatApp) chatApp = [];
                    let ln = new Slack();
                    ln.rootPanel = element;
                    chatApp.push(ln);
                }
            }
        }, 1000);

    } else if (host === "www.linkedin.com")
        setInterval(() => {
            for (const element of document.querySelectorAll(".msg-convo-wrapper, #app-container")) {
                if (!initialized.has(element)) {
                    initialized.add(element)
                    if (!chatApp) chatApp = [];
                    let ln = new LinkedIn();
                    ln.rootPanel = element;
                    chatApp.push(ln);
                }
            }
        }, 1000);


    else {
        console.log("Chat app not supported, time: " + new Date().toLocaleTimeString());

    }


}


main();
let abortController;
let curChatApp = chatApp;
async function SendMessage(message) {


    //(settings.gptVersion === "OpenAssistant" || !settings.gptVersion? OpenAssistant: GPTApi)
    await LoadSettings();
/*
    if(!settings.gptApiKey) {
        popup.textArea.value ="Please Login, copy Api Key to settings from https://platform.openai.com/account/api-keys";
        await new Promise((resolve) => setTimeout(resolve, 1000));
        //open settings window
        let w =await window.open("https://platform.openai.com/account/api-keys", '_blank');
        while (!settings.gptApiKey) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await LoadSettings();
        }
        w?.close();
    }
*/
    abortController?.abort();
    abortController = new AbortController();

    GPTApi(abortController,[{role: "user", content: message}],(text,done)=>{
        //if(done)
            //generateAudio(text);
        popup.textArea.value = text?.replace("[Your Name]", "").replace("<Person1>", "").replace("<Person2>", "").replace("Person1", "").replace("Person2", "");
        if (popup.textArea.scrollHeight < window.innerHeight / 2) {
            popup.textArea.style.height = 'auto';
            popup.textArea.style.height = popup.textArea.scrollHeight + 'px';
            AdjustPopupPosition();
        }
        if(curChatApp)
            curChatApp.button.disabled = false;
    },null, ()=>{

    });
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function SetValue(inputElement, text) {
    await sleep(300);

    inputElement.focus(); await sleep(300);
// Select all the contents
    document.execCommand('selectAll', false, null);
    await sleep(300);

    // Replace the selected text with the new text
    document.execCommand('insertText', false, text);
    await sleep(300);
   // Create an input event
const inputEvent = new InputEvent('input', {
    inputType: 'insertText',
    data: text,
    bubbles: true,
    cancelable: true,
    composed: true,
});

// Dispatch the input event to the target element
inputElement.dispatchEvent(inputEvent);



}




chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "getSelection") {
        OnButtonClick(settings.templates[message.templateID], message.selectedText);
    }
});
