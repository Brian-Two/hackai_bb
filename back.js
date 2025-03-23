const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { SpeechClient } = require('@google-cloud/speech');
const app = express();
const port = 3000;

// Google Cloud Speech client
const client = new SpeechClient();

// Setup Multer for file upload
const upload = multer({ dest: 'uploads/' });

// Serve the frontend HTML (optional)
app.use(express.static('public'));

// POST route to handle audio file upload and transcription
app.post('/upload-audio', upload.single('file'), async (req, res) => {
    const audioPath = req.file.path;

    try {
        // Read the uploaded file
        const file = fs.readFileSync(audioPath);
        const audioBytes = file.toString('base64');

        // Configure Google Cloud Speech-to-Text request
        const request = {
            audio: {
                content: audioBytes,
            },
            config: {
                encoding: 'WEBM_OPUS',
                sampleRateHertz: 16000,
                languageCode: 'en-US',
            },
        };

        // Send request to Google Cloud Speech API
        const [response] = await client.recognize(request);
        const transcript = response.results.map(result => result.alternatives[0].transcript).join(' ');

        // Identify mood (this is just a simple mock-up)
        let mood = 'unknown';
        if (transcript.includes('happy')) mood = 'happy';
        else if (transcript.includes('sad')) mood = 'sad';
        else if (transcript.includes('energetic')) mood = 'energetic';
        else if (transcript.includes('relaxed')) mood = 'relaxed';

        // Return the identified mood
        res.json({ mood });
    } catch (error) {
        console.error('Error processing the audio file', error);
        res.status(500).send('Error processing the audio file');
    } finally {
        // Clean up uploaded file
        fs.unlinkSync(audioPath);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
