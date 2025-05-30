import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createModel, Model, KaldiRecognizer } from 'vosk-browser';
import { ServerMessageResult } from 'vosk-browser/dist/interfaces';

// Interface for the component props
interface VoskSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  isListening: boolean;
}

// Model download status
type ModelStatus = 'not-loaded' | 'loading' | 'loaded' | 'error';

const VoskSpeechRecognition: React.FC<VoskSpeechRecognitionProps> = ({ onResult, isListening }) => {
  // State for managing component
  const [error, setError] = useState<string>('');
  const [modelStatus, setModelStatus] = useState<ModelStatus>('not-loaded');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  
  // Refs to manage instances
  const modelRef = useRef<Model | null>(null);
  const recognizerRef = useRef<KaldiRecognizer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  
  // Initialize Vosk and load the model
  useEffect(() => {
    async function initVosk() {
      if (modelStatus !== 'not-loaded') return;
      
      try {
        setModelStatus('loading');
        
        // Set up a progress tracker using message events
        const progressTracker = (event: MessageEvent) => {
          if (event.data && event.data.type === 'progress' && typeof event.data.progress === 'number') {
            setLoadingProgress(Math.round(event.data.progress * 100));
          }
        };
        
        // Add progress event listener to window
        window.addEventListener('message', progressTracker);
        
        // Initialize Vosk
        const model = await createModel(`${process.env.PUBLIC_URL}/models/vosk-model-small-ru.zip`, 0);
        
        // Remove progress listener
        window.removeEventListener('message', progressTracker);
        
        modelRef.current = model;
        setModelStatus('loaded');
        console.log('Vosk model loaded successfully');
      } catch (err) {
        console.error('Error loading Vosk model:', err);
        setError('Failed to load speech recognition model. Please try again later.');
        setModelStatus('error');
      }
    }
    
    initVosk();
    
    // Cleanup function
    return () => {
      if (modelRef.current) {
        modelRef.current.terminate();
        modelRef.current = null;
      }
    };
  }, [modelStatus]);
  
  // Handle cleanup of audio resources
  const cleanupAudio = useCallback(() => {
    // Stop processor node if exists
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }
    
    // Stop media stream if exists
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Close audio context if exists
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Free recognizer if exists
    if (recognizerRef.current) {
      recognizerRef.current.remove();
      recognizerRef.current = null;
    }
  }, []);
  
  // Start/stop listening based on isListening prop
  useEffect(() => {
    async function startRecognition() {
      // Don't start if model is not loaded
      if (modelStatus !== 'loaded' || !modelRef.current) {
        return;
      }
      
      try {
        // Clean up any existing audio processing
        cleanupAudio();
        
        // Create a new audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000 // Vosk works best with 16kHz
        });
        audioContextRef.current = audioContext;
        
        // Get user microphone
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000
          }
        });
        mediaStreamRef.current = mediaStream;
        
        // Create recognizer
        const recognizer = new modelRef.current.KaldiRecognizer(audioContext.sampleRate);
        recognizerRef.current = recognizer;
        
        // Set up result callback
        recognizer.on("result", (message) => {
          // Type assertion - we know this is a result message since we're in the 'result' event handler
          const resultMessage = message as ServerMessageResult;
          if (resultMessage.result && resultMessage.result.text) {
            onResult(resultMessage.result.text.toLowerCase());
          }
        });
        
        // Create audio processing
        const source = audioContext.createMediaStreamSource(mediaStream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorNodeRef.current = processor;
        
        // Connect audio processing
        processor.onaudioprocess = (e) => {
          if (recognizerRef.current) {
            recognizerRef.current.acceptWaveform(e.inputBuffer);
          }
        };
        
        source.connect(processor);
        processor.connect(audioContext.destination);
        
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setError('Failed to access microphone. Please ensure microphone permissions are granted.');
        cleanupAudio();
      }
    }
    
    if (isListening) {
      startRecognition();
    } else {
      cleanupAudio();
    }
    
    // Cleanup on unmount
    return cleanupAudio;
  }, [isListening, modelStatus, cleanupAudio, onResult]);
  
  // Render loading, error states or recognition UI
  return (
    <div className="speech-recognition">
      {modelStatus === 'loading' && (
        <div className="model-loading">
          <p>Loading speech recognition model... {loadingProgress}%</p>
          <div className="progress-bar">
            <div 
              className="progress-indicator" 
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
      
      {modelStatus === 'loaded' && isListening && (
        <div className="listening-indicator">Listening...</div>
      )}
    </div>
  );
};

export default VoskSpeechRecognition; 