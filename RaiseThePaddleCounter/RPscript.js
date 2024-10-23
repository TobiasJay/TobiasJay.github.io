import { PaddleObj } from './PaddleObj.js';

let level = 0;

const paddle = new PaddleObj();
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

let startX;
let currentX;
let isDragging = false;
let lastDragTime = 0;
const dragThreshold = 10; // Minimum pixel movement to consider as a drag

levelContainer.addEventListener('touchstart', handleDragStart, false);
levelContainer.addEventListener('touchmove', handleDragMove, false);
levelContainer.addEventListener('touchend', handleDragEnd, false);

levelContainer.addEventListener('mousedown', handleDragStart, false);
levelContainer.addEventListener('mousemove', handleDragMove, false);
levelContainer.addEventListener('mouseup', handleDragEnd, false);
levelContainer.addEventListener('mouseleave', handleDragEnd, false);

function handleDragStart(e) {
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    isDragging = false; // Start as not dragging
    levelContainer.style.transition = 'none';
    lastDragTime = Date.now();
}

function handleDragMove(e) {
    currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const diff = currentX - startX;

    // Only start dragging if the movement is greater than the threshold
    if (!isDragging && Math.abs(diff) > dragThreshold) {
        isDragging = true;
    }

    if (isDragging) {
        e.preventDefault();
        const maxDrag = levelContainer.offsetWidth / 2;
        const dragPercentage = (diff / maxDrag) * 100;
        const constrainedDrag = Math.max(Math.min(dragPercentage, 100), -100);
        
        updateLevelContainerPosition(constrainedDrag);
    }
}

function handleDragEnd() {
    if (!isDragging) {
        // This was a click, not a drag
        updateLevelContainerPosition(0);
        return;
    }

    isDragging = false;
    const diff = currentX - startX;
    const threshold = levelContainer.offsetWidth * 0.2; // 20% of width as threshold

    if (diff > threshold && level > 0) {
        finishLevelChange(100);
    } else if (diff < -threshold && level < paddle.levels.length - 1) {
        finishLevelChange(-100);
    } else {
        // Snap back to current level
        finishLevelChange(0);
    }

    // Reset drag state
    startX = null;
    currentX = null;
}

function updateLevelContainerPosition(percentage) {
    // Move the current level
    currentLevelElement.style.transform = `translateX(${percentage}%)`;
    
    // Move the side levels without changing opacity
    if (percentage > 0) {
        // Moving right (showing previous level)
        previousLevelElement.style.transform = `translateX(${percentage - 100}%)`;
        nextLevelElement.style.transform = `translateX(${percentage + 100}%)`;
    } else {
        // Moving left (showing next level)
        previousLevelElement.style.transform = `translateX(${percentage - 100}%)`;
        nextLevelElement.style.transform = `translateX(${percentage + 100}%)`;
    }
}

function updateLevelDisplay() {
    currentLevelElement.textContent = addCommasAndDollarSign(paddle.levels[level].amount);
    previousLevelElement.textContent = level > 0 ? addCommasAndDollarSign(paddle.levels[level - 1].amount) : '';
    nextLevelElement.textContent = level < paddle.levels.length - 1 ? addCommasAndDollarSign(paddle.levels[level + 1].amount) : '';

    // Update active dot
    const dots = levelDotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        if (index === level) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function finishLevelChange(targetPercentage) {
    const startPercentage = parseFloat(currentLevelElement.style.transform.replace('translateX(', '').replace('%)', '')) || 0;
    const startTime = performance.now();
    const duration = 300; // 300ms animation

    function animate(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = easeInOutCubic(progress);
        const currentPercentage = startPercentage + (targetPercentage - startPercentage) * easedProgress;

        updateLevelContainerPosition(currentPercentage);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation finished
            if (targetPercentage !== 0) {
                if (targetPercentage > 0 && level > 0) {
                    level--;
                } else if (targetPercentage < 0 && level < paddle.levels.length - 1) {
                    level++;
                }
            }
            updateLevelDisplay();
            updateCountDisplay();
            updateLevelContainerPosition(0);
            
            // Reset drag state
            isDragging = false;
            startX = null;
            currentX = null;
            
            saveData(); // Save data after level change
        }
    }

    requestAnimationFrame(animate);
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

// slick chat GPT function for readability
function minimizeNotation(num) {
    const suffixes = ['', 'K', 'M', 'B', 'T']; // Suffixes for thousand, million, billion, etc.
    let suffixIndex = 0;

    // Divide num by 1000 until it's below 1000, and track how many times we divide
    while (num >= 1000 && suffixIndex < suffixes.length - 1) {
        num /= 1000;
        suffixIndex++;
    }

    // Format the number to a maximum of three significant digits
    let formattedNum = num.toFixed(2); // Initially keep 2 decimal places

    // Remove unnecessary .00 or .X0 (like 2.50 -> 2.5)
    if (formattedNum.endsWith('00')) {
        formattedNum = formattedNum.slice(0, -3); // Remove ".00"
    } else if (formattedNum.endsWith('0')) {
        formattedNum = formattedNum.slice(0, -1); // Remove trailing zero
    }

    return "$" + formattedNum + suffixes[suffixIndex];
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
    loadSavedData();
    createLevelDots();
    updateCountDisplay();
    updateLevelDisplay();
});

// Function to save data
function saveData() {
    const dataToSave = {
        level: level,
        levels: paddle.levels,
        grandTotal: paddle.grandTotal
    };
    localStorage.setItem('paddleData', JSON.stringify(dataToSave));
}

// Function to load saved data
function loadSavedData() {
    const savedData = localStorage.getItem('paddleData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        level = parsedData.level;
        paddle.levels = parsedData.levels;
        paddle.grandTotal = parsedData.grandTotal;
    }
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
