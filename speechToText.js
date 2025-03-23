const fs = require('fs');
const speech = require('@google-cloud/speech');

// Create a client for the Speech-to-Text API
const client = new speech.SpeechClient();

async function transcribeAudio(filePath) {
    // Read the audio file
    const file = fs.readFileSync(filePath);
    const audioBytes = file.toString('base64');

    // Configure the request
    const audio = {
        content: audioBytes,
    };
    const config = {
        encoding: 'WEBM_OPUS', // WebM files typically use the Opus codec
        sampleRateHertz: 48000, // Adjust if your WebM file has a different sample rate
        languageCode: 'en-US', // Change this based on the language of the audio
    };
    const request = {
        audio: audio,
        config: config,
    };

    // Transcribe the audio
    const [response] = await client.recognize(request);
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    return transcription;
}

// Example usage
process.env.GOOGLE_APPLICATION_CREDENTIALS = "/Users/adrianng/Desktop/bisonbytes2025v2/test3 original/hackai_bb/august-monument-454521-p9-fb1a43aab8ff.json"; //* Replace with GCloud API file path
const audioFilePath = '/Users/adrianng/Downloads/delete.webm'; //* Replace with your audio file path
transcribeAudio(audioFilePath)
    .then(transcription => {
        console.log('Transcription:', transcription);
    })
    .catch(err => {
        console.error('Error transcribing audio:', err);
    });