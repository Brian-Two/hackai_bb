// Define a dataset of moods and songs
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

// Voice recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';  // Set language to English
recognition.continuous = false; // Stop listening after one input
recognition.interimResults = false; // Don't return intermediate results

// Start voice recognition when the button is clicked
function startVoiceRecognition() {
    // Check if the SpeechRecognition API is supported
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        recognition.start(); // Start the recognition
        console.log("Voice recognition started...");
        document.getElementById("recognizedMood").textContent = "Listening...";
        document.getElementById("songList").innerHTML = ""; // Clear previous songs
    } else {
        alert('Speech Recognition API is not supported in this browser.');
    }
}

// When speech is recognized
recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log("Recognized: " + transcript);

    // Display the recognized mood
    document.getElementById("recognizedMood").textContent = transcript;

    // Check for matching mood and show songs
    displaySongsForMood(transcript);
};

// If there's an error with speech recognition
recognition.onerror = function (event) {
    console.error("Speech recognition error", event);
    document.getElementById("recognizedMood").textContent = "Error: " + event.error;
};

// Function to display songs based on the recognized mood
function displaySongsForMood(mood) {
    const songList = document.getElementById('songList');
    songList.innerHTML = ''; // Clear previous results

    // Check if the mood exists in the songsByMood object
    if (songsByMood[mood]) {
        const songs = songsByMood[mood];
        songs.forEach(song => {
            const listItem = document.createElement('li');
            listItem.textContent = song;
            songList.appendChild(listItem);
        });
    } else {
        // If no songs match the mood
        const listItem = document.createElement('li');
        listItem.textContent = `Sorry, we don't have songs for the mood: ${mood}. Try another mood!`;
        songList.appendChild(listItem);
    }
}
