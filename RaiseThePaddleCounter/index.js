document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('event-list');
    const events = JSON.parse(localStorage.getItem('events')) || [];

    function populateEventList() {
        eventList.innerHTML = '';
        // Reverse the order of events
        events.reverse().forEach(event => {
            const li = document.createElement('li');
            li.textContent = event.name;
            li.addEventListener('click', () => {
                window.location.href = `RaiseThePaddleCounter.html?event=${encodeURIComponent(event.name)}`;
            });
            eventList.appendChild(li);
        });
    }

    populateEventList();

    document.getElementById('create-event-btn').addEventListener('click', () => {
        window.location.href = 'newevent.html';
    });
});

function deleteEvent(eventName) {
    let events = JSON.parse(localStorage.getItem('events')) || [];
    events = events.filter(event => event.name !== eventName);
    localStorage.setItem('events', JSON.stringify(events));
    populateEventList(); // Re-render the list without reloading the page
}
