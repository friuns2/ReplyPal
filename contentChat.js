//document.body.prepend(`Plugin loaded`);

globalThis.buttonID = "gptButton";
let lastFocusedInputField;

setInterval(() => {
    let input = document.activeElement;
    if (input && (input.matches('[contenteditable="true"]') || input.matches('input[type="text"]') || input.matches('textarea'))) {
      lastFocusedInputField = input;
    }
  }, 1000);

class ChatApp {
    constructor() {
        this.button = null;
        this.userName = null;
        this.rootPanel = document.body;
        setInterval(() => {
            this.Update();
        }, 1000);
    }


    Update() {
        let panel = this.getPanel();
        
        if (!panel) return;

        if (panel.getElementsByClassName(buttonID).length !== 0) return;
        this.button = document.createElement("button");
        this.button.className = this.getButtonClass() + " " + buttonID
        this.button.style.fontSize = "large";
        this.button.style.textAlign = "center";
        this.button.innerHTML = "GPT";
        panel.insertBefore(this.button, panel.childNodes[1]);
        //On button down

        this.button.addEventListener("mousedown", () => {
            this.button.disabled = true;
            this.SendMessageToGPT();
        });

        if (this.button.disabled && this.button.textContent.length < 5)
            this.button.textContent += ".";
        else
            this.button.textContent.replace(".", "");


    }

    getPanel() {
        return this.rootPanel.getElementsByClassName(this.getButtonClass())[0]?.parentElement
    }



    getButtonClass() {
        return "Button";
    }

    getInputField() {
        
        return lastFocusedInputField || this.rootPanel.querySelector('[contenteditable="true"],input[type="text"],textarea');
        //(document.querySelector('input') || document.querySelector('textarea') || document.querySelector('[contenteditable="true"]'))
    }

    async getMessages() {
        return [];
    }


    async SendMessageToGPT(selectedText) {
        popup.show();
        curChatApp = this;

        await LoadSettings();


        let messages = await this.getMessages();
        let msg = this.getInputField()?.innerText?.trim() || this.getInputField()?.value?.trim() || "";
        let userName = this.userName ?? "Person1"

        if(selectedText) {
            let index = messages.findIndex(msg => msg.includes(selectedText.trim())) + 1;
            if(index>0)
                messages = messages.slice(0,index);
        }
        messages = messages.slice(-10);


        let text = TemplateProfile( {
            ...settings,
            title: document.title,
            userName: userName,
            input: msg,
            selected: document.getSelection().toString(),
            messages: messages.join("\n")
        })
        console.log(text);
        SendMessage(text);//chat send
    }


}
class Outlook extends ChatApp {
    getButtonClass() {
        return "ms-Button ms-Button--default DlILi pNJCa";

    }
    getPanel() {
        return this.rootPanel.getElementsByClassName("_2xy_p _1bAtO")[0] || super.getPanel();
    }

    getMessages() {
        for (let index = 0; index < 10; index++)
            for (let cl of document.getElementsByClassName("GjFKx")) {
                cl.click();
            }
        return Array.from(document.querySelectorAll('[aria-label="Email message"]')).map(a=>a.getElementsByClassName("OZZZK")[0]?.firstChild?.textContent+":\n"+a.querySelector('[aria-label="Message body"]').innerText).filter(a=>!a.startsWith(undefined));
    }


}

class Slack extends ChatApp {
    getButtonClass() {
        return "c-button-unstyled c-icon_button c-icon_button--size_small c-wysiwyg_container__button c-wysiwyg_container__button--composer c-wysiwyg_container__button--composer_active c-icon_button--default";
    }

    Update() {
        if (!this.userName)
            this.userName = document.querySelector('[data-qa="channel_sidebar_name_you"]').parentElement?.childNodes[0]?.textContent;
        super.Update();
    }

    getMessages() {

        let lastDefinedName = "";
        return Array.from(this.rootPanel.getElementsByClassName("c-message_kit__gutter__right"))
            .map(a => {

                const name = a.getElementsByClassName("c-link--button c-message__sender_button")[0]?.innerText || lastDefinedName;
                lastDefinedName = name;
                const message = a.getElementsByClassName("c-message_kit__blocks c-message_kit__blocks--rich_text")[0]?.innerText;
                if (!message) return "";
                else
                    return `<${name}>:\n${message}\n\n`;
            }).filter(a => a);

    }
}

class Twitter extends ChatApp {
    getButtonClass() {
        return "css-18t94o4 css-1dbjc4n r-l5o3uw r-42olwf r-sdzlij r-1phboty r-rs99b7 r-19u6a5r r-2yi16 r-1qi8awa r-1ny4l3l r-ymttw5 r-o7ynqc r-6416eg r-lrvibr css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0";
    }

    getPanel() {
        if (this.getInputField() === document.activeElement)
            return this.getInputField().parentElement.parentElement.parentElement.parentElement;

    }

