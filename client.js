require('dotenv').config()
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function streamingMicRecognize(encoding, sampleRateHertz, languageCode, writeCallback) {
  // [START speech_transcribe_streaming_mic]
  const record = require('node-record-lpcm16');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    },
    interimResults: false, // If you want interim results, set this to true
  };

  // Create a recognize stream
  const recognizeStream = client
    .streamingRecognize(request)
    .once('error', console.error)
    .once('data', data =>
      writeCallback(
        data.results[0] && data.results[0].alternatives[0]
          ? `${data.results[0].alternatives[0].transcript}\n`
          : `\n\nReached transcription time limit, press Ctrl+C\n`
      )
      // process.stdout.write(
      //  data.results[0] && data.results[0].alternatives[0]
      //    ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
      //    : `\n\nReached transcription time limit, press Ctrl+C\n`
      // )
    );

  // Start recording and send the microphone input to the Speech API
  record
    .start({
      sampleRateHertz: sampleRateHertz,
      threshold: 0,
      // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
      verbose: false,
      recordProgram: 'rec', // Try also "arecord" or "sox"
      silence: '10.0',
    })
    .once('error', console.error)
    .pipe(recognizeStream);
}

var connect = require('net');
const say = require('say')

// var client = connect.connect('3333', 'thresholdrpg.com');
var client = connect.connect('8888', 'localhost');

rl.on('line', (input) => {
  client.write(input);
});

client.on('data', function(data) {
  var text = data.toString('utf8');
  console.log('' + text);

//   var speech = text.replace(/[^a-zA-Z0-9 ]/g, '');
//   say.speak(speech, 'Samantha', 0.5, (err) => {
//      streamingMicRecognize('LINEAR16', '16000', 'en-US', function(text) {
//        client.write(text);
//      });
//   });
}).on('connect', function() {
  client.write('Hello');
}).on('end', function() {
  console.log('Disconnected');
});
