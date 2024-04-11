let mouseEvent;

let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
let stylePopup = {position: 'fixed', background: isDarkMode ? '#343a40' : 'white', border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '0.25rem', padding: '1rem', zIndex: '10000', display: 'none', overflow: 'hidden'};
let textColor = isDarkMode ? 'white' : 'black';
let styleTextArea = { marginTop: '10px' ,display: 'block',width: 'min(500px, 85vw)', resize: 'both',  border: '1px solid rgba(0, 0, 0, 0.2)', padding: '0.5rem', background: isDarkMode ? '#23272b' : 'white', color: textColor,};
let styleButton = { display: 'inline-block', marginTop: '10px',marginRight: '10px', borderRadius: '0.25rem', border: '1px solid rgba(0, 0, 0, 0.2)', background: isDarkMode ? '#6c757d' : '#007bff', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer',};
function applyStyles(styles, ...elements)  {
    elements.forEach(element =>
        Object.entries(styles).forEach(([property, value]) => {
            element.style[property] = value;
        })
    );
}

let popup = CreatePanel();
let preview = CreatePreviewPanel();
function CreatePreviewPanel(){

    const [preview, textarea, closeButton,sendButton] = ['div', 'textarea', 'button','button' ].map(tag => document.createElement(tag))
    stylePopup.zIndex--;
    applyStyles(stylePopup, preview);
    applyStyles(styleTextArea, textarea);
    applyStyles(styleButton, closeButton,sendButton);
    closeButton.addEventListener('click', () => preview.hide());
    preview.textarea=textarea;


    closeButton.textContent = 'Close';
    sendButton.textContent = 'Generate';

    sendButton.addEventListener('click', async () => {
        popup.show("Edited");
        SendMessage(textarea.value); //preview send
    });
    preview.hide = () => {
        preview.style.display = 'none';
    }
    preview.show = () => {
        preview.style.display = 'block';
        preview.style.left = 0 + 'px';
        preview.style.top = 0 + 'px';


        textarea.value = lastTemplateMessage;
        if (textarea.scrollHeight < window.innerHeight / 2) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }

        textarea.clientHeight = window.innerHeight - 100;
    }

    [textarea, closeButton,sendButton].forEach(child => preview.appendChild(child));
    document.body.appendChild(preview);

    return preview;

}

let timeoutId;





function CreatePanel() {

    const [popup,nameField, textarea, closeButton, titleElement,editButton,sendButton,copyButton] = ['div', 'input', 'textarea', 'button', 'h3', 'button','button','button' ].map(tag => document.createElement(tag))
    applyStyles(stylePopup, popup);
    applyStyles(styleTextArea, textarea,nameField);
    applyStyles(styleButton, closeButton, editButton,sendButton,copyButton);
    applyStyles({marginBottom: '10px',color: textColor}, titleElement);

    popup.id = "popup";
    nameField.placeholder = 'Enter your name';
    textarea.placeholder = 'Enter your message';

    closeButton.textContent = 'Close';
    editButton.textContent = 'Edit';
    //editButton.style.display = 'none';
    copyButton.textContent = 'Copy';

    copyButton.addEventListener('click', () => {
        let input = document.getSelection().focusNode === popup ? document.getSelection().toString() || textarea.value : textarea.value;
        navigator.clipboard.writeText(input);
        SetValue(curChatApp.getInputField(),input)
        popup.hide();
    });
    closeButton.addEventListener('click', () => popup.hide());
    popup.addEventListener('mousedown', e=> {if(e.button === 2) editButton.style.display = 'inline-block'});
    editButton.addEventListener('click', () => { preview.show();});


    sendButton.textContent = 'Send';



    [titleElement,nameField, textarea,sendButton, copyButton,editButton,closeButton].forEach(child => popup.appendChild(child));
    document.body.appendChild(popup);

    let isDragging = false, offsetX, offsetY;

    popup.textArea = textarea;



    ['mousedown','touchstart'].forEach(a=> popup.addEventListener(a,  e => {
        if (e.target === textarea && navigator?.maxTouchPoints == 0) return;
        isDragging = true;
        offsetX =(e.clientX?? e.touches[0].clientX) - popup.getBoundingClientRect().left;
        offsetY =(e.clientY?? e.touches[0].clientY) - popup.getBoundingClientRect().top;
    }));
    ['mousemove','touchmove'].forEach(a=> document.addEventListener(a,  e => {
        mouseEvent = e;
        if (!isDragging) return;
        e.preventDefault();
        Position(e);
    }), {passive: false});
    ["mouseup","touchend"].forEach(a=> document.addEventListener(a, () => isDragging = false));


    function Position(e) {
        const x = (e.clientX ?? e.touches[0].clientX) - offsetX;
        const y = (e.clientY ?? e.touches[0].clientY) - offsetY;
      
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
      
        AdjustPopupPosition();
      }
      
    

    popup.show = (title) => {
        titleElement.textContent = title??"GPT 4 Chat";
        textarea.value = "Loading...";
        popup.visible = true;
        nameField.style.display =sendButton.style.display  = document.getElementsByClassName(gpt4highlight).length === 0? 'none' : 'inline-block';


        if (!isDragging) {
            popup.style.display = 'block';
            offsetX= offsetY=0;
            Position(mouseEvent);
        }
    };

    popup.hide = () => {
        Clear()
        popup.visible = false;
        popup.style.display = 'none';
    };

    return popup;
}



function AdjustPopupPosition() {
    const popupRect = popup.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
  
    if (popupRect.left < 0) {
      popup.style.left = '0';
    } else if (popupRect.right > windowWidth) {
      popup.style.left = windowWidth - popup.clientWidth + 'px';
    }
  
    if (popupRect.top < 0) {
      popup.style.top = '0';
    } else if (popupRect.bottom > windowHeight) {
      popup.style.top = windowHeight - popup.clientHeight + 'px';
    }
  }