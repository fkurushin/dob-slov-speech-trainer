import React, { useState, useEffect, useRef, useCallback } from 'react';
import { KaldiRecognizer } from 'vosk-browser';
import { ServerMessageResult } from 'vosk-browser/dist/interfaces';
import VoskService from '../services/VoskService';

// Interface for speech recognition result with confidence scores
export interface SpeechRecognitionResult {
  text: string;
  words: Array<{
    word: string;
    confidence: number;
    startTime: number;
    endTime: number;
  }>;
}

// Interface for the component props
interface VoskSpeechRecognitionProps {
  onResult: (result: SpeechRecognitionResult) => void;
  isListening: boolean;
}

const VoskSpeechRecognition: React.FC<VoskSpeechRecognitionProps> = ({ onResult, isListening }) => {
  // State for managing component
  const [error, setError] = useState<string>('');
  const [modelStatus, setModelStatus] = useState<string>(VoskService.getInstance().getModelStatus());
  const [loadingProgress, setLoadingProgress] = useState<number>(VoskService.getInstance().getLoadingProgress());
  
  // Refs to manage instances
  const recognizerRef = useRef<KaldiRecognizer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  
  // Subscribe to VoskService status and progress updates
  useEffect(() => {
    const voskService = VoskService.getInstance();
    
    // Add status listener
    const removeStatusListener = voskService.addStatusListener((status) => {
      setModelStatus(status);
    });
    
    // Add progress listener
    const removeProgressListener = voskService.addProgressListener((progress) => {
      setLoadingProgress(progress);
    });
    
    // Cleanup listeners on unmount
    return () => {
      removeStatusListener();
      removeProgressListener();
    };
  }, []);
  
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
      try {
        // Get the Vosk model from service
        const model = await VoskService.getInstance().getModel();
        
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
        const recognizer = new model.KaldiRecognizer(audioContext.sampleRate);
        // Enable word confidence scores
        recognizer.setWords(true);
        recognizerRef.current = recognizer;
        
        // Set up result callback
        recognizer.on("result", (message) => {
          // Type assertion - we know this is a result message since we're in the 'result' event handler
          const resultMessage = message as ServerMessageResult;
          if (resultMessage.result) {
            // Extract the full text
            const text = resultMessage.result.text.toLowerCase();
            
            // Extract word details with confidence scores
            const words = resultMessage.result.result.map(wordInfo => ({
              word: wordInfo.word.toLowerCase(),
              confidence: wordInfo.conf, // Confidence score 0-1
              startTime: wordInfo.start,
              endTime: wordInfo.end
            }));
            
            // Send the detailed result to the parent component
            onResult({
              text,
              words
            });
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
        setError('Failed to access microphone or load model. Please ensure microphone permissions are granted.');
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
  }, [isListening, cleanupAudio, onResult]);
  
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