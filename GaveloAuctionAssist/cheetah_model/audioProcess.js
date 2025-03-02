const transcriptSpan = document.getElementById('transcript');
const startCheetahButton = document.getElementById('start-cheetah');
const stopCheetahButton = document.getElementById('stop-cheetah');
const ACCESS_KEY = getFileContents("C:\\Users\\Toby\\Website\\TobiasJay.github.io\\apikey");

startCheetahButton.addEventListener('click', startCheetah);
stopCheetahButton.addEventListener('click', stopCheetah);

let cheetah = null;

let transcriptList = [];
let threeDigitSequences = [];
let twoDigitSequences = [];

let fullTranscript = "";

function transcriptCallback(cheetahTranscript) {
    fullTranscript += cheetahTranscript.transcript;
    // Call a different function to cache the words.
    trackWords(cheetahTranscript.transcript);

    if (cheetahTranscript.isEndpoint) {
        fullTranscript += "\n";
    }

    transcriptSpan.innerText = fullTranscript;
}

function trackWords(word) {
    const number_mapping = {
        'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
        'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
    };

    // Add to list of words
    const lowerWord = word.toLowerCase();

    // Translate the word to a digit if it's valid
    if (number_mapping[lowerWord]) {
        transcriptList.push(number_mapping[lowerWord]);

        const len = transcriptList.length;

        // Check for a 3-digit sequence
        if (len >= 3) {
            const sequence = [
                transcriptList[len - 3],
                transcriptList[len - 2],
                transcriptList[len - 1]
            ].join(" ");
            threeDigitSequences.push(sequence);
            console.log(threeDigitSequences);
        }

        // Check for a 2-digit sequence
        if (len >= 2) {
            const sequence = [
                transcriptList[len - 2],
                transcriptList[len - 1]
            ].join(" ");
            twoDigitSequences.push(sequence);
        }
    } else {
        // here we see a word that is not a digit
        // reset the transcriptionList because we want to only track digits

    }
}

function getFileContents(filename) {
    /* Given a filename,
       return the contents of that file
    */
    try {
        const fs = require('fs');
        return fs.readFileSync(filename, 'utf8').trim();
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error(`'${filename}' file not found`);
        } else {
            throw err;
        }
    }
}

async function initCheetah() {
    cheetah = await CheetahWeb.CheetahWorker.create(
        ACCESS_KEY,
        transcriptCallback,
        { publicPath: "${DigitRecognizer-cheetah-v2.0.0-24-11-05--18-29-21.pv}" }
    );
}

// Need to prevent double activation.
async function startCheetah() {
    startCheetahButton.innerText = "Loading…";

    if (!cheetah) {
        await initCheetah();
    }

    await WebVoiceProcessor.WebVoiceProcessor.subscribe(cheetah);
    startCheetahButton.innerText = "Listening…";
}

async function stopCheetah() {
    await WebVoiceProcessor.WebVoiceProcessor.unsubscribe(cheetah);
    startCheetahButton.innerText = "Start Cheetah";
}

