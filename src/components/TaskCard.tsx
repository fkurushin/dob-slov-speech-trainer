import React, { useState, useEffect, useCallback } from 'react';
import { SpeechTask } from '../data/tasks';
import VoskSpeechRecognition, { SpeechRecognitionResult } from './VoskSpeechRecognition';
import './TaskCard.css';

interface TaskCardProps {
  task: SpeechTask;
  onTaskCompleted: () => void;
}

// Helper function to normalize Russian text (replace ё with е)
const normalizeRussianText = (text: string): string => {
  return text.replace(/ё/gi, 'е');
};

// Confidence threshold for good pronunciation (0-1)
const CONFIDENCE_THRESHOLD = 0.85;

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskCompleted }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<string>('');

  // Debug: Log task information when it changes
  useEffect(() => {
    console.log('Task changed:', {
      id: task.id,
      prompt: task.prompt,
      expectedWord: task.expectedWord,
      imageUrl: task.imageUrl
    });
    
    // Reset state when task changes
    setTranscript('');
    setIsCorrect(null);
    setAttempts(0);
    setIsListening(false);
    setConfidenceLevel(null);
    setPronunciationFeedback('');
  }, [task]);

  const handleStartListening = useCallback(() => {
    setIsListening(true);
    setTranscript('');
    setIsCorrect(null);
    setConfidenceLevel(null);
    setPronunciationFeedback('');
  }, []);

  const handleSpeechResult = useCallback((result: SpeechRecognitionResult) => {
    setIsListening(false);
    setTranscript(result.text);
    
    // Clean up the input text and expected word for comparison
    const cleanText = normalizeRussianText(result.text.toLowerCase().trim());
    const cleanExpected = normalizeRussianText(task.expectedWord.toLowerCase().trim());
    
    // Check for exact match or word boundary
    const isExactMatch = 
      cleanText === cleanExpected || 
      cleanText.split(/\s+/).includes(cleanExpected) ||
      new RegExp(`\\b${cleanExpected}\\b`).test(cleanText);
    
    // Find the expected word in the recognized words to check confidence
    const recognizedWord = result.words.find(word => 
      normalizeRussianText(word.word) === cleanExpected ||
      normalizeRussianText(word.word).includes(cleanExpected) ||
      cleanExpected.includes(normalizeRussianText(word.word))
    );
    
    // Extract confidence level if word was found
    const confidence = recognizedWord ? recognizedWord.confidence : 0;
    setConfidenceLevel(confidence);
    
    // Determine if pronunciation is acceptable based on confidence
    const isGoodPronunciation = confidence >= CONFIDENCE_THRESHOLD;
    
    // Only count as correct if the word is recognized AND well-pronounced
    const isCorrectAnswer = isExactMatch && isGoodPronunciation;
    
    // Provide specific feedback based on the issue
    if (isExactMatch && !isGoodPronunciation) {
      setPronunciationFeedback('Слово распознано, но произношение недостаточно четкое. Попробуйте еще раз.');
    } else if (!isExactMatch) {
      setPronunciationFeedback('Слово не распознано. Пожалуйста, произнесите его еще раз.');
    } else {
      setPronunciationFeedback('');
    }
    
    console.log('Speech recognition:', {
      taskId: task.id,
      prompt: task.prompt,
      said: result.text,
      normalizedSaid: cleanText,
      expected: task.expectedWord,
      normalizedExpected: cleanExpected,
      isExactMatch,
      confidence,
      isGoodPronunciation,
      isCorrectAnswer,
      words: result.words
    });
    
    setIsCorrect(isCorrectAnswer);
    setAttempts(prev => prev + 1);
    
    if (isCorrectAnswer) {
      // Move to next task after a brief delay to show success message
      setTimeout(() => {
        onTaskCompleted();
      }, 1500);
    }
  }, [task, onTaskCompleted]);

  return (
    <div className="task-card">
      <div className="task-image-container">
        <img 
          src={task.imageUrl} 
          alt={`Task ${task.id}`} 
          className="task-image"
          onError={(e) => {
            // Fallback image if the specified image doesn't load
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Task+Image';
          }}
        />
      </div>
      
      <div className="task-content">
        <h2 className="task-prompt">{task.prompt}</h2>
        
        {!isListening && !isCorrect && (
          <button 
            className="speak-button"
            onClick={handleStartListening}
          >
            Начать говорить
          </button>
        )}
        
        <VoskSpeechRecognition
          isListening={isListening} 
          onResult={handleSpeechResult} 
        />
        
        {transcript && (
          <div className="transcript-container">
            <p>Вы сказали: <span className="transcript">{transcript}</span></p>
            
            {confidenceLevel !== null && (
              <div className="confidence-meter">
                <p>Четкость произношения: {Math.round(confidenceLevel * 100)}%</p>
                <div className="progress-bar">
                  <div 
                    className={`progress-indicator ${confidenceLevel >= CONFIDENCE_THRESHOLD ? 'good' : 'poor'}`}
                    style={{ width: `${confidenceLevel * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {pronunciationFeedback && (
              <p className="feedback pronunciation">
                {pronunciationFeedback}
              </p>
            )}
            
            {isCorrect === false && !pronunciationFeedback && (
              <p className="feedback incorrect">
                Неправильно. Попробуйте еще раз.
              </p>
            )}
            
            {isCorrect === true && (
              <p className="feedback correct">
                Правильно! Молодец!
              </p>
            )}
          </div>
        )}
        
        {attempts > 0 && (
          <div className="attempts-counter">
            Попыток: {attempts}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard; 