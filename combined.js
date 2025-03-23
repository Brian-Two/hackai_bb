let mediaRecorder;
let audioChunks = [];

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };
    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });

        // Send the audio Blob to the server
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            const response = await fetch('http://localhost:3000/transcribe', { // Replace '/transcribe' with your server endpoint
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Transcription:', data.transcription);
                // Display the transcription on the page
                document.getElementById('transcription').innerText = data.transcription;
            } else {
                console.error('Error:', response.status);
            }
        } catch (error) {
            console.error('Error:', error);
        }

        audioChunks = [];
    };

    mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        alert("An error occurred during recording. Please check the console for details.");
    };

    mediaRecorder.start();
    document.querySelector('button[onclick="startRecording()"]').disabled = true;
    document.querySelector('button[onclick="stopRecording()"]').disabled = false;
    console.log("Recording started...");
}

function stopRecording() {
    mediaRecorder.stop();
    document.querySelector('button[onclick="startRecording()"]').disabled = false;
    document.querySelector('button[onclick="stopRecording()"]').disabled = true;
    console.log("Recording stopped.");
}