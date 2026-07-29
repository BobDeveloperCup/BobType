const titleInput = document.getElementById('titleInput');
const redaInput = document.getElementById('redaInput');
const speedSelect = document.getElementById('speedSelect');
const termsCheck = document.getElementById('termsCheck');
const actionBtn = document.getElementById('actionBtn');
const statusBox = document.getElementById('statusBox');
const statusText = statusBox.querySelector('span');
const webhookCodeInput = document.getElementById('webhookCode');
const copyWebhookBtn = document.getElementById('copyWebhookBtn');
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;

const ICON_WARN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
const ICON_OK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
const ICON_INFO = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
const ICON_SEND = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';

// ========== THEME ==========
function getPreferredTheme() {
    const saved = localStorage.getItem('bobtype-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('bobtype-theme', theme);
}

applyTheme(getPreferredTheme());

themeToggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ========== STATUS ==========
function setStatus(html, color) {
    statusBox.innerHTML = html;
    statusBox.style.color = color;
}

// ========== BOOKMARKLET ==========
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

// ========== COPY ==========
copyWebhookBtn.onclick = () => {
    navigator.clipboard.writeText(bookmarkletScript);
    copyWebhookBtn.innerHTML = `${ICON_OK} Copiado!`;
    setTimeout(() => {
        copyWebhookBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar`;
    }, 2000);
};

// ========== VALIDATION ==========
function validateForm() {
    const isTermsAccepted = termsCheck.checked;
    const hasText = titleInput.value.trim() !== '' || redaInput.value.trim() !== '';

    if (isTermsAccepted && hasText) {
        actionBtn.disabled = false;
        setStatus(`${ICON_OK} Pronto para enviar dados.`, 'var(--success)');
    } else {
        actionBtn.disabled = true;
        if (!isTermsAccepted) {
            setStatus(`${ICON_WARN} Aceite os termos de responsabilidade para continuar.`, 'var(--danger)');
        } else if (!hasText) {
            setStatus(`${ICON_WARN} Preencha o título ou a redação.`, 'var(--danger)');
        }
    }
}

termsCheck.onchange = validateForm;
titleInput.oninput = validateForm;
redaInput.oninput = validateForm;

// ========== SEND ==========
actionBtn.onclick = () => {
    const titleText = titleInput.value;
    const redaText = redaInput.value;
    const mode = speedSelect.value;

    setStatus(`${ICON_SEND} Transmitindo dados...`, 'var(--text-muted)');

    if (window.opener) {
        window.opener.postMessage({
            type: 'BOB_TYPE_EXEC',
            title: titleText,
            reda: redaText,
            mode: mode
        }, '*');

        setStatus(`${ICON_OK} Dados enviados com sucesso!`, 'var(--success)');
    } else {
        setStatus(`${ICON_WARN} Nenhuma janela/aba conectada via webhook.`, 'var(--danger)');
    }
};
