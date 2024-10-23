import { PaddleObj } from './PaddleObj.js';

document.getElementById('new-event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventName = document.getElementById('event-name').value;
    
    // Create a new PaddleObj instance with the event name
    const newEvent = new PaddleObj(eventName);
    
    // Store the new event in localStorage
    let events = JSON.parse(localStorage.getItem('events')) || [];
    events.push({ name: eventName, data: newEvent });
    localStorage.setItem('events', JSON.stringify(events));

    // Redirect to the RaiseThePaddleCounter.html page with the new event name
    window.location.href = `RaiseThePaddleCounter.html?event=${encodeURIComponent(eventName)}`;
});
