const templateSelect = document.querySelector('#template-select');
const templateTitle = document.querySelector('#template-title');
const templateIcon = document.querySelector('#template-icon');
const templateInput = document.querySelector('#template');
const duplicateBtn = document.querySelector('#duplicate-btn');
const deleteBtn = document.querySelector('#delete-btn');
const toggleOrbCheckbox = document.querySelector('#toggle-orb');
const apikeyField = document.querySelector('#gpt-api-key')
const gptModelField = document.querySelector('#gpt-model');


function updateTemplateDropdown() {
    templateSelect.innerHTML = '';
    settings.templates.forEach((template, index) => {
        if(template.icon==="⚛")return;
        const option = document.createElement('option');
        option.value = index;
        option.textContent = template.title;
        templateSelect.appendChild(option);
    });
}
function loadSettings() {
    
        updateTemplateDropdown();
        templateSelect.value = settings.selected;
        loadSelectedTemplate();
        apikeyField.value = settings.gptApiKey || '';
        toggleOrbCheckbox.checked = settings.hideOrbOnSelection;
        document.querySelector('#gpt-api-url').value = settings.gptApiUrl || '';
        gptModelField.value = settings.gptModel || ''; // Load the gptModel setting
}
LoadSettings().then(loadSettings);

function loadSelectedTemplate() {

    const template = settings.templates[settings.selected];
    templateTitle.value = template.title;
        templateIcon.hidden=template.profile;
        templateIcon.value = template.icon;
    templateInput.value = template.text;
    toggleReadOnly(!template.editable);
}

function toggleReadOnly(readonly) {
    templateTitle.readOnly = readonly;
    templateIcon.readOnly = readonly;
    templateInput.readOnly = readonly;
    deleteBtn.hidden = readonly;
    duplicateBtn.hidden=!readonly;
}


function saveSettings() {
    const template = settings.templates[settings.selected];
    template.title = templateTitle.value;
    template.icon = templateIcon.value;
    template.text = templateInput.value;
    settings.hideOrbOnSelection = toggleOrbCheckbox.checked;
    settings.gptApiKey = document.querySelector('#gpt-api-key').value;
    settings.gptApiUrl = document.querySelector('#gpt-api-url').value;
    settings.gptModel = gptModelField.value; // Save the gptModel setting
    chrome.storage.local.set(settings);
}
setInterval(saveSettings, 500);

duplicateBtn.addEventListener('click', () => {
    const newTemplate = JSON.parse(JSON.stringify(settings.templates[settings.selected]));
    newTemplate.title = newTemplate.title + ' (copy)';
    newTemplate.editable = true;
    settings.templates.push(newTemplate);
    settings.selected = settings.templates.length - 1;
    chrome.storage.local.set(settings);
    updateTemplateDropdown();
    loadSelectedTemplate();
    loadSettings()
});

deleteBtn.addEventListener('click', () => {
    if (settings.selected > 0) {
        settings.templates.splice(settings.selected, 1);
        settings.selected = 0;
        chrome.storage.local.set(settings);
        updateTemplateDropdown();
        loadSelectedTemplate();
    }
});

templateSelect.addEventListener('change', () => {
    saveSettings()
    settings.selected = templateSelect.value;
    loadSelectedTemplate();
});