    getMessages() {
        return [this.rootPanel.getElementsByClassName("css-901oao r-1nao33i r-1qd0xha r-1inkyih r-16dba41 r-rjixqe r-bcqeeo r-bnwqim r-qvutc0")[0]?.innerText, this.rootPanel.getElementsByClassName("css-1dbjc4n r-18u37iz r-1ut4w64 r-1ny4l3l r-1udh08x r-1qhn6m8 r-i023vh")[0]?.innerText].filter(a => a)
    }

}

class LinkedIn extends ChatApp {
    getButtonClass() {
        return "msg-form__send-button artdeco-button artdeco-button--1";
    }
    getInputField() {
        //return base
        return this.rootPanel.querySelector('.msg-form__contenteditable')||super.getInputField();
    }

    getPanel() {
        if (!this.userName)
            this.userName = document.querySelector(".global-nav__me-photo.ember-view, .profile-image.person-entity-small.person-entity")?.alt;
        //if(this.getInputField() === this.document.activeElement)
        return this.rootPanel.querySelector(".msg-form__left-actions.display-flex, #messaging-reply-form");
    }

    getMessages() {

        let lastDefinedName = "";
        return Array.from(this.rootPanel.querySelectorAll(".msg-s-event-listitem, .member-message"))
            .map(a => {

                const name =lastDefinedName = a.classList.contains("text-right")?this.userName??"Person1": a.querySelector(".profile-image, .msg-s-event-listitem__profile-picture")?.alt || lastDefinedName;
                 
                const message = a.querySelector(".msg-s-event-listitem__body, .message-body")?.innerText;
                if (!message) return "";
                else
                    return `<${name}>:\n${message}\n\n`;
            }).filter(a => a);

    }


}

class Reddit extends ChatApp {

    getInputField() {
        return this.getPanel().querySelector('[contenteditable="true"]');
    }

    getPanel() {
        if (!this.userName)
            this.userName = this.rootPanel.getElementsByClassName("_2BMnTatQ5gjKGK5OWROgaG")[0]?.innerText;
        if (!this.panel)
            this.panel = this.rootPanel.getElementsByClassName("_3F2J0fSnCI3ZvF_tBSaV0s")[0]?.parentElement;
        return this.panel;
    }

    getButtonClass() {
        return "_22S4OsoDdOqiM-hPTeOURa _2iuoyPiKHN3kfOoeIQalDT _10BQ7pjWbeYP63SAPNS8Ts _3uJP0daPEH2plzVEYyTdaH ";
    }


    getMessages() {

        const findParentWithClass = (node, className) => node.parentNode ? (node.parentNode?.classList?.contains(className) ? node.parentNode : findParentWithClass(node.parentNode, className)) : null;
        let msgClass = "_3sf33-9rVAO_v4y0pIW_CH";
        let messages = Array.from(this.rootPanel.getElementsByClassName(msgClass));

        let endMessage = findParentWithClass(this.getPanel(), msgClass);
        messages = messages.slice(0, Array.from(messages).indexOf(endMessage) + 1);
        messages = messages.slice(-9);
        messages.unshift(this.rootPanel.getElementsByClassName("_1oQyIsiPHYt6nx7VOmd1sz _2rszc84L136gWQrkwH6IaM  Post")[0]);


        let messagesText = messages.map(a => `<${a.getElementsByClassName("_23wugcdiaj44hdfugIAlnX")[0]?.innerText?.replace("u/","")}>:\n${Array.from(a.querySelectorAll("._1qeIAgB0cPwnLhDF9XSiJM,._eYtD2XCVieq6emjKBH3m")).map(a => a.innerText).join("\n")}\n\n`).filter(a => a.length > 2 && !a.startsWith("AutoModerator") && !a.endsWith("undefined"));
        return messagesText;

    }

}

class Discord extends ChatApp {


    constructor() {
        super();
    }

    getInputField() {

        return this.rootPanel.querySelector('[role="textbox"]') ?? this.rootPanel.getElementsByClassName("markup-eYLPri editor-H2NA06 slateTextArea-27tjG0 fontSize16Padding-XoMpjI")[0] ?? this.rootPanel.getElementsByClassName("textArea-2CLwUE")[0];
    }

    getPanel() {
        if (!this.userName)
            this.userName = this.rootPanel.querySelector('[class*="text-sm-normal"][class*="title"]')?.innerText;
        return this.getInputField().parentElement.parentElement.parentElement; //this.rootPanel.getElementsByClassName("attachWrapper-3slhXI")[0];
    }

    getButtonClass() {
        return "attachButton_b1db83 attachButton_eba568 button_afdfd9 lookBlank__7ca0a colorBrand_b2253e grow__4c8a4";
    }

    getMessages() {
        let messages = Array.from(this.rootPanel.querySelectorAll('[class*="messageListItem"]')).map((a) => {
            
            let u = a.querySelector('[class*="username"]')?.innerText;
            if (!u) u = this.oldu;
            this.oldu = u;
            // if(u===this.userName) u += " (Me)";

            let text = a.querySelector('[class*="messageContent"]')?.innerText;
            if (text) {
                return `\n<${u}>:\n${text}\n`;
            }
            return "";
        });
        return messages.filter((a) => a.length !== 0);
    }

}

