document.addEventListener('DOMContentLoaded', () => {
    const homeBtn = document.getElementById('home-btn');
    homeBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Add Clear All Data button
    const clearDataBtn = document.createElement('button');
    clearDataBtn.id = 'clear-data-btn';
    clearDataBtn.textContent = 'Clear All Data';
    document.getElementById('settings-page').appendChild(clearDataBtn);

    clearDataBtn.addEventListener('click', () => {
        const confirmClear = confirm('Are you sure you want to clear all data? This action cannot be undone.');
        if (confirmClear) {
            localStorage.clear();
            alert('All data has been cleared.');
            window.location.href = 'index.html'; // Redirect to home page after clearing data
        }
    });
});
