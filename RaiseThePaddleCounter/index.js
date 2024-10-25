document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('event-list');
    const events = JSON.parse(localStorage.getItem('events')) || [];

    function renderEventList() {
        eventList.innerHTML = ''; // Clear the list before re-rendering
        events.forEach(event => {
            const li = document.createElement('li');
            li.textContent = event.name;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteEvent(event.name));
            
            li.appendChild(deleteBtn);
            eventList.appendChild(li);
        });
    }

    renderEventList();

    document.getElementById('create-event-btn').addEventListener('click', () => {
        window.location.href = 'newevent.html';
    });
});

function deleteEvent(eventName) {
    let events = JSON.parse(localStorage.getItem('events')) || [];
    events = events.filter(event => event.name !== eventName);
    localStorage.setItem('events', JSON.stringify(events));
    renderEventList(); // Re-render the list without reloading the page
}
