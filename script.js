const titleInput = document.getElementById('titleInput');
const redaInput = document.getElementById('redaInput');
const speedSelect = document.getElementById('speedSelect');
const termsCheck = document.getElementById('termsCheck');
const actionBtn = document.getElementById('actionBtn');
const statusBox = document.getElementById('statusBox');
const webhookCodeInput = document.getElementById('webhookCode');
const copyWebhookBtn = document.getElementById('copyWebhookBtn');

// Script do Webhook para injetar na aba principal via Bookmarklet
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

// Ação de copiar o webhook
copyWebhookBtn.onclick = () => {
    navigator.clipboard.writeText(bookmarkletScript);
    copyWebhookBtn.innerText = 'Copiado!';
    setTimeout(() => { copyWebhookBtn.innerText = 'Copiar'; }, 2000);
};

// Validação de estado e liberação do botão
function validateForm() {
    const isTermsAccepted = termsCheck.checked;
    const hasText = titleInput.value.trim() !== '' || redaInput.value.trim() !== '';

    if (isTermsAccepted && hasText) {
        actionBtn.disabled = false;
        statusBox.innerText = 'Pronto para enviar dados.';
        statusBox.style.color = '#22c55e';
    } else {
        actionBtn.disabled = true;
        if (!isTermsAccepted) {
            statusBox.innerText = '⚠ Aceite os termos de responsabilidade para continuar.';
        } else if (!hasText) {
            statusBox.innerText = '⚠ Preencha o título ou a redação.';
        }
        statusBox.style.color = '#ef4444';
    }
}

termsCheck.onchange = validateForm;
titleInput.oninput = validateForm;
redaInput.oninput = validateForm;

// Disparo da mensagem para a página conectada via window.opener
actionBtn.onclick = () => {
    const titleText = titleInput.value;
    const redaText = redaInput.value;
    const mode = speedSelect.value;

    statusBox.innerText = 'Transmitindo dados...';
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
        statusBox.innerText = '⚠ Nenhuma janela/aba conectada via webhook.';
        statusBox.style.color = '#ef4444';
    }
};
