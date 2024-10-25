import { PaddleObj } from './PaddleObj.js';

let levels = [];

function populateLevels() {
    const container = document.getElementById('levels-container');
    container.innerHTML = '';

    levels.forEach((level, index) => {
        const levelBox = document.createElement('div');
        levelBox.className = 'level-box';
        levelBox.innerHTML = `
            <span>$${level.toLocaleString()}</span>
            <div class="circle red" data-index="${index}">-</div>
        `;
        container.appendChild(levelBox);
    });
}

function addNewLevel(amount) {
    if (levels.includes(amount)) {
        alert('This level already exists.');
        return;
    }
    levels.push(amount);
    levels.sort((a, b) => b - a);
    populateLevels();
}

function removeLevel(index) {
    levels.splice(index, 1);
    populateLevels();
}

// New function to parse number input
function parseNumberInput(input) {
    // Remove all commas and spaces from the input
    const cleanInput = input.replace(/,|\s/g, '');
    // Parse the cleaned input as an integer
    return parseInt(cleanInput, 10);
}

document.addEventListener('DOMContentLoaded', () => {
    // Load levels from localStorage or use default levels
    const storedLevels = localStorage.getItem('customLevels');
    if (storedLevels) {
        levels = JSON.parse(storedLevels);
    } else {
        const defaultPaddle = new PaddleObj();
        levels = defaultPaddle.levels.map(level => level.amount);
    }
    populateLevels();

    // Add new level
    document.getElementById('add-new-level').addEventListener('click', () => {
        const input = prompt('Enter the new level amount:');
        if (input === null) return; // User cancelled the prompt

        const amount = parseNumberInput(input);
        if (!isNaN(amount) && amount > 0) {
            addNewLevel(amount);
        } else {
            alert('Please enter a valid positive number.');
        }
    });

    // Remove level
    document.getElementById('levels-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('circle') && e.target.classList.contains('red')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            removeLevel(index);
        }
    });

    // Save levels
    document.getElementById('save-levels').addEventListener('click', () => {
        const defaultPaddle = new PaddleObj();
        const defaultLevels = defaultPaddle.levels.map(level => level.amount);
        
        if (JSON.stringify(levels) !== JSON.stringify(defaultLevels)) {
            localStorage.setItem('customLevels', JSON.stringify(levels));
        } else {
            localStorage.removeItem('customLevels');
        }
        
        window.location.href = 'newevent.html';
    });
});
