import { PaddleObj } from './PaddleObj.js';

let defaultLevels = [];
let customLevels = [];

// Function to populate the levels section with default or custom levels
function populateLevels(levels) {
    const levelsList = document.getElementById('levels-list');
    levelsList.innerHTML = '';
    
    levels.forEach(level => {
        const listItem = document.createElement('li');
        listItem.textContent = `$${level.toLocaleString()}`;
        levelsList.appendChild(listItem);
    });
}

function updateLevelsDisplay() {
    const selectedLevelsType = document.querySelector('input[name="levels-type"]:checked').value;
    if (selectedLevelsType === 'default') {
        populateLevels(defaultLevels);
    } else {
        populateLevels(customLevels);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load default levels
    const defaultPaddle = new PaddleObj();
    defaultLevels = defaultPaddle.levels.map(level => level.amount);

    // Load custom levels from localStorage
    const storedCustomLevels = localStorage.getItem('customLevels');
    if (storedCustomLevels) {
        customLevels = JSON.parse(storedCustomLevels);
        document.getElementById('custom-levels-radio').checked = true;
    }

    updateLevelsDisplay();

    // Add event listeners for radio buttons
    document.querySelectorAll('input[name="levels-type"]').forEach(radio => {
        radio.addEventListener('change', updateLevelsDisplay);
    });

    // Add click event listener to the customize button
    const customizeButton = document.getElementById('customize-button');
    customizeButton.addEventListener('click', () => {
        window.location.href = 'custom-lists.html';
    });

    // Handle form submission
    document.getElementById('new-event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const eventName = document.getElementById('event-name').value.trim();
        
        // Get existing events from localStorage
        let events = JSON.parse(localStorage.getItem('events')) || [];
        
        // Check if an event with the same name already exists
        if (events.some(event => event.name.toLowerCase() === eventName.toLowerCase())) {
            alert('An event with this name already exists. Please choose a different name.');
            return;
        }
        
        // Create a new PaddleObj instance with the event name and selected levels
        const selectedLevelsType = document.querySelector('input[name="levels-type"]:checked').value;
        const selectedLevels = selectedLevelsType === 'default' ? defaultLevels : customLevels;
        const newEvent = new PaddleObj(eventName);
        newEvent.levels = selectedLevels.map(amount => ({ amount, count: 0 }));
        
        // Add the new event to the events array
        events.push({ name: eventName, data: newEvent });
        
        // Store the updated events array in localStorage
        localStorage.setItem('events', JSON.stringify(events));

        // After creating a new event
        window.location.href = `RaiseThePaddleCounter.html?event=${encodeURIComponent(eventName)}`;
    });
});
