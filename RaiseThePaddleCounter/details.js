import { PaddleObj } from './PaddleObj.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get the event name from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventName = urlParams.get('event');

    // Load the specific event
    let paddle;
    const events = JSON.parse(localStorage.getItem('events')) || [];

    const event = events.find(e => e.name === eventName);

    if (event && event.data) {
        // Create a new PaddleObj and populate it with the saved data
        paddle = new PaddleObj(eventName);
        Object.assign(paddle, event.data);
        document.getElementById('event-title').textContent = eventName;
    } else {
        // Instead of redirecting, display an error message
        document.getElementById('event-title').textContent = 'Event Not Found';
        document.getElementById('paddle-details').innerHTML = '<p>Sorry, the requested event could not be found.</p>';
        return;
    }

    const levelsBody = document.getElementById('levels-body');
    const grandTotalElement = document.getElementById('grand-total');

    function updateTable() {
        levelsBody.innerHTML = '';
        let grandTotal = 0;

        paddle.levels.forEach(level => {
            // Create a row for all levels, even if count is 0
            const row = document.createElement('tr');
            const countCell = document.createElement('td');
            const levelCell = document.createElement('td');
            const totalCell = document.createElement('td');

            countCell.textContent = level.count;
            levelCell.textContent = `$${level.amount.toLocaleString()}`;
            const levelTotal = level.count * level.amount;
            totalCell.textContent = `$${levelTotal.toLocaleString()}`;

            row.appendChild(countCell);
            row.appendChild(levelCell);
            row.appendChild(totalCell);
            levelsBody.appendChild(row);

            grandTotal += levelTotal;
        });

        grandTotalElement.textContent = `$${grandTotal.toLocaleString()}`;
    }

    // Initial table update
    updateTable();

    // Add event listener for the home button
    const homeBtn = document.getElementById('home-btn');
    homeBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
