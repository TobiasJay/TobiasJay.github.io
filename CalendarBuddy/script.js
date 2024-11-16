const eventDate = document.getElementById('eventDate');
const eventTime = document.getElementById('eventTime');
const eventTitle = document.getElementById('eventTitle');
const eventNotes = document.getElementById('eventNotes');
const eventSummary = document.getElementById('eventSummary');



function parseTranscript(transcript) {
    let event = "";
    let date = "";
    let time = "";
    let notes = "";

    // Convert transcript to uppercase for consistent matching
    const upperTranscript = transcript.toUpperCase();

    // Regex
    const eventRegex = /^(.*?)(?:\s(on|at)\s)/i; // Event ends at "on" or "at"
    const dateRegex = /\son\s(.*?)(?:\s(from|at)\s)/i; // Date ends at "from" or "at"

    // Extract event
    const eventMatch = transcript.match(eventRegex);
    if (eventMatch) {
        event = eventMatch[1].trim();
    } else {
        console.log("No event match (probably no on or at detected)")
    }

    // Extract date
    const dateMatch = transcript.match(dateRegex);
    if (dateMatch) {
        date = dateMatch[1].trim();
    } else {
        console.log("No date match (probably no from or at detected)")
    }

    // Find last AM/PM index
    const lastAmPmIndex = Math.max(upperTranscript.lastIndexOf("AM"), upperTranscript.lastIndexOf("PM"));

    // Find indices for "from" and "at"
    const fromIndex = upperTranscript.indexOf("FROM");
    const atIndex = upperTranscript.indexOf("AT");

    // Determine the start of the time segment
    let timeStartIndex = -1;
    if (fromIndex !== -1 && atIndex !== -1) {
        timeStartIndex = Math.min(fromIndex, atIndex);
    } else if (fromIndex !== -1) {
        timeStartIndex = fromIndex;
    } else if (atIndex !== -1) {
        timeStartIndex = atIndex;
    }

    // Extract time if both start and end indices are valid
    if (timeStartIndex !== -1 && lastAmPmIndex !== -1 && timeStartIndex < lastAmPmIndex) {
        time = transcript.substring(timeStartIndex, lastAmPmIndex + 2).replace(/(?:from|at)\s/i, "").trim();
    }

    // Extract notes (everything after last AM/PM)
    if (lastAmPmIndex !== -1) {
        notes = transcript.substring(lastAmPmIndex + 2).trim();
    }
    
    function parseDateTime(dateStr, timeStr) {
        // Normalize the date string (remove 'st', 'nd', 'rd', 'th')
        const normalizedDate = dateStr.replace(/(\d+)(st|nd|rd|th)/g, "$1");
    
        // Parse the time range
        const timeRegex = /(\d+)(:\d+)?\s*(am|pm)?(?:\s*[-to]+\s*(\d+)(:\d+)?\s*(am|pm)?)?/i;
        const timeMatch = timeStr.match(timeRegex);
    
        if (!timeMatch) {
            throw new Error("Invalid time format");
        }
    
        // Extract time components
        const [_, startHour, startMinute = ":00", startPeriod, endHour, endMinute = ":00", endPeriod] = timeMatch;
    
        // Parse start time
        const startTime = parseTime(normalizedDate, startHour, startMinute, startPeriod);
    
        // Parse end time (use the same period as the start if not provided)
        const endTime = endHour
            ? parseTime(normalizedDate, endHour, endMinute, endPeriod || startPeriod)
            : null;
    
        return { startTime, endTime };
    }
    
    // Helper function to parse a single time
    function parseTime(date, hour, minute, period) {
        // Convert to 24-hour format
        let hour24 = parseInt(hour, 10);
        if (period && period.toLowerCase() === "pm" && hour24 < 12) {
            hour24 += 12;
        } else if (period && period.toLowerCase() === "am" && hour24 === 12) {
            hour24 = 0;
        }
    
        // Create Date object
        const fullDate = new Date(`${date} ${new Date().getFullYear()}`);
        fullDate.setHours(hour24, parseInt(minute.slice(1), 10), 0, 0);
    
        return fullDate;
    }

    let timeBounds = parseDateTime(date, time);

    function unparseDateTime(startDateTime, endDateTime) {

        console.log(startDateTime);
        console.log(endDateTime);
        // Options for formatting the date
        const dateOptions = { weekday: "long", month: "short", day: "numeric", year: "numeric" };
    
        // Format date part
        const formattedDate = startDateTime.toLocaleDateString("en-US", dateOptions);
    
        // Format time part
        const formatTime = (date) => {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const period = hours >= 12 ? "PM" : "AM";
            const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // Convert to 12-hour format
            const formattedMinutes = minutes.toString().padStart(2, "0"); // Ensure two digits for minutes
            return `${formattedHours}:${formattedMinutes} ${period}`;
        };
    
        const formattedStartTime = formatTime(startDateTime);
        const formattedEndTime = formatTime(endDateTime);
    
        // Combine into the final format
        return { formattedDate, timeRange: `from ${formattedStartTime} to ${formattedEndTime}` };
    }
    
    formattedDateTime = unparseDateTime(timeBounds.startTime, timeBounds.endTime);

    return {
        event: event,
        date: formattedDateTime.formattedDate,
        time: formattedDateTime.timeRange,
        notes: notes
    };
}

function processInput() {
    const transcript = document.getElementById("transcriptInput").value;
    const parsedEvent = parseTranscript(transcript);
    console.log(parsedEvent);

    // unhide the card
    eventSummary.classList.remove('hidden');

    // add in details to card
    eventTitle.innerHTML = parsedEvent.event;
    eventNotes.innerHTML = parsedEvent.notes;
    eventDate.innerHTML = parsedEvent.date;
    eventTime.innerHTML = parsedEvent.time;


}
