document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settings-btn');
    const mainBtn = document.getElementById('main-btn');
    const customListsBtn = document.getElementById('custom-lists-btn');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = 'settings.html';
        });
    }

    if (mainBtn) {
        mainBtn.addEventListener('click', () => {
            window.location.href = 'RaiseThePaddleCounter.html';
        });
    }

    if (customListsBtn) {
        customListsBtn.addEventListener('click', () => {
            window.location.href = 'custom-lists.html';
        });
    }
});
