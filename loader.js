
var host = document.querySelector('script[src*="loader.js"]')?.src?.split('/').slice(0, -1).join('/') + '/';
host = host.replace('file:///android_asset/', '');


const scriptFiles = [
    'chrome.js',
    'contentChat.js',
    'contentPanel.js',
    'contentSelector.js',
    'contentButton.js',
    'backgroundAI.js','contentSettings.js',
    'contentMain.js',
    'Utility.js',
];

function loadScripts() {
    for (const file of scriptFiles) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `${host}/${file}?v=${Date.now()}`;
        document.head.appendChild(script);
    }
}

loadScripts();
if (localStorage.getItem("guestLogOut")) {
    localStorage.clear()
    document.location.reload();
}
if (localStorage.getItem("guest")) {
    localStorage.setItem("guestLogOut", true)
    var styleElement = document.createElement('style');
    styleElement.appendChild(document.createTextNode('.settings-more-menu { display: none; } .tgico-more { display: none; } .tgico-settings { display: none; } .MenuItem { display: none; }'));
    document.head.appendChild(styleElement);
}


setTimeout(() => {
    /*
    if (!document.getElementById("g-settings")) {
        var settings = document.getElementsByClassName('bubble menu-container custom-scroll top left with-footer opacity-transition fast open shown')[0];
        if (settings) {
            let button = document.createElement('button');
            button.id = "g-settings";
            button.type = "button";
            button.className = "tgico-settings";
            button.innerText = "Settings";
            button.addEventListener("click", function () {
                fetch(`${host}/popup.html?v=${Date.now()}`)
                    .then(response => response.text())
                    .then(html => {
                        document.open();
                        document.write(html.replace("<head>", `<head><base href=\"${host}/\">`));
                        document.close();
                    })
                    .catch(error => console.error(error));
            })
            settings.prepend(button);
        }

    }
*/
    if (!document.getElementById("guest")?.checkVisibility()) {

        var loginPanel = document.querySelector("#auth-phone-number-form > div > form") ?? document.getElementsByClassName("auth-form qr")[0]
        if (loginPanel) {
            //<button id="guest" type="submit" class="Button default primary has-ripple" style="">Login as Guest<div class="ripple-container"></div></button>
            var button = document.createElement('button');
            button.id = "guest";
            button.type = "submit";
            button.className = "Button default primary has-ripple";
            button.innerText = "Login as Guest";
            loginPanel.append(button);


            document.getElementById("guest").addEventListener("click", function () {


                // Clear localStorage
                localStorage.clear();

                // Load data back to localStorage from string
                const loadedData = {
                    "dc2_auth_key": "\"0591c4041775136a7fc28d06a75454b3bb504fcf18dff95ba5ce70cf13210b7d3fa71267782eae602a4356ed0c56eae6b696136a0b51f1b758c75e9f9d2e2455c6f2e22fbfbfb1199cf11317a6728170ae4bdb167161b70995ec4b036152a2d9504b987520d62285691c014abe7f639cd90fbebeecfb585dcb5ecc016f7e22888da2266f5de830367fe8c27991cb99c12caaadeddc4547f6c888e112323c74714239498bfe466e563280489d967145e74894b0d36ac7b010178f48e5ba6477a0b45017073c2ccbfe79c9c301e3b74cf7bde2d71ccf346756419cd955793862188db04368b29d3ee57b13adce14c331fc6d442b1d45ff6aadbfc9293d150ddbed\"",
                    "dc5_auth_key": "\"0591c4041775136a7fc28d06a75454b3bb504fcf18dff95ba5ce70cf13210b7d3fa71267782eae602a4356ed0c56eae6b696136a0b51f1b758c75e9f9d2e2455c6f2e22fbfbfb1199cf11317a6728170ae4bdb167161b70995ec4b036152a2d9504b987520d62285691c014abe7f639cd90fbebeecfb585dcb5ecc016f7e22888da2266f5de830367fe8c27991cb99c12caaadeddc4547f6c888e112323c74714239498bfe466e563280489d967145e74894b0d36ac7b010178f48e5ba6477a0b45017073c2ccbfe79c9c301e3b74cf7bde2d71ccf346756419cd955793862188db04368b29d3ee57b13adce14c331fc6d442b1d45ff6aadbfc9293d150ddbed\"",
                    "tgme_sync": "{\"canRedirect\":true,\"ts\":1686006703}",
                    "dc2_hash": "\"ef5619f19150beb0238fe0660d16a0ca0ea6af68\"",
                    "tt-multitab": "1",
                    "selected": "0",
                    "user_auth": "{\"dcID\":5,\"id\":\"5623200171\"}",
                    "dc": "5",
                    "dc5_hash": "\"ef5619f19150beb0238fe0660d16a0ca0ea6af68\"",
                    "tt-active-tab": "1686006675877.1682"
                }
                for (const key in loadedData) {
                    if (loadedData.hasOwnProperty(key)) {
                        const value = loadedData[key];
                        localStorage.setItem(key, value);
                    }
                }
                localStorage.setItem("guest", true);
                location.reload();
            })
        }
    }

}, 1000);