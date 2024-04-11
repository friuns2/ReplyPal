/*
chrome.runtime.onInstalled.addListener(async () => {
    chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            chrome.tabs.reload(tabs[i].id);
        }
    });
});
*/
const contextMenu = "Read_Selection2";
let settings;
chrome.storage.local.get(null, (s) => {
    settings = s;
    chrome.contextMenus.removeAll()
    const buttons = settings.templates
    buttons.forEach((template, index) => {
        if(!template.profile)
        chrome.contextMenus.create({
            id: index+"",
            title: template.title,
            contexts: ["selection"],
        });

    })


});

chrome.contextMenus.onClicked.addListener(function (info, tab) {

    chrome.tabs.sendMessage(tab.id, {action: "getSelection", templateID: info.menuItemId,selectedText:info.selectionText});


});