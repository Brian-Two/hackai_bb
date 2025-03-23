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

// Function to get songs based on the mood entered
function getSongsByMood() {
  const moodInput = document.getElementById('mood').value.toLowerCase(); // Get the user's input and convert to lowercase
  const songList = document.getElementById('songList');
  
  // Clear any previous results, this will have to be changed to reflect how the program reads input (file, etc)
  songList.innerHTML = '';
  
  // Check if the mood exists in the songsByMood object
  if (songsByMood[moodInput]) {
    const songs = songsByMood[moodInput];
    songs.forEach(song => {
      const listItem = document.createElement('li');
      listItem.textContent = song;
      songList.appendChild(listItem);
    });
  } else {
    // If the mood is not found, display a message
    const listItem = document.createElement('li');
    listItem.textContent = `Sorry, we don't have songs for the mood: ${moodInput}. Try another mood!`;
    songList.appendChild(listItem);
  }
}
