import React, { useState, useRef, useEffect } from 'react';

const MoodMusicApp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [songRecommendations, setSongRecommendations] = useState([]);
  const [conversationEnded, setConversationEnded] = useState(false);
  const speechRecognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        speechRecognitionRef.current = new SpeechRecognition();
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;
        
        speechRecognitionRef.current.onresult = (event) => {
          const currentTranscript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          
          if (event.results[0].isFinal) {
            setTranscript(prev => [...prev, {
              speaker: "You",
              text: currentTranscript
            }]);
            
            // Simulate AI response
            setTimeout(() => {
              const aiResponses = [
                "How are you feeling today?",
                "Tell me more about your day.",
                "What kind of music do you usually enjoy?",
                "Do any particular songs or artists help when you feel this way?",
                "I notice you mentioned feeling that way. How long has this been going on?"
              ];
              const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
              setTranscript(prev => [...prev, {
                speaker: "AI",
                text: randomResponse
              }]);
            }, 1000);
          }
        };
      }
    }
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setConversationEnded(false);
    setSongRecommendations([]);
    
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.start();
      setTranscript([{
        speaker: "AI",
        text: "Hi there! I'm here to recommend music based on your mood. How are you feeling today?"
      }]);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setConversationEnded(true);
    
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    
    // Analyze mood and recommend songs
    analyzeMoodAndRecommendSongs();
  };

  const analyzeMoodAndRecommendSongs = () => {
    // Simplified mood analysis based on transcript
    const userMessages = transcript.filter(msg => msg.speaker === "You").map(msg => msg.text.toLowerCase());
    const text = userMessages.join(' ');
    
    let mood = "neutral";
    const happyWords = ["happy", "great", "excited", "joy", "wonderful", "amazing"];
    const sadWords = ["sad", "down", "depressed", "unhappy", "blue", "melancholy"];
    const energeticWords = ["energetic", "pumped", "motivated", "energized", "active"];
    const calmWords = ["calm", "peaceful", "relaxed", "chill", "tranquil"];
    
    let moodKeywords = {
      happy: 0,
      sad: 0,
      energetic: 0,
      calm: 0
    };
    
    // Simple sentiment counting
    happyWords.forEach(word => {
      if (text.includes(word)) moodKeywords.happy++;
    });
    
    sadWords.forEach(word => {
      if (text.includes(word)) moodKeywords.sad++;
    });
    
    energeticWords.forEach(word => {
      if (text.includes(word)) moodKeywords.energetic++;
    });
    
    calmWords.forEach(word => {
      if (text.includes(word)) moodKeywords.calm++;
    });
    
    // Determine dominant mood
    const dominantMood = Object.keys(moodKeywords).reduce((a, b) => 
      moodKeywords[a] > moodKeywords[b] ? a : b
    );
    
    // If no clear mood detected, default to neutral
    mood = moodKeywords[dominantMood] > 0 ? dominantMood : "neutral";
    
    // Mock song recommendations based on mood
    const recommendations = {
      happy: [
        { title: "Happy", artist: "Pharrell Williams" },
        { title: "Walking on Sunshine", artist: "Katrina & The Waves" },
        { title: "Good as Hell", artist: "Lizzo" }
      ],
      sad: [
        { title: "Someone Like You", artist: "Adele" },
        { title: "Fix You", artist: "Coldplay" },
        { title: "Everybody Hurts", artist: "R.E.M." }
      ],
      energetic: [
        { title: "Can't Stop the Feeling!", artist: "Justin Timberlake" },
        { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
        { title: "Dance Monkey", artist: "Tones and I" }
      ],
      calm: [
        { title: "Weightless", artist: "Marconi Union" },
        { title: "Claire de Lune", artist: "Claude Debussy" },
        { title: "Breathe Me", artist: "Sia" }
      ],
      neutral: [
        { title: "Viva la Vida", artist: "Coldplay" },
        { title: "Bohemian Rhapsody", artist: "Queen" },
        { title: "Hey Jude", artist: "The Beatles" }
      ]
    };
    
    setSongRecommendations(recommendations[mood]);
    
    // Add AI conclusion
    setTranscript(prev => [...prev, {
      speaker: "AI",
      text: `Based on our conversation, I think you're feeling ${mood}. Here are some songs that might match your mood!`
    }]);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#4f46e5',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '0.5rem' }}>🎵</span>
            Mood Music Recommender
          </h1>
          <p style={{ color: '#e0e7ff' }}>Talk to me and I'll recommend songs based on your mood</p>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '1.5rem' 
          }}>
            {!isRecording ? (
              <button 
                onClick={startRecording}
                style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '1rem 1.5rem',
                  borderRadius: '9999px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>▶️</span>
                Start Conversation
              </button>
            ) : (
              <button 
                onClick={stopRecording}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '1rem 1.5rem',
                  borderRadius: '9999px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>⏹️</span>
                End Conversation
              </button>
            )}
          </div>
          
          {transcript.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem' 
              }}>
                Conversation Transcript
              </h2>
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                padding: '1rem',
                maxHeight: '16rem',
                overflowY: 'auto'
              }}>
                {transcript.map((item, index) => (
                  <div 
                    key={index} 
                    style={{
                      marginBottom: '0.5rem',
                      color: item.speaker === "AI" ? '#4338ca' : '#1f2937'
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>{item.speaker}: </span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {conversationEnded && songRecommendations.length > 0 && (
            <div>
              <h2 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem' 
              }}>
                Song Recommendations
              </h2>
              <div style={{
                backgroundColor: '#eef2ff',
                borderRadius: '0.5rem',
                padding: '1rem'
              }}>
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                  {songRecommendations.map((song, index) => (
                    <li 
                      key={index} 
                      style={{
                        marginBottom: '0.5rem',
                        paddingBottom: '0.5rem',
                        borderBottom: index !== songRecommendations.length - 1 ? '1px solid #e0e7ff' : 'none'
                      }}
                    >
                      <div style={{ fontWeight: '600' }}>{song.title}</div>
                      <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>by {song.artist}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodMusicApp;