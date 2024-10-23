import { PaddleObj } from './PaddleObj.js';

// Get the event name from the URL
const urlParams = new URLSearchParams(window.location.search);
const eventName = urlParams.get('event');

// Load the specific event
let paddle;
const events = JSON.parse(localStorage.getItem('events')) || [];
const event = events.find(e => e.name === eventName);

if (event) {
    paddle = new PaddleObj();
    Object.assign(paddle, event.data);
    document.getElementById('event-title').textContent = eventName;
} else {
    console.error('Event not found');
    // Redirect to the landing page if the event is not found
    window.location.href = 'index.html';
}

let level = 0;

const valueElement = document.getElementById('value');
const countElement = document.getElementById('count');
const incrementBtn = document.getElementById('increment-btn');
const decrementBtn = document.getElementById('decrement-btn');
const grandTotal = document.getElementById('grand_total');
const levelContainer = document.querySelector('.level-container');
const currentLevelElement = document.getElementById('current-level');
const previousLevelElement = document.getElementById('previous-level');
const nextLevelElement = document.getElementById('next-level');
const levelDotsContainer = document.querySelector('.level-dots');
const leftChevron = document.getElementById('left-chevron');
const rightChevron = document.getElementById('right-chevron');
const tapAreaLeft = document.querySelector('.tap-area-left');
const tapAreaRight = document.querySelector('.tap-area-right');

let isChangingLevel = false;

function changeLevel(direction) {
    if (isChangingLevel) {
        return;
    }

    const newLevel = level + direction;
    if (newLevel >= 0 && newLevel < paddle.levels.length) {
        isChangingLevel = true;
        level = newLevel;
        updateLevelDisplay();
        updateCountDisplay();
        saveData();
        isChangingLevel = false;
    }
}

function updateLevelContainerPosition(percentage, currentLevel, targetLevel, currentContent, nextContent, prevContent) {
    const direction = targetLevel > currentLevel ? 1 : -1;

    currentLevelElement.textContent = currentContent;
    currentLevelElement.style.transform = `translateX(${percentage}%)`;

    if (direction > 0) {
        previousLevelElement.textContent = prevContent;
        previousLevelElement.style.transform = `translateX(${percentage - 100}%)`;
        nextLevelElement.textContent = nextContent;
        nextLevelElement.style.transform = `translateX(${percentage + 100}%)`;
    } else {
        previousLevelElement.textContent = nextContent;
        previousLevelElement.style.transform = `translateX(${percentage + 100}%)`;
        nextLevelElement.textContent = prevContent;
        nextLevelElement.style.transform = `translateX(${percentage - 100}%)`;
    }

    // Update chevron visibility
    leftChevron.classList.toggle('hidden', targetLevel === 0);
    rightChevron.classList.toggle('hidden', targetLevel === paddle.levels.length - 1);

    // Update dots
    const dots = levelDotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === targetLevel);
    });
}

function updateLevelDisplay() {
    currentLevelElement.textContent = addCommasAndDollarSign(paddle.levels[level].amount);
    previousLevelElement.textContent = '';
    nextLevelElement.textContent = '';

    leftChevron.classList.toggle('hidden', level === 0);
    rightChevron.classList.toggle('hidden', level === paddle.levels.length - 1);

    const dots = levelDotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === level);
    });
}

// Event listeners for tap areas only
tapAreaLeft.addEventListener('click', (e) => {
    e.preventDefault();
    changeLevel(-1);
});

tapAreaRight.addEventListener('click', (e) => {
    e.preventDefault();
    changeLevel(1);
});

// Increment button event
incrementBtn.addEventListener('click', function() {
    // Increment the count
    paddle.levels[level].count += 1;
    paddle.updateGrandTotal(paddle.levels[level].amount);
    updateCountDisplay();
    saveData(); // Save data after increment
});

// Decrement button event
decrementBtn.addEventListener('click', function() {
    // Ensure count doesn't go below 0
    if (paddle.levels[level].count > 0) {
        paddle.levels[level].count -= 1;
        paddle.updateGrandTotal(-paddle.levels[level].amount);
        updateCountDisplay();
        saveData(); // Save data after decrement
    }
});

// Function to add commas to large numbers
function addCommasAndDollarSign(num) {
    return "$" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
    
const settingsBtn = document.getElementById('settings-btn');
const mainBtn = document.getElementById('main-btn');
const customListsBtn = document.getElementById('custom-lists-btn');

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('footer button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`button[data-page="${pageId}"]`).classList.add('active');
}

settingsBtn.addEventListener('click', () => showPage('settings-page'));
mainBtn.addEventListener('click', () => showPage('main-page'));
customListsBtn.addEventListener('click', () => showPage('custom-lists-page'));

// Set data-page attributes for the buttons
settingsBtn.setAttribute('data-page', 'settings-page');
mainBtn.setAttribute('data-page', 'main-page');
customListsBtn.setAttribute('data-page', 'custom-lists-page');

// Set the main button as active by default
mainBtn.classList.add('active');

document.getElementById('settings-btn').addEventListener('click', () => {
    window.location.href = 'settings.html';
});

document.getElementById('main-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('custom-lists-btn').addEventListener('click', () => {
    window.location.href = 'custom-lists.html';
});

// Load saved data when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const dataLoaded = loadSavedData();
    createLevelDots();
    updateLevelDisplay();
    updateCountDisplay();
});

// Function to save data
function saveData() {
    const eventIndex = events.findIndex(e => e.name === eventName);
    if (eventIndex !== -1) {
        events[eventIndex].data = paddle;
        localStorage.setItem('events', JSON.stringify(events));
    }
}

// Function to load saved data
function loadSavedData() {
    const savedData = localStorage.getItem('paddleData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        level = parsedData.level;
        paddle.levels = parsedData.levels;
        paddle.grandTotal = parsedData.grandTotal;
        return true;
    }
    return false;
}

// Add this function to handle custom count input
function handleCustomCount() {
    const currentCount = paddle.levels[level].count;
    const newCount = prompt(`Enter new count (current: ${currentCount}):`, currentCount);
    
    if (newCount !== null && !isNaN(newCount)) {
        const parsedCount = parseInt(newCount, 10);
        const difference = parsedCount - currentCount;
        
        paddle.levels[level].count = parsedCount;
        paddle.updateGrandTotal(paddle.levels[level].amount * difference);
        
        updateCountDisplay();
        saveData();
    }
}

// Add this event listener for the count element
countElement.addEventListener('click', handleCustomCount);

// Add this function to create the dots
function createLevelDots() {
    paddle.levels.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === level) {
            dot.classList.add('active');
        }
        levelDotsContainer.appendChild(dot);
    });
}

// Easing function for smoother animation
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// Initialize the level display
updateLevelDisplay();
updateLevelContainerPosition(0);

// Update the display
function updateCountDisplay() {
    // get count and amount
    let count = paddle.levels[level].count;
    let amount = paddle.levels[level].amount;

    // update grand total
    grandTotal.textContent = addCommasAndDollarSign(paddle.grandTotal);

    // update count display
    valueElement.textContent = addCommasAndDollarSign(count * amount);
    // Update the count element
    countElement.textContent = count;
}

// Add an event listener for the back button
document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
});