class Messenger extends ChatApp {

    constructor() {
        super();
    }

    getPanel() {
        return this.rootPanel.getElementsByClassName("xuk3077 x78zum5 x6prxxf xz9dl7a xsag5q8")[0];
    }

    getButtonClass() {
        return "x4k7w5x x1h91t0o x1h9r5lt xv2umb2 x1beo9mf xaigb6o x12ejxvf x3igimt xarpa2k xedcshv x1lytzrv x1t2pt76 x7ja8zs x1qrby5j x1jfb8zj x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r xat24cr x2lwn1j xeuugli x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x3nfvp2 x1q0g3np x87ps6o x1lku1pv x1a2a7pz x1i64zmx x1emribx x1y1aw1k x1sxyh0 xwib8y2 xurb0ha";
    }

    getInputField() {
        return this.rootPanel.getElementsByClassName("xuk3077 x78zum5 x6prxxf xz9dl7a xsag5q8")[0].querySelector('div[contenteditable="true"]');
    }

    getMessages() {

        let messages = Array.from(this.rootPanel.getElementsByClassName("x1lliihq x1plvlek xryxfnj x1n2onr6 x193iq5w xeuugli x13faqbe x1vvkbs x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x1xmvt09 x6prxxf x1fcty0u xudqn12 x3x7a5m xq9mrsl")
        ).map((a) => {
            let person = a.classList.contains("xzsf02u") ? "Person2" : "Person1";
            let text = a.innerText;
            if (text) {
                return `<${person}>:\n${text}\n`;
            }
            return "";
        });
        return messages.filter((a) => a.length !== 0);
    }

}

class Whatsapp extends ChatApp {
    constructor() {
        super();
    }

    getPanel() {
        return this.rootPanel.querySelector('[data-icon="attach-menu-plus"]').parentElement.parentElement.parentElement;
    }


    getButtonClass() {
        return "";
    }


    getInputField() {
        return this.rootPanel.querySelector('#main').querySelector('div[contenteditable="true"]');
    }

    getMessages() {
        let messages = Array.from(
            this.rootPanel.querySelectorAll(".message-out, .message-in")
        ).map((a) => {
            let person = a.className.includes("message-in") ? "Person2" : "Person1";
            let text = a.getElementsByClassName("selectable-text")[0]?.firstChild.textContent;
            if (text) {
                return `<${person}>:\n${text}\n`;
            }
            return "";
        });
        return messages.filter((a) => a.length !== 0);
    }
}

class Telegram extends ChatApp {
    constructor() {
        super();
    }

    getPanel() {
        


        return this.rootPanel.querySelector(".Composer.shown,.rows-wrapper.chat-input-wrapper");
    }
getInputField(){
    
    return this.rootPanel.querySelector("#editable-message-text");
}

    getButtonClass() {
        return "Button record default secondary round click-allowed btn-icon tgico-none";
    }


    getMessages() {

        let messages = Array.from(
            this.rootPanel.querySelectorAll(".Message, .bubble.is-read.hide-name.is-out.can-have-tail.is-group-first.is-group-last")
        ).map((a) => {
            let person = a.classList.contains("own") || a.classList.contains("is-out") ? "Person1" : a.getElementsByClassName("message-title-name")[0]?.innerText?? "Person2";
            let text = a.querySelector(".text-content, .message")
                ?.firstChild.textContent;
            if (text) {
                return `<${person}>:\n${text}\n`;
            }
            return "";
        });
        return messages.filter((a) => a.length !== 0);
    }
}

class Gmail extends ChatApp {

    getPanel() {
        return this.rootPanel.getElementsByClassName("btC")[0];
    }


    getInputField() {
        return document.getElementsByClassName(
            "Am aO9 Al editable LW-avf tS-tW"
        )[0];
    }

    getButtonClass() {
        return "T-I J-J5-Ji aoO v7 T-I-atl L3";
    }


    async getMessages() {
        for (let i = 0; i < 5; i++) {

            for (let a of Array.from(document.getElementsByClassName("adx"))) {
                a.click();
            }

            for (let a of document.getElementsByClassName("adf ads"))
                if (a.style[0] !== "display") {
                    a.click();
                }


            for(const q of document.querySelectorAll('[id$="CanarySig"]'))
                q.hidden = true;
            for (const q of this.getInputField().getElementsByClassName("gmail_quote"))
                q.hidden = true;
        }

        await new Promise((r) => setTimeout(r, 1000));

        return Array.from(this.rootPanel.querySelectorAll(".h7")).map((a) => {
            let email = document.title.match(
                /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g
            )[0];
            let person = a.querySelector("[jid]").getAttribute("jid") === email ? "Person1" : "Person2";
            let text = a.getElementsByClassName("a3s aiL")[0].innerText;
            return `<${person}>:\n${text}\n`;
        });

    }
}
