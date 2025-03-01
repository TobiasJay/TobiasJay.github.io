document.addEventListener('DOMContentLoaded', () => {
    const numberDisplay = document.getElementById('numberDisplay');
    const nameDisplay = document.getElementById('nameDisplay');
    const historyDisplay = document.getElementById('historyDisplay');
    const csvFileInput = document.getElementById('csvFileInput');
    const dropArea = document.getElementById('drop-area');
    const overlay = document.getElementById('overlay');
    const container = document.querySelector('.vertContainer');
    const changeCsvButton = document.getElementById('changeCsvButton');
    const hideClock = document.getElementById('hideClock');

    startClock();

    let currentInput = '';
    let bidders = [];
    let history = [];

    // Hide clock button event listener
    hideClock.addEventListener('click', () => {
        const clock = document.getElementsByClassName('clock')[0];
        console.log("hiding clock");
        // if shown, hide - otherwise show (aka toggle visibility)
        if (!clock.classList.contains("hidden")) {
            clock.classList.add("hidden");
            hideClock.innerText = "Show Clock";
        } else {
            clock.classList.remove("hidden");
            hideClock.innerText = "Hide Clock";
        }
    })

    // Handle file input when the file is manually selected
    csvFileInput.addEventListener('change', handleFile);

    // Allow clicking on the drop-area to trigger file input
    dropArea.addEventListener('click', () => csvFileInput.click());
        
    // Update handleFile function to show the "Change CSV" button
    function handleFile(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const csvText = event.target.result;
                processCSV(csvText); // Your CSV processing function
            };
            reader.readAsText(file);

            // Hide the overlay and show the main content
            overlay.style.display = 'none';
            container.style.display = 'flex';

            // Show the "Change CSV" button and update its text with the file name
            changeCsvButton.style.display = 'block';
            changeCsvButton.textContent = `Change CSV: ${file.name}`;
        }
    }

    // Allow the button to trigger the file input again
    changeCsvButton.addEventListener('click', () => {
        csvFileInput.click(); // Trigger file input on button click
    });


    document.getElementById('csvFileInput').addEventListener('change', function(event) {
        const file = event.target.files[0]; // Get the selected file
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const csvText = e.target.result;
                processCSV(csvText); // Call your CSV processing function
            };
            reader.readAsText(file);
        } else {
            alert('Please select a CSV file.');
        }
    });

    // Function to process the CSV
    function processCSV(csvText) {
        // Use PapaParse to parse the CSV file
        const parsedData = Papa.parse(csvText, {
            header: true,
            dynamicTyping: true
        }).data;

        // Detect and recreate the table
        const processedTable = detectAndRecreateTable(parsedData, false); // Don't set allow two digit to false: Gets tables detected sometimes :(
        bidders = processedTable;
    }

    function detectAndRecreateTable(rawData, allowTwoDigit = false) {
        let bidNumberColumn = null;
        let nameColumn = null;
        let firstNameColumn = null;
        let lastNameColumn = null;
    
        const bidNumberPattern = allowTwoDigit ? /\b\d{2,3}\b/ : /\b\d{3}\b/;
    
        const columns = Object.keys(rawData[0]);
    
        const columnsData = columns.map(col => rawData.map(row => row[col]));
    
        const firstNameTerms = ['first', 'firstname', 'first_name'];
        const lastNameTerms = ['last', 'lastname', 'last_name', 'surname'];
        const bidTerms = ['bid', 'number', 'bidnumber', 'bid_number', 'bid#', 'bidno', 'bid_no', 'biddernumber'];
    
        const cleanName = (value) => String(value).trim();
    
        const findColumnByHeader = (terms) => {
            return columns.find(col => terms.some(term => col.toLowerCase().includes(term))) || null;
        };
    
        const findColumnByPattern = (pattern) => {
            let maxUniqueCount = 0;
            let bestMatch = null;
    
            columns.forEach((col, idx) => {
                const uniqueValues = new Set(columnsData[idx].filter(val => pattern.test(String(val))));
                if (uniqueValues.size > maxUniqueCount) {
                    maxUniqueCount = uniqueValues.size;
                    bestMatch = col;
                }
            });
    
            return bestMatch;
        };
    
        bidNumberColumn = findColumnByHeader(bidTerms);
        if (!bidNumberColumn) {
            bidNumberColumn = findColumnByPattern(bidNumberPattern);
            if (!bidNumberColumn) {
                console.log("Error: BidNumber column not detected.");
                return;
            }
        }
    
        columnsData.forEach((colData, idx) => {
            rawData.forEach(row => {
                if (row[bidNumberColumn] < 10) {
                    row[bidNumberColumn] = "00" + row[bidNumberColumn];
                } else if (row[bidNumberColumn] < 100) {
                    row[bidNumberColumn] = "0" + row[bidNumberColumn];
                }
            });
        });
    
        firstNameColumn = findColumnByHeader(firstNameTerms);
        lastNameColumn = findColumnByHeader(lastNameTerms);
    
        if (!firstNameColumn || !lastNameColumn) {
            nameColumn = columns.find(col => col.toLowerCase().includes('name')) || null;
        }
    
        if (!firstNameColumn && !lastNameColumn && !nameColumn) {
            console.log("Error: Name column(s) not detected.");
            return;
        }
    
        let newTable;
        if (firstNameColumn && lastNameColumn) {
            newTable = rawData.map(row => ({
                BidNumber: row[bidNumberColumn],
                Name: cleanName(`${row[firstNameColumn]} ${row[lastNameColumn]}`)
            }));
        } else if (nameColumn) {
            newTable = rawData.map(row => ({
                BidNumber: row[bidNumberColumn],
                Name: cleanName(row[nameColumn])
            }));
        }
    
        return newTable;
    }    

    document.addEventListener('keydown', (event) => {
        handleInput(event.key);
    });

    // Add event listeners to keypad buttons
    document.querySelectorAll('#keypad button').forEach(button => {
        button.addEventListener('click', () => {
            handleInput(button.textContent);
        });
    });

    function locateBidders(currentInput, bidders) {
        const currentInputStr = currentInput.toString();
        return bidders
            .filter(b => b.BidNumber?.toString().startsWith(currentInputStr))
            .map(b => b.Name);
    }
    
    function formatMatchingBidders(matchingBidders) {
        if (!matchingBidders || matchingBidders.length === 0) {
            return "No matching bidders found.";
        }
    
        const uniqueBidders = [...new Set(matchingBidders)];
    
        if (uniqueBidders.length === 1) {
            return uniqueBidders[0];
        }
    
        const parsedNames = uniqueBidders.map(name => name.split(' '));
        const lastName = parsedNames[0][1];
        const allShareLastName = parsedNames.every(([_, lname]) => lname === lastName);
    
        if (allShareLastName) {
            const firstNames = parsedNames.map(([fname]) => fname);
            return firstNames.length === 2
                ? `${firstNames[0]} and ${firstNames[1]} ${lastName}`
                : `${firstNames.slice(0, -1).join(', ')} and ${firstNames.slice(-1)} ${lastName}`;
        }
    
        return uniqueBidders.join(', ');
    }    
    
    function findBidderNames(currentInput, bidders) {
        const matchingBidders = locateBidders(currentInput, bidders);
        return formatMatchingBidders(matchingBidders);
    }    

    function handleNumericInput(input) {
        if (currentInput.length < 3) {
            currentInput += input;
            updateNumberDisplay(currentInput, 'white');
    
            if (currentInput.length === 3) {
                processBidderLookup();
            }
        } else {
            resetInput(input);
        }
    }
    
    function processBidderLookup() {
        const fullName = findBidderNames(currentInput, bidders);
        if (fullName !== "No matching bidders found.") {
            updateNameDisplay(fullName);
            addToHistory(currentInput, fullName);
        } else {
            updateNumberDisplay(currentInput, 'red');
            updateNameDisplay("couldn't find that bid card");
        }
    }
    
    function resetInput(input = '') {
        currentInput = input;
        updateNumberDisplay(currentInput, 'white');
        updateNameDisplay('');
    }
    
    function handleSpecialKeys(input) {
        if (input === 'Enter' || input === 'C') {
            resetInput();
        } else if (input === 'Backspace') {
            currentInput = currentInput.slice(0, -1);
            updateNumberDisplay(currentInput, 'white');
        } else if (input === 'Delete') {
            trackDeleteKeyPress();
        }
    }
    
    function trackDeleteKeyPress() {
        deleteKeyPressCount++;
        if (deleteKeyPressCount === 3) {
            clearHistory();
            deleteKeyPressCount = 0;
        }
        setTimeout(() => { deleteKeyPressCount = 0; }, 400);
    }
    
    function updateNumberDisplay(number, color) {
        numberDisplay.textContent = number;
        numberDisplay.style.color = color;
    }
    
    function updateNameDisplay(name) {
        nameDisplay.textContent = name;
    }
    
    function addToHistory(number, name) {
        history.unshift(`${number}: ${name}`);
        renderHistory();
    }
    
    function handleInput(input) {
        if (!isNaN(input) && input !== ' ') {
            handleNumericInput(input);
        } else {
            handleSpecialKeys(input);
        }
    }    

    // Initialize a variable to count Delete key presses
    let deleteKeyPressCount = 0;

    function updateClock() {
        const now = new Date();
        const hours = (now.getHours()%12).toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
    }
        
    function startClock() {
        updateClock(); // Initial call to display the time immediately
        
        // Calculate the time until the next minute starts
        const now = new Date();
        const secondsUntilNextMinute = (60 - now.getSeconds()) * 1000;
        
        // Set a timeout to update the clock at the start of the next minute
        setTimeout(function() {
            updateClock();
            
            // Once the next minute starts, update the clock every minute (60000 ms)
            setInterval(updateClock, 60000);
        }, secondsUntilNextMinute);
    }

    // Function to render history
    function renderHistory() {
        historyDisplay.innerHTML = '';
        history.forEach(entry => {
            const p = document.createElement('p');
            p.textContent = entry;
            historyDisplay.appendChild(p);
        });
    }

    function clearHistory() {
        history = [];
        renderHistory();
    }
});
