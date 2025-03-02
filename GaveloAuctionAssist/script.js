document.addEventListener('DOMContentLoaded', (event) => {
    const numberDisplay = document.getElementById('numberDisplay');
    const nameDisplay = document.getElementById('nameDisplay');
    const historyDisplay = document.getElementById('historyDisplay');
    const csvFileInput = document.getElementById('csvFileInput');
    const dropArea = document.getElementById('drop-area');
    const overlay = document.getElementById('overlay');
    const container = document.querySelector('.vertContainer');
    const changeCsvButton = document.getElementById('changeCsvButton');

    startClock();

    let currentInput = '';
    let bidders = [];
    let history = [];

    // Handle file input when the file is manually selected
    csvFileInput.addEventListener('change', handleFile);

    // Allow clicking on the drop-area to trigger file input
    dropArea.addEventListener('click', () => csvFileInput.click());

    // Handle drag-and-drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragover', 'dragenter'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('highlight');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('highlight');
        });
    });
    
    // Handle the dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    // Prevent default drag behaviors
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Handle file drop
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFile({ target: { files } });
    }
        
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
    
        // Define regex patterns
        const bidNumberPattern = allowTwoDigit ? /\b\d{2,3}\b/ : /\b\d{3}\b/;
        const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+ & [A-Z][a-z]+ [A-Z][a-z]+/;
        const singleNamePattern = /^[A-Z][a-z]+$/;
    
        // Extract column names from the first row
        const columns = Object.keys(rawData[0]);
    
        // Transpose the raw data to column-wise data for easier processing
        const columnsData = columns.map(col => rawData.map(row => row[col]));
    
        // Helper function to check if a column matches a pattern
        const columnMatchesPattern = (column, pattern) => {
            const matches = column.some(value => {
                const match = pattern.test(String(value));
                return match;
            });
            return matches;
        };
    
        // Helper functions to identify column types by name
        const isFirstNameColumn = (columnName) => {
            const firstNameTerms = ['first', 'firstname', 'first_name'];
            const matches = firstNameTerms.some(term => columnName.toLowerCase().includes(term));
            return matches;
        };
    
        const isLastNameColumn = (columnName) => {
            const lastNameTerms = ['last', 'lastname', 'last_name', 'surname'];
            const matches = lastNameTerms.some(term => columnName.toLowerCase().includes(term));
            return matches;
        };
    
        const isBidNumberColumn = (columnName) => {
            const bidTerms = ['bid', 'number', 'bidnumber', 'bid_number', 'bid#', 'bidno', 'bid_no'];
            const matches = bidTerms.some(term => columnName.toLowerCase().includes(term));
            return matches;
        };
    
        // First: Look for bid number column
        columnsData.forEach((columnData, idx) => {
            const currentColumn = columns[idx];
            if (!bidNumberColumn && 
                (isBidNumberColumn(currentColumn) || columnMatchesPattern(columnData, bidNumberPattern))) {
                bidNumberColumn = currentColumn;
            }
        });
    
        // Second: Look for combined name column
        columnsData.forEach((columnData, idx) => {
            if (!nameColumn && columnMatchesPattern(columnData, namePattern)) {
                nameColumn = columns[idx];
            }
        });
    
        // Third: Look for separate first/last name columns if no combined name column found
        if (!nameColumn) {
            
            // First try to find columns by their names
            columns.forEach((column, idx) => {
                if (!firstNameColumn && isFirstNameColumn(column)) {
                    firstNameColumn = column;
                }
                if (!lastNameColumn && isLastNameColumn(column)) {
                    lastNameColumn = column;
                }
            });
    
            // If either is still not found, look for name-pattern matches in remaining columns
            if (!firstNameColumn || !lastNameColumn) {
                columns.forEach((column, idx) => {
                    const columnData = columnsData[idx];
                    
                    if (columnMatchesPattern(columnData, singleNamePattern)) {
                        if (!firstNameColumn && !isLastNameColumn(column)) {
                            firstNameColumn = column;
                        } else if (!lastNameColumn && !isFirstNameColumn(column)) {
                            lastNameColumn = column;
                        }
                    }
                });
            }
        }

        if (!bidNumberColumn) {
            throw new Error("BidNumber column not detected.");
        }
    
        // Helper functions for extraction and cleaning
        const extractBidNumber = (value) => {
            const match = String(value).match(bidNumberPattern);
            return match ? parseInt(match[0], 10) : null;
        };
    
        const cleanName = (value) => {
            return String(value).trim();
        };
    
        // Create new table with transformed data
        let newTable;
        if (firstNameColumn && lastNameColumn) {
            newTable = rawData.map(row => ({
                BidNumber: extractBidNumber(row[bidNumberColumn]),
                Name: cleanName(`${row[firstNameColumn]} ${row[lastNameColumn]}`)
            }));
        } else if (nameColumn) {
            newTable = rawData.map(row => ({
                BidNumber: extractBidNumber(row[bidNumberColumn]),
                Name: cleanName(row[nameColumn])
            }));
        } else {
            throw new Error("Name column(s) not detected.");
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

    function findBidderNames(currentInput, bidders) {
        // Convert currentInput to a string for easier comparison
        const currentInputStr = currentInput.toString();
    
        let matchingBidders = [];
        // Loop through each bidder and check if their BidNumber matches the currentInput
        bidders.forEach(b => {
            if (b.BidNumber !== null && b.BidNumber !== undefined) {
                const bidNumber = b.BidNumber.toString(); // Convert BidNumber to string
                if (bidNumber.startsWith(currentInputStr)) {
                    // Log the bidder's Name if the BidNumber matches the currentInput
                    matchingBidders.push(b.Name);
                }
            }
        });

        if (matchingBidders.length > 0) {
            if (matchingBidders.length == 2) {
                // Check first and last name for couples
                const p1 = matchingBidders[0].split(' ');
                const p2 = matchingBidders[1].split(' ');
                // [1] refers to the second name in the split array aka the last name

                if (p1[0] === p2[0] && p1[1] === p2[1]) {
                    // same first and last name, just need to return one name
                    return p1[0] + ' ' + p1[1];
                } else if(p1[1] === p2[1]) {
                    return p1[0] + ' and ' + p2[0] + ' ' + p1[1];
                }
            }


            return matchingBidders.join(', ');
        } else {
            return "No matching bidders found.";
        }
    }

    // Function to handle input from both keyboard and keypad
    function handleInput(input) {
        if (!isNaN(input) && input !== ' ') { // Check if input is a number
            if (currentInput.length < 3) {
                currentInput += input;
                numberDisplay.textContent = currentInput;
                numberDisplay.style.color = 'white';

                if (currentInput.length === 3) {

                    // Look up the bidder
                    // This needs to be more robust. Find all entries starting with those three digits
                    const fullName = findBidderNames(currentInput, bidders);
                    if (fullName !== "No matching bidders found.") {
                        nameDisplay.textContent = fullName;

                        // Add to history
                        history.unshift(`${currentInput}: ${fullName}`); // Prepend new entry
                        renderHistory();
                    } else {
                        numberDisplay.style.color = 'red';
                        nameDisplay.textContent = "couldn't find that bid card";
                    }
                }
            } else { // Clear current input and display the new number
                currentInput = input;
                numberDisplay.textContent = currentInput;
                numberDisplay.style.color = 'white';
                nameDisplay.textContent = '';
            }
        } else if (input === 'Enter' || input === 'C') {
            currentInput = ''; // Clear the input
            numberDisplay.textContent = '';
            numberDisplay.style.color = 'white'; // Reset color to white
            nameDisplay.textContent = '';


        } else if (input === 'Backspace') {
            currentInput = currentInput.slice(0, -1); // Remove the last character
            numberDisplay.textContent = currentInput;
            numberDisplay.style.color = 'white'; // Reset color to white
        } else if (input === 'Delete') { // Check for Delete key
            deleteKeyPressCount++;
            if (deleteKeyPressCount === 3) {
                clearHistory(); // Call clearHistory on three rapid presses
                deleteKeyPressCount = 0; // Reset the count
            }
            // Reset the count after a short delay
            setTimeout(() => {
                deleteKeyPressCount = 0;
            }, 400); // Adjust the time as needed
        }
    }

    // Initialize a variable to count Delete key presses
    let deleteKeyPressCount = 0;

    function updateClock() {
        const now = new Date();
        const hours = (now.getHours() % 12 || 12).toString().padStart(2, '0');
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

