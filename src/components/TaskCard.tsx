import React, { useState, useEffect, useCallback } from 'react';
import { SpeechTask } from '../data/tasks';
import VoskSpeechRecognition from './VoskSpeechRecognition';
import './TaskCard.css';

interface TaskCardProps {
  task: SpeechTask;
  onTaskCompleted: () => void;
}

// Helper function to normalize Russian text (replace ё with е)
const normalizeRussianText = (text: string): string => {
  return text.replace(/ё/gi, 'е');
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskCompleted }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState<number>(0);

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
  }, [task]);

  const handleStartListening = useCallback(() => {
    setIsListening(true);
    setTranscript('');
    setIsCorrect(null);
  }, []);

  const handleSpeechResult = useCallback((text: string) => {
    setIsListening(false);
    setTranscript(text);
    
    // Clean up the input text and expected word for comparison
    const cleanText = normalizeRussianText(text.toLowerCase().trim());
    const cleanExpected = normalizeRussianText(task.expectedWord.toLowerCase().trim());
    
    // Check if the spoken text matches the expected word
    // Using exact match or word boundary check to avoid partial matches
    const isMatch = 
      cleanText === cleanExpected || 
      cleanText.split(/\s+/).includes(cleanExpected) ||
      new RegExp(`\\b${cleanExpected}\\b`).test(cleanText);
    
    console.log('Speech recognition:', {
      taskId: task.id,
      prompt: task.prompt,
      said: text,
      normalizedSaid: cleanText,
      expected: task.expectedWord,
      normalizedExpected: cleanExpected,
      isMatch: isMatch
    });
    
    setIsCorrect(isMatch);
    setAttempts(prev => prev + 1);
    
    if (isMatch) {
      // Move to next task after a brief delay to show success message
      setTimeout(() => {
        onTaskCompleted();
      }, 1500);
    }
  }, [task, onTaskCompleted]); // Add task as a dependency

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
            
            {isCorrect === false && (
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