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
    
    return {
        event: event,
        date: date,
        time: time,
        notes: notes
    };
}

function processInput() {
    const transcript = document.getElementById("transcriptInput").value;
    const parsedEvent = parseTranscript(transcript);
    console.log(parsedEvent);
}
