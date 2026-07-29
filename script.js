const actionBtn = document.getElementById('actionBtn');
const closePanelBtn = document.getElementById('closePanelBtn');
const titleInput = document.getElementById('titleInput');
const redaInput = document.getElementById('redaInput');
const speedSelect = document.getElementById('speedSelect');
const statusBox = document.getElementById('statusBox');

closePanelBtn.onclick = () => window.close();

actionBtn.onclick = () => {
    const titleText = titleInput.value;
    const redaText = redaInput.value;
    const mode = speedSelect.value;

    if (!titleText && !redaText) {
        statusBox.innerText = '⚠ Digite ou cole algum texto!';
        statusBox.style.color = '#ef4444';
        return;
    }

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