// MoodMusicApp.jsx
import React, { useState, useRef, useEffect } from 'react';
import MusicServiceFactory from './services/MusicServiceFactory';
import AuthHandler from './utils/AuthHandler';
import ErrorHandler from './utils/ErrorHandler';
import MoodAnalyzer from './utils/MoodAnalyzer';
import ConversationEngine from './utils/ConversationEngine';

const MoodMusicApp = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [songRecommendations, setSongRecommendations] = useState([]);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState({
    spotify: false,
    youtube: true, // YouTube doesn't require OAuth for our implementation
    currentService: null
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const speechRecognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const lastProcessedTranscriptRef = useRef("");
  const musicServiceRef = useRef(null);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      const spotifyAuthenticated = AuthHandler.isAuthenticated('spotify');
      
      setAuthStatus(prev => ({
        ...prev,
        spotify: spotifyAuthenticated,
        currentService: spotifyAuthenticated ? 'spotify' : 'youtube'
      }));

      // Get the appropriate service
      if (spotifyAuthenticated) {
        musicServiceRef.current = MusicServiceFactory.getService('spotify');
      } else {
        musicServiceRef.current = MusicServiceFactory.getService('youtube');
      }
    };

    checkAuth();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        speechRecognitionRef.current = new SpeechRecognition();
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = false;
        
        speechRecognitionRef.current.onresult = (event) => {
          // Only process the latest result
          const lastResultIndex = event.results.length - 1;
          const currentTranscript = event.results[lastResultIndex][0].transcript;
          
          // Check if we've already processed this transcript
          if (currentTranscript !== lastProcessedTranscriptRef.current && !isProcessing) {
            lastProcessedTranscriptRef.current = currentTranscript;
            setIsProcessing(true);
            
            // Add user's speech to transcript
            setTranscript(prev => [...prev, {
              speaker: "You",
              text: currentTranscript
            }]);
            
            // Wait 2 seconds before AI responds to give users time to finish speaking
            setTimeout(() => {
              // Generate AI response based on transcript context
              generateAIResponse(currentTranscript);
              
              // Reset processing flag after AI has responded
              setTimeout(() => {
                setIsProcessing(false);
              }, 1000);
            }, 2000);
          }
        };

        speechRecognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          // Handle common errors
          if (event.error === 'not-allowed') {
            setError({
              title: 'Microphone Access Denied',
              message: 'Please allow microphone access to use voice features.'
            });
          } else if (event.error === 'no-speech') {
            // This is common, no need to show error to user
            console.log('No speech detected');
          } else {
            setError({
              title: 'Speech Recognition Error',
              message: `Error: ${event.error}. Please try again.`
            });
          }
        };
      }
    }
  }, [isProcessing]);

  // Generate contextual AI response based on user input
  const generateAIResponse = (userInput) => {
    const userInputLower = userInput.toLowerCase();
    
    // Simple contextual responses
    let response = '';
    
    if (userInputLower.includes('hello') || userInputLower.includes('hi')) {
      response = "Hello! How are you feeling today?";
    } else if (userInputLower.includes('how are you')) {
      response = "I'm here to help you find music that matches your mood. How are you feeling?";
    } else if (userInputLower.includes('thank')) {
      response = "You're welcome! Is there anything specific about your mood you'd like to share?";
    } else if (userInputLower.includes('music') || userInputLower.includes('song')) {
      response = "I'll help you find the perfect songs based on how you're feeling. Can you tell me more about your mood?";
    } else if (userInputLower.includes('feeling')) {
      response = "It helps to hear how you're feeling. What kind of music typically helps when you feel this way?";
    } else {
      // Default responses if no context match
      const aiResponses = [
        "How are you feeling today?",
        "Tell me more about your day.",
        "What kind of music do you usually enjoy?",
        "Do any particular songs or artists help when you feel this way?",
        "I notice you mentioned that. How long have you been feeling this way?"
      ];
      response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    }
    
    // Add AI response to transcript
    setTranscript(prev => [...prev, {
      speaker: "AI",
      text: response
    }]);
    
    // Speak the AI response
    speakText(response);
  };

  // Function to speak text using Speech Synthesis
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Optional: Set voice properties
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Get available voices and select a female voice if available
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('female'));
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    // Reset state for new conversation
    setIsRecording(true);
    setConversationEnded(false);
    setSongRecommendations([]);
    setCurrentlyPlaying(null);
    setError(null);
    lastProcessedTranscriptRef.current = "";
    
    // Stop any currently playing audio if using the built-in audio player
    if (musicServiceRef.current && currentlyPlaying) {
      try {
        await musicServiceRef.current.pausePlayback();
      } catch (error) {
        console.error("Error stopping playback:", error);
      }
    }
    
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.start();
        
        // Set initial greeting
        const greeting = "Hi there! I'm here to recommend music based on your mood. How are you feeling today?";
        setTranscript([{
          speaker: "AI",
          text: greeting
        }]);
        
        // Speak the greeting
        speakText(greeting);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setError({
          title: 'Speech Recognition Error',
          message: 'Could not access your microphone. Please check your browser permissions.'
        });
        setIsRecording(false);
      }
    } else {
      setError({
        title: 'Speech Recognition Not Available',
        message: 'Your browser does not support speech recognition. Please try using Chrome, Edge, or Safari.'
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setConversationEnded(true);
    setIsLoading(true);
    
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    
    // Cancel any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Analyze mood and recommend songs
    analyzeMoodAndRecommendSongs();
  };

  // Handle Spotify login
  const handleSpotifyLogin = () => {
    try {
      AuthHandler.initiateLogin('spotify');
    } catch (error) {
      console.error("Error initiating Spotify login:", error);
      const handledError = ErrorHandler.handleApiError(error);
      setError({
        title: 'Authentication Error',
        message: handledError.message
      });
    }
  };

  // Switch between music services
  const switchMusicService = () => {
    const newService = authStatus.currentService === 'spotify' ? 'youtube' : 'spotify';
    
    if (newService === 'spotify' && !authStatus.spotify) {
      // Need to authenticate with Spotify first
      handleSpotifyLogin();
      return;
    }
    
    setAuthStatus(prev => ({
      ...prev,
      currentService: newService
    }));
    
    musicServiceRef.current = MusicServiceFactory.getService(newService);
    
    // Stop current playback
    if (currentlyPlaying) {
      stopSong();
    }
  };

  const analyzeMoodAndRecommendSongs = async () => {
    try {
      // Use the advanced conversation engine to generate a conclusion
      // Get the context and analysis from the conversation engine
      const conversationContext = ConversationEngine.context;
      
      // Use the enhanced mood analyzer for a final analysis
      const moodAnalysis = MoodAnalyzer.analyzeMood(transcript);
      const mood = moodAnalysis.mood;
      
      // Get recommendations from music service based on mood
      if (!musicServiceRef.current) {
        musicServiceRef.current = MusicServiceFactory.getPreferredService();
      }

      // Initialize the music service if not already done
      if (typeof musicServiceRef.current.initialize === 'function') {
        await musicServiceRef.current.initialize();
      }
      
      // Use genres from conversation context if available
      const genrePreference = conversationContext.mentionedGenres.length > 0 
        ? conversationContext.mentionedGenres[0] 
        : null;
        
      // Get recommendations, passing genre if available
      const recommendations = await musicServiceRef.current.getRecommendationsByMood(
        mood, 
        genrePreference ? 5 : 3, // Get more recommendations if we have a genre preference
        genrePreference
      );
      
      setSongRecommendations(recommendations);
      
      // Generate a personalized conclusion using the conversation engine
      const conclusion = ConversationEngine.generateConclusion(mood);
      
      setTranscript(prev => [...prev, {
        speaker: "AI",
        text: conclusion
      }]);
      
      // Speak the conclusion
      speakText(conclusion);
      
      // After speaking concludes, play the first song
      const utterance = new SpeechSynthesisUtterance(conclusion);
      utterance.onend = () => {
        // Play the first recommended song after a brief delay
        if (recommendations && recommendations.length > 0) {
          setTimeout(() => {
            playSong(recommendations[0]);
          }, 500);
        }
      };
      
      // Use speech synthesis API
      window.speechSynthesis.speak(utterance);
      
      // Fallback in case speech synthesis doesn't fire onend event
      setTimeout(() => {
        if (recommendations && recommendations.length > 0 && !currentlyPlaying) {
          playSong(recommendations[0]);
        }
      }, 5000);
      
    } catch (error) {
      console.error("Error analyzing mood and getting recommendations:", error);
      const handledError = ErrorHandler.handleApiError(error);
      setError({
        title: 'Recommendation Error',
        message: handledError.message
      });
      
      // Add error message to transcript
      setTranscript(prev => [...prev, {
        speaker: "AI",
        text: "I'm having trouble finding song recommendations. Please try again later."
      }]);
      
      // Speak the error message
      speakText("I'm having trouble finding song recommendations. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Play a song using the current music service
  const playSong = async (song) => {
    try {
      setIsLoading(true);
      
      // If we already have something playing, stop it first
      if (currentlyPlaying) {
        await musicServiceRef.current.pausePlayback();
      }
      
      // Play the song using the music service
      await musicServiceRef.current.playTrack(song.uri);
      
      // Update currently playing state
      setCurrentlyPlaying(song);
      setError(null);
    } catch (error) {
      console.error("Error playing song:", error);
      
      // Handle the error with fallback option
      const handledError = ErrorHandler.handlePlaybackError(error, () => {
        // Fallback to alternative service
        switchMusicService();
        // Try playing again with new service after a brief delay
        setTimeout(() => {
          playSong(song);
        }, 1000);
      });
      
      setError({
        title: 'Playback Error',
        message: handledError.message,
        hasFallback: handledError.hasFallback,
        fallbackAction: handledError.fallbackCallback
      });
      
      setCurrentlyPlaying(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Stop playing the current song
  const stopSong = async () => {
    try {
      await musicServiceRef.current.pausePlayback();
      setCurrentlyPlaying(null);
    } catch (error) {
      console.error("Error stopping song:", error);
      // For stop errors, just clean up the UI state regardless
      setCurrentlyPlaying(null);
    }
  };

  // Initialize voice list when the component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Chrome needs this to properly load voices
      speechSynthesisRef.current = window.speechSynthesis;
      speechSynthesisRef.current.onvoiceschanged = () => {
        speechSynthesisRef.current.getVoices();
      };
    }
    
    // Clean up on unmount
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
      
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      if (musicServiceRef.current && typeof musicServiceRef.current.pausePlayback === 'function') {
        musicServiceRef.current.pausePlayback().catch(e => {
          // Ignore errors during cleanup
        });
      }
    };
  }, []);

  // Dismiss error message
  const dismissError = () => {
    setError(null);
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
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '0.5rem' }}>🎵</span>
              Mood Music Recommender
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              backgroundColor: authStatus.spotify ? '#10b981' : '#f59e0b',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem'
            }}>
              Using {authStatus.currentService === 'spotify' ? 'Spotify' : 'YouTube Music'}
            </div>
          </h1>
          <p style={{ color: '#e0e7ff' }}>Talk to me and I'll recommend songs based on your mood</p>
          
          {/* Service switcher */}
          <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
            <button 
              onClick={authStatus.spotify ? switchMusicService : handleSpotifyLogin}
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'transparent',
                border: '1px solid white',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              {authStatus.spotify 
                ? (authStatus.currentService === 'spotify' ? 'Switch to YouTube Music' : 'Switch to Spotify') 
                : 'Connect Spotify'}
            </button>
          </div>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {/* Error display */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '0.375rem',
              padding: '1rem',
              marginBottom: '1rem',
              position: 'relative'
            }}>
              <button 
                onClick={dismissError}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  border: 'none',
                  background: 'none',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
              <h3 style={{ color: '#b91c1c', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {error.title || 'Error'}
              </h3>
              <p style={{ color: '#7f1d1d' }}>{error.message}</p>
              
              {error.hasFallback && error.fallbackAction && (
                <button 
                  onClick={error.fallbackAction}
                  style={{
                    marginTop: '0.5rem',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  Try with {authStatus.currentService === 'spotify' ? 'YouTube Music' : 'Spotify'}
                </button>
              )}
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '1.5rem' 
          }}>
            {!isRecording ? (
              <button 
                onClick={startRecording}
                disabled={isLoading}
                style={{
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '1rem 1.5rem',
                  borderRadius: '9999px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>▶️</span>
                Start Conversation
              </button>
            ) : (
              <button 
                onClick={stopRecording}
                disabled={isLoading}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '1rem 1.5rem',
                  borderRadius: '9999px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>⏹️</span>
                End Conversation
              </button>
            )}
          </div>
          
          {/* Loading indicator */}
          {isLoading && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '1rem' 
            }}>
              <div style={{
                display: 'inline-block',
                width: '1.5rem',
                height: '1.5rem',
                border: '3px solid #e5e7eb',
                borderTopColor: '#4f46e5',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          )}
          
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
                        borderBottom: index !== songRecommendations.length - 1 ? '1px solid #e0e7ff' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        {song.albumArt && (
                          <img 
                            src={song.albumArt} 
                            alt={`${song.title} album art`}
                            style={{
                              width: '3rem',
                              height: '3rem',
                              borderRadius: '0.25rem',
                              marginRight: '0.75rem',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: '600' }}>{song.title}</div>
                          <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>by {song.artist}</div>
                        </div>
                      </div>
                      <div>
                        {currentlyPlaying && currentlyPlaying.id === song.id ? (
                          <button
                            onClick={stopSong}
                            disabled={isLoading}
                            style={{
                              backgroundColor: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '9999px',
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: isLoading ? 'not-allowed' : 'pointer',
                              opacity: isLoading ? 0.7 : 1
                            }}
                          >
                            ⏹️
                          </button>
                        ) : (
                          <button
                            onClick={() => playSong(song)}
                            disabled={isLoading}
                            style={{
                              backgroundColor: '#4f46e5',
                              color: 'white',
                              border: 'none',
                              borderRadius: '9999px',
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: isLoading ? 'not-allowed' : 'pointer',
                              opacity: isLoading ? 0.7 : 1
                            }}
                          >
                            ▶️
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Now playing status */}
              {currentlyPlaying && (
                <div style={{ 
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {currentlyPlaying.albumArt && (
                      <img 
                        src={currentlyPlaying.albumArt} 
                        alt="Album art"
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '0.25rem',
                          marginRight: '0.75rem'
                        }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>Now Playing via {authStatus.currentService === 'spotify' ? 'Spotify' : 'YouTube Music'}</div>
                      <div>{currentlyPlaying.title} - {currentlyPlaying.artist}</div>
                    </div>
                  </div>
                  <button
                    onClick={stopSong}
                    disabled={isLoading}
                    style={{
                      backgroundColor: 'white',
                      color: '#4f46e5',
                      border: 'none',
                      borderRadius: '9999px',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.7 : 1,
                      flexShrink: 0
                    }}
                  >
                    ⏹️
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* CSS for animations */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default MoodMusicApp;