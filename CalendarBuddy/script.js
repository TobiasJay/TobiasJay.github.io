function parseTranscript(transcript) {
    // Extract title
    const titleMatch = transcript.match(/(.*?)(on|at)/i);
    const title = titleMatch ? titleMatch[1].trim() : "Untitled Event";

    // Extract date and time
    const dateTimeMatch = transcript.match(/on (.*?)( from|$)/i);
    const dateTimeString = dateTimeMatch ? dateTimeMatch[1].trim() : null;
    const dateTime = dateTimeString ? new Date(Date.parse(dateTimeString)) : null;

    // Extract notes
    const notesMatch = transcript.match(/from \d+.*?(PM|AM) (.*)/i);
    const notes = notesMatch ? notesMatch[2].trim() : "No additional notes";

    return {
        title: title,
        date_time: dateTime,
        notes: notes
    };
}

// Example usage: Hooking this to an input field
function processInput() {
    const transcript = document.getElementById("transcriptInput").value;
    const parsedEvent = parseTranscript(transcript);
    console.log(parsedEvent);
}
