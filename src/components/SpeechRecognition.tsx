import React, { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionProps {
  onResult: (transcript: string) => void;
  isListening: boolean;
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({ onResult, isListening }) => {
  const [error, setError] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Cleanup function to properly stop recognition
  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Error stopping recognition:', e);
      }
      recognitionRef.current = null;
    }
    isProcessingRef.current = false;
  }, []);

  // Initialize speech recognition
  const startListening = useCallback(() => {
    if (!isListening || isProcessingRef.current) return;

    // Always clean up any existing recognition instance first
    cleanupRecognition();
    
    setError('');
    isProcessingRef.current = true;
    
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in your browser.');
      isProcessingRef.current = false;
      return;
    }

    // Detect browser
    const userAgent = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    const isYandex = /YaBrowser/i.test(userAgent);
    
    try {
      // @ts-ignore - TypeScript doesn't know about the Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.lang = 'ru-RU'; // Set to Russian for this app
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      // Browser-specific settings
      if (isSafari || isYandex) {
        // Some browsers need these explicit settings
        recognition.continuous = false;
        recognition.interimResults = false;
      }

      // For Yandex, sometimes we need to adjust the language settings
      if (isYandex) {
        // Try alternative language codes that might work better in Yandex
        recognition.lang = 'ru'; // Simplified language code sometimes works better
      }
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        isProcessingRef.current = false;
        onResult(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error, 'Browser:', userAgent);
        
        if (event.error === 'aborted') {
          setError('Speech recognition was aborted. Please try again.');
          // Don't try to restart on abort errors - this can cause cascading failures
          isProcessingRef.current = false;
        } else if (event.error === 'service-not-allowed') {
          if (isSafari) {
            setError('Safari has limited speech recognition support. Try using Chrome instead. Make sure your site is on HTTPS and you\'ve allowed microphone access.');
          } else if (isYandex) {
            setError('Yandex Browser has issues with speech recognition. Try enabling microphone permissions or using Chrome instead.');
          } else {
            setError('Speech recognition service not allowed. Make sure you\'ve granted microphone permissions.');
          }
          isProcessingRef.current = false;
        } else if (event.error === 'network') {
          setError('Network error occurred. Check your internet connection.');
          isProcessingRef.current = false;
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Please try speaking again.');
          isProcessingRef.current = false;
        } else {
          setError(`Error occurred in recognition: ${event.error}`);
          isProcessingRef.current = false;
        }
      };
      
      recognition.onend = () => {
        // Only attempt to restart if we're still supposed to be listening
        // and no error has occurred and we're not already processing
        if (isListening && !error && isProcessingRef.current) {
          // Add a small delay to prevent rapid restart loops
          setTimeout(() => {
            if (isListening && recognitionRef.current === recognition) {
              try {
                recognition.start();
              } catch (e) {
                console.error('Error restarting recognition:', e);
                isProcessingRef.current = false;
              }
            }
          }, 300);
        } else {
          isProcessingRef.current = false;
        }
      };
      
      // Start recognition
      try {
        recognition.start();
      } catch (e) {
        console.error('Error starting recognition:', e);
        setError('Failed to start speech recognition. Please refresh the page and try again.');
        isProcessingRef.current = false;
      }
      
      // Clean up on unmount or when isListening changes
      return cleanupRecognition;
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      let browserName = 'your browser';
      if (isSafari) browserName = 'Safari';
      if (isYandex) browserName = 'Yandex Browser';
      setError(`Failed to initialize speech recognition. ${browserName} has limited support. Try Chrome instead.`);
      isProcessingRef.current = false;
    }
  }, [isListening, onResult, error, cleanupRecognition]);

  // Effect to handle changes to isListening
  useEffect(() => {
    if (isListening) {
      const cleanup = startListening();
      return cleanup;
    } else {
      // Make sure we clean up when isListening becomes false
      cleanupRecognition();
    }
  }, [isListening, startListening, cleanupRecognition]);

  // Make sure we clean up on unmount
  useEffect(() => {
    return cleanupRecognition;
  }, [cleanupRecognition]);

  return (
    <div className="speech-recognition">
      {error && <p className="error">{error}</p>}
      {isListening && <div className="listening-indicator">Listening...</div>}
    </div>
  );
};

export default SpeechRecognition; 