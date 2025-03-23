<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voice Mood Recognition and Song Suggestions</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        #recognizedMood {
            font-size: 20px;
            font-weight: bold;
            margin-top: 20px;
        }
        #songList {
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <h1>Voice Mood Recognition and Song Suggestions</h1>

    <!-- Button to start recording -->
    <button id="startRecordingBtn">Start Recording</button>
    <button id="stopRecordingBtn" disabled>Stop Recording</button>
    <br><br>

    <!-- Display recognized mood and song list -->
    <p id="recognizedMood">Waiting for input...</p>
    <ul id="songList"></ul>

    <script>
        const songsByMood = {
            happy: [
                "Happy by Pharrell Williams",
                "Can't Stop the Feeling by Justin Timberlake",
                "Uptown Funk by Mark Ronson ft. Bruno Mars"
            ],
            sad: [
                "Someone Like You by Adele",
                "The Night We Met by Lord Huron",
                "Hurt by Johnny Cash"
            ],
            relaxed: [
                "Weightless by Marconi Union",
                "Sunset Lover by Petit Biscuit",
                "Banana Pancakes by Jack Johnson"
            ],
            energetic: [
                "Don't Stop the Music by Rihanna",
                "Stronger by Kanye West",
                "Titanium by David Guetta ft. Sia"
            ]
        };

        // Setup for recording
        let mediaRecorder;
        let audioChunks = [];
        let audioBlob;
        let audioUrl;

        // Start recording when the "Start Recording" button is clicked
        document.getElementById("startRecordingBtn").addEventListener("click", () => {
            startRecording();
        });

        // Stop recording when the "Stop Recording" button is clicked
        document.getElementById("stopRecordingBtn").addEventListener("click", () => {
            stopRecording();
        });

        // Initialize recording
        async function startRecording() {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                audioUrl = URL.createObjectURL(audioBlob);

                // Send the WEBM file to the server for transcription
                const formData = new FormData();
                formData.append('file', audioBlob, 'recording.webm');

                try {
                    const response = await fetch('/upload-audio', {
                        method: 'POST',
                        body: formData,
                    });

                    const data = await response.json();
                    const mood = data.mood; // Response from server with identified mood
                    document.getElementById("recognizedMood").textContent = `Mood Detected: ${mood}`;

                    // Display songs for the identified mood
                    displaySongsForMood(mood);

                } catch (error) {
                    console.error("Error uploading audio file", error);
                    alert("Error while processing the audio.");
                }
            };

            mediaRecorder.start();
            document.getElementById("stopRecordingBtn").disabled = false;
            document.getElementById("startRecordingBtn").disabled = true;
        }

        // Stop recording and process the file
        function stopRecording() {
            mediaRecorder.stop();
            document.getElementById("stopRecordingBtn").disabled = true;
            document.getElementById("startRecordingBtn").disabled = false;
        }

        // Function to display songs based on the recognized mood
        function displaySongsForMood(mood) {
            const songList = document.getElementById('songList');
            songList.innerHTML = ''; // Clear previous results

            if (songsByMood[mood]) {
                const songs = songsByMood[mood];
                songs.forEach(song => {
                    const listItem = document.createElement('li');
                    listItem.textContent = song;
                    songList.appendChild(listItem);
                });
            } else {
                const listItem = document.createElement('li');
                listItem.textContent = `Sorry, no songs found for the mood: ${mood}. Try again!`;
                songList.appendChild(listItem);
            }
        }
    </script>
</body>
</html>
