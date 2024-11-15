const transcriptSpan = document.getElementById('transcript')
const startCheetahButton = document.getElementById('start-cheetah')
const stopCheetahButton = document.getElementById('stop-cheetah')
const ACCESS_KEY = getFileContents("C:\\Users\\Toby\\Website\\TobiasJay.github.io\\apikey")
startCheetahButton.addEventListener('click', startCheetah)
stopCheetahButton.addEventListener('click', stopCheetah)

let cheetah = null


let fullTranscript = "";
function transcriptCallback(cheetahTranscript) {
  fullTranscript += cheetahTranscript.transcript;
  if (cheetahTranscript.isEndpoint) {
    fullTranscript += "\n";
  }
  transcriptSpan.innerText = fullTranscript;
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




async function startCheetah() {
  startCheetahButton.innerText = "Loading…"
  if (!cheetah) {
    await initCheetah()
  }


  await WebVoiceProcessor.WebVoiceProcessor.subscribe(cheetah)
  startCheetahButton.innerText = "Listening…"
}


async function stopCheetah() {
  await WebVoiceProcessor.WebVoiceProcessor.unsubscribe(cheetah)
  startCheetahButton.innerText = "Start Cheetah"
}
