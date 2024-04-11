async function OnButtonClick(template,selectedTextFromContext='') {
    if (template.icon === '⚛' && chatApp) { //reply to
        let selectedText = document.getSelection().anchorNode?.textContent || document.getSelection().toString() || selectedTextFromContext;
        await (chatApp instanceof Array ? chatApp[0] : chatApp).SendMessageToGPT(selectedText);
    } else if (template.icon === '⚛') { //editor window
        HighlightFromSelection();
        let inputEl = Array.from(document.querySelectorAll('input[type="text"]:not([disabled]), textarea:not([disabled]), [contenteditable="true"]:not([disabled])')).find(el => el.checkVisibility());
        let input =  inputEl?.innerText ||inputEl?.value || '';

        let userName = "Me"
        let hls = Array.from(document.getElementsByClassName(gpt4highlight))
        let messages = [];

        for (let i = 0; i < hls.length; i++) {
            if (hls[i].innerText.trim().length < 3) continue;
            //messages.push("[Message context "+ getShortHashCode(hls[i].className+Array.from(hls[i].querySelectorAll('[class]')).map(a=>a.className).join(""))+"]\n" +hls[i].innerText);
            messages.push(hls[i].innerText);
        }

        let text = TemplateProfile({
            ...settings, //includes optional language
            title: document.title,
            userName: userName,
            input: input,
            Language: settings.language || "English",            
            selected: selectedTextFromContext|| document.getSelection().toString(),
            //prefix:", each message is prefixed with [Message]",
            messages: selectedTextFromContext||messages.slice(-10).join("\n") 
        })

        console.log(text);
        preview.show("Write draft reply here");
        preview.textarea = text;


    } else {
        popup.show(template.title);

        let text = Template(template.text, {
            ...settings,
            title: document.title,
            selected: selectedTextFromContext || document.getSelection().toString(),
        });
        console.log(text);
        SendMessage(text);//button send
    }
}

function SelectionPopupButtons() {
// Utility function to create a button with common styles
    function createRoundButton(icon, title) {
        const button = document.createElement('button');
        button.innerHTML = icon;
        button.title = title;
        button.style.cssText = "width:50px;height:50px;border-radius: 50%;background-color: #007bff; color: white; border: none; padding: 0.3em 0.6em; cursor: pointer; font-family: Arial, sans-serif; font-size: 24px; box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075); position: absolute; opacity: 0; display: none; transition: opacity 0.3s display 0.3s;";

        return button;
    }

// Create a container for the buttons
    const container = document.createElement('div');
    container.style.cssText = 'position: absolute; display: none; z-index: 999;';
    document.body.appendChild(container);



// Show the pie menu when the mouse is over the main button

    let showed=true;

    ['mouseenter',"touchstart"].forEach(a=> container.addEventListener(a, e => {
        if(settings.hideOrbOnSelection)
            return;
        if(!showed)
            e.preventDefault()
        ShowButtons(true);
    }));
    async function ShowButtons(show) {
        if(settings.hideOrbOnSelection)
            return;
        if(showed===show) return;
        showed=show;

        if (show) {
            await LoadSettings();
        }

        // Remove existing buttons
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // Create and add buttons to the container
        const buttons = settings.templates.filter(a => !a.profile);

        buttons.forEach((template, index) => {
            const buttonUI = createRoundButton(template.icon, template.title, index);
            buttonUI.onmousedown = (e) => {
                e.preventDefault();
                OnButtonClick( template);
            };

            if (index === 0) {
                buttonUI.style.opacity = '1';
                buttonUI.style.display = 'block';
            }
            container.appendChild(buttonUI);
        });

        // Position the additional buttons around the main button
        function positionAdditionalButtons() {
            const mainButton = container.children[0];
            const buttonSize = mainButton.offsetWidth;
            const angle = -2 * Math.PI / (buttons.length - 1);
            const radius = buttonSize * 1.3;

            for (let i = 1; i < buttons.length; i++) {
                const x = radius * Math.cos((i - 1) * angle);
                const y = radius * Math.sin((i - 1) * angle);
                container.children[i].style.transform = `translate(${x}px, ${y}px)`;
            }
        }

        if (show) {
            for (let i = 1; i < buttons.length; i++) {
                container.children[i].style.opacity = '1';
                container.children[i].style.display = 'block';
            }
        } else {
            for (let i = 1; i < buttons.length; i++) {
                container.children[i].style.opacity = '0';
                container.children[i].style.display = 'none';
            }
        }

        positionAdditionalButtons();
    }

// Add a mouseup event listener to the document
    if(window.location.host!=="chat.openai.com")
    ['mouseup','touchend','select','selectionchange'].forEach(a=> document.addEventListener(a, (event) => {

        setTimeout(() => {
            const selection = window.getSelection();
            const selectionType = selection.type;

            if (selectionType === 'None' || selectionType === 'Caret') {
                container.style.display = 'none';
                return;
            }



            ShowButtons(false);

            const range = selection.getRangeAt(0);
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;
            let containerTop;

            if (!range.startContainer?.getBoundingClientRect) {
                const rect = range.getBoundingClientRect();
                container.style.left = `${rect.left + scrollX}px`;
                containerTop = rect.top + rect.height + scrollY + 10;
            } else {
                const inputRect = range.startContainer.getBoundingClientRect();
                container.style.left = `${inputRect.left + scrollX}px`;
                containerTop = inputRect.top + inputRect.height + scrollY + 10;
            }

// Check if the container is too low off the screen
            const viewportHeight = window.innerHeight;
            if (containerTop + container.offsetHeight+100 > viewportHeight + scrollY) {
                containerTop = containerTop - container.offsetHeight -100;
            }

            container.style.top = `${containerTop}px`;



            container.style.display = 'block';
            //positionAdditionalButtons();
        }, 100);
    }));

}
