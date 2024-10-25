import { PaddleObj } from './PaddleObj.js';

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
    
    // Create a new PaddleObj instance with the event name
    const newEvent = new PaddleObj(eventName);
    
    // Add the new event to the events array
    events.push({ name: eventName, data: newEvent });
    
    // Store the updated events array in localStorage
    localStorage.setItem('events', JSON.stringify(events));

    // After creating a new event
    window.location.href = `RaiseThePaddleCounter.html?event=${encodeURIComponent(eventName)}`;
});
