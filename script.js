const actionBtn = document.getElementById('actionBtn');
const closePanelBtn = document.getElementById('closePanelBtn');
const titleInput = document.getElementById('titleInput');
const redaInput = document.getElementById('redaInput');
const speedSelect = document.getElementById('speedSelect');
const statusBox = document.getElementById('statusBox');
const termsCheck = document.getElementById('termsCheck');
const captchaInput = document.getElementById('captchaInput');
const captchaQuestion = document.getElementById('captchaQuestion');
const webhookCodeInput = document.getElementById('webhookCode');
const copyWebhookBtn = document.getElementById('copyWebhookBtn');

// Gerar Captcha Matemático Simples
const num1 = Math.floor(Math.random() * 10) + 1;
const num2 = Math.floor(Math.random() * 10) + 1;
const expectedCaptchaResult = num1 + num2;
captchaQuestion.innerText = `Quanto é ${num1} + ${num2}?`;

// Script atualizado do Bookmarklet para preencher no botão de cópia
const bookmarkletScript = `javascript:(function() {
    const targetUrl = 'https://bobdevelopercup.github.io/BobType/';
    const controlWin = window.open(targetUrl, '_blank');
    if (!controlWin) {
        alert('Permita pop-ups no seu navegador para abrir a aba.');
        return;
    }
    let isExecuting = false;
    window.addEventListener('message', async (event) => {
        if (!event.data || event.data.type !== 'BOB_TYPE_EXEC') return;
        if (isExecuting) return;
        isExecuting = true;
        const { title, reda, mode } = event.data;
        const textareas = document.querySelectorAll('textarea.MuiInputBase-inputMultiline');
        let targetTitle = null;
        let targetReda = null;
        for (let ta of textareas) {
            if (ta.id && !ta.readOnly) {
                if (!targetTitle) {
                    targetTitle = ta;
                } else if (!targetReda && ta.id !== targetTitle.id) {
                    targetReda = ta;
                    break;
                }
            }
        }
        if (!targetTitle || !targetReda) {
            isExecuting = false;
            return;
        }
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        const typeField = async (element, text) => {
            element.focus();
            if (mode === 'instant') {
                nativeInputValueSetter.call(element, text);
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                nativeInputValueSetter.call(element, '');
                element.dispatchEvent(new Event('input', { bubbles: true }));
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    element.focus();
                    element.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
                    element.dispatchEvent(new KeyboardEvent('keypress', { key: char, bubbles: true }));
                    nativeInputValueSetter.call(element, element.value + char);
                    element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: char }));
                    element.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
                    await new Promise(r => setTimeout(r, 25));
                }
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };
        await typeField(targetTitle, title);
        await typeField(targetReda, reda);
        isExecuting = false;
    });
})();`;

webhookCodeInput.value = bookmarkletScript;

// Copiar código do webhook
copyWebhookBtn.onclick = () => {
    navigator.clipboard.writeText(bookmarkletScript);
    copyWebhookBtn.innerText = 'Copiado!';
    setTimeout(() => { copyWebhookBtn.innerText = 'Copiar'; }, 2000);
};

// Validação em tempo real para habilitar o botão de envio
function validateForm() {
    const isTermsAccepted = termsCheck.checked;
    const isCaptchaCorrect = parseInt(captchaInput.value) === expectedCaptchaResult;
    const hasText = titleInput.value.trim() !== '' || redaInput.value.trim() !== '';

    if (isTermsAccepted && isCaptchaCorrect && hasText) {
        actionBtn.disabled = false;
        statusBox.innerText = 'Pronto para enviar!';
        statusBox.style.color = '#22c55e';
    } else {
        actionBtn.disabled = true;
        if (!isTermsAccepted) {
            statusBox.innerText = '⚠ Você precisa aceitar os termos de responsabilidade.';
        } else if (!isCaptchaCorrect) {
            statusBox.innerText = '⚠ Resolva o captcha corretamente.';
        } else if (!hasText) {
            statusBox.innerText = '⚠ Digite um título ou cole sua redação.';
        }
        statusBox.style.color = '#ef4444';
    }
}

termsCheck.onchange = validateForm;
captchaInput.oninput = validateForm;
titleInput.oninput = validateForm;
redaInput.oninput = validateForm;

closePanelBtn.onclick = () => window.close();

actionBtn.onclick = () => {
    const titleText = titleInput.value;
    const redaText = redaInput.value;
    const mode = speedSelect.value;

    statusBox.innerText = 'Enviando dados...';
    statusBox.style.color = '#a1a1aa';

    if (window.opener) {
        window.opener.postMessage({
            type: 'BOB_TYPE_EXEC',
            title: titleText,
            reda: redaText,
            mode: mode
        }, '*');
        
        statusBox.innerText = '✔ Dados enviados com sucesso!';
        statusBox.style.color = '#22c55e';
    } else {
        statusBox.innerText = '⚠ Janela principal fechada ou bloqueada.';
        statusBox.style.color = '#ef4444';
    }
};
