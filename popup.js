function log(message) {
    console.log(message);
    document.body.prepend(message+"|")
}

document.addEventListener('DOMContentLoaded', async function () {


    while (typeof chrome === 'undefined' || !chrome.storage)
        await new Promise(resolve => setTimeout(resolve, 100));

        
    if (!chrome.dom) //if android
    {
        log("android")
        document.body.style.width = '';
        document.addEventListener('ionBackButton', (ev) => {
            ev.detail.register(0, ()=>window.history.back());
            ev.preventDefault();
          });
          document.querySelectorAll('.pc').forEach(button => {
            button.style.display = 'none';
          });
    }
    else{
        document.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') { //when Supported messengers are clicked
                e.preventDefault();
                chrome.tabs.create({ url: e.target.href });
            }
        });
    }

    const writeLog = document.getElementById('writeLog');
    const gptVersion = document.getElementById('gpt-version');
    const templateSelect = document.getElementById('template-select');
    const languageSelect = document.getElementById('language-select');


    

    [writeLog, gptVersion, languageSelect].forEach(el => el.addEventListener('change', () => saveSettings()));

    languageSelect.addEventListener('change', () => { LoadSettings().then(loadSettings);});
    //setInterval(saveSettings, 500);

    function saveSettings() {
        chrome.storage.local.set({
            writeLog: writeLog.checked,
            gptVersion: gptVersion.value,
            gptTitle: gptVersion.options[gptVersion.selectedIndex]?.text,
            template: templateSelect.value,
            language: languageSelect.value
        });
    }


    //load settings
    
    function loadSettings() {
        
            console.log(settings);
            writeLog.checked = settings.writeLog ?? false;

            // Load the language select
            const languageSelect = document.getElementById('language-select');
            languageSelect.innerHTML = '<option value="">Default</option>';
            navigator.languages.forEach((lang) => {
                const option = document.createElement('option');

                // Use Intl.DisplayNames to get the display name of the language
                const languageNames = new Intl.DisplayNames(navigator.language, { type: 'language' });
                const languageName = languageNames.of(lang);

                option.value = languageName;
                option.textContent = languageName;
                languageSelect.appendChild(option);
            });
            languageSelect.value = settings.language || ''; // Set the initial selected value to the current value in settings or default



            // Load the templates
            let profiles = settings.templates.filter(a => a.profile);
            if (profiles.length > 1) {
                templateSelect.innerHTML = '';
                settings.templates.forEach((template, index) => {
                    if (template.profile) {
                        const option = document.createElement('option');
                        option.value = index;
                        option.textContent = template.title;
                        templateSelect.appendChild(option);
                    }
                });
                templateSelect.value = settings.selected;
            }
            else
                templateSelect.parentElement.style.display = 'none';

            const regex = /{([^{}]*)}/g;
            let template = settings.templates[settings.selected ?? 0];
            if (!template.profile)
                template = settings.templates[settings.selected = 0];
            const matches = new Set(template.text.match(regex));
            let body = document.getElementById('dynamic-settings');
            body.innerHTML = '';
            matches.forEach(match => {
                let paramName = match.slice(1, -1);
                if (paramName !== "userName" && paramName !== "selected" && paramName !== "messages" && paramName !== "input" && paramName !== "prefix" && paramName !== "language") {
                    // If paramName contains '|', create a dropdown list


                    if (paramName.includes('|')) {
                        const values = paramName.split('|');
                        paramName = values[0];
                        const title = values.shift(); // remove the first value and set it as the title

                        // Create a new div to group all the components
                        const groupDiv = document.createElement("div");
                        //groupDiv.style.width = "100px";
                        //groupDiv.style.display = "inline-block";
                        groupDiv.className = 'column';

                        // Create title span element for the first value and append it to the group div
                        const titleSpan = document.createElement("span");
                        titleSpan.innerText = title + " ";
                        groupDiv.appendChild(titleSpan);

                        const select = document.createElement("select");
                        //select.style.color = "black";
                        //select.style.width="100px";

                        const option = document.createElement("option");
                        option.text = "default";
                        option.value = '';
                        select.add(option);

                        values.forEach(value => {
                            const option = document.createElement("option");
                            option.text = option.value = value;

                            if (!navigator.language.startsWith("en"))
                                TranslateMeGoogle(value).then((res) => { option.text = res; });

                            select.add(option);
                        });

                        select.value = settings[paramName] || '';

                        select.addEventListener("change", () => {
                            chrome.storage.local.set({ [paramName]: select.value });
                        });

                        // Append the select to the group div
                        groupDiv.appendChild(select);

                        // Append the group div to the body or any other element
                        body.appendChild(groupDiv);
                    } else { // Otherwise, create a textarea
                        // Create a new div to textarea
                        const textareaDiv = document.createElement("div");
                        textareaDiv.className = 'one-column';

                        const textarea = document.createElement("textarea");
                        textarea.placeholder = `${paramName}`;
                        textarea.value = settings[paramName] ?? "";
                        //textarea.style.color = "black";
                        //textarea.style.display = "block";


                        textarea.addEventListener("change", () => {
                            chrome.storage.local.set({ [paramName]: textarea.value });
                        });

                        // Append the textarea to the body or any other element
                        //body.appendChild(textarea);
                        textareaDiv.appendChild(textarea);
                        body.appendChild(textareaDiv);
                    }
                }
            });

            gptVersion.innerHTML = '';
            const models = settings.models ?? [];
            models.push({ title: "OpenAssistant", slug: "OpenAssistant" });
            models.push({ title: "GPT3", slug: "GPT3" });

            for (let i = 0; i < models.length; i++) {
                let option = document.createElement("option");
                option.text = models[i].title;
                option.value = models[i].slug;
                gptVersion.add(option);
            }


            gptVersion.value = settings.gptVersion ?? models[0].slug;

    }
    LoadSettings().then(loadSettings);

    templateSelect.addEventListener('change', () => {
        chrome.storage.local.set({ selected: templateSelect.value });
        LoadSettings().then(loadSettings);
    });

    document.addEventListener("contextmenu", function (e) {
        var menuItem = document.getElementById("menu-item");
        menuItem.style.display = "block";
        //menuItem.style.top = e.pageY + "px";
        //menuItem.style.left = e.pageX + "px";
    });

});