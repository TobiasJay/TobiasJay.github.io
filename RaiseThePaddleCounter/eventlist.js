document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('event-list');
    const events = JSON.parse(localStorage.getItem('events')) || [];

    events.forEach(event => {
        const li = document.createElement('li');
        li.textContent = event.name;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteEvent(event.name));
        
        li.appendChild(deleteBtn);
        eventList.appendChild(li);
    });

    document.getElementById('home-btn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

function deleteEvent(eventName) {
    let events = JSON.parse(localStorage.getItem('events')) || [];
    events = events.filter(event => event.name !== eventName);
    localStorage.setItem('events', JSON.stringify(events));
    location.reload(); // Refresh the page to show updated list
}
