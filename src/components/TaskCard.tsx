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

// Word similarity threshold
const SIMILARITY_THRESHOLD = 0.7; // 0-1 scale, higher means more strict

// Calculate similarity between two strings (0-1)
const calculateStringSimilarity = (s1: string, s2: string): number => {
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;
  
  // Simple character-based similarity for Russian words
  const shorter = s1.length < s2.length ? s1 : s2;
  const longer = s1.length < s2.length ? s2 : s1;
  
  let matchCount = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (shorter[i] === longer[i]) {
      matchCount++;
    }
  }
  
  return matchCount / longer.length;
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskCompleted }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<string>('');
  const [similarity, setSimilarity] = useState<number | null>(null);

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
    setSimilarity(null);
  }, [task]);

  const handleStartListening = useCallback(() => {
    setIsListening(true);
    setTranscript('');
    setIsCorrect(null);
    setConfidenceLevel(null);
    setPronunciationFeedback('');
    setSimilarity(null);
  }, []);

  const handleSpeechResult = useCallback((result: SpeechRecognitionResult) => {
    setIsListening(false);
    setTranscript(result.text);
    
    // Clean up the input text and expected word for comparison
    const cleanText = normalizeRussianText(result.text.toLowerCase().trim());
    const cleanExpected = normalizeRussianText(task.expectedWord.toLowerCase().trim());
    
    // Calculate string similarity to expected word
    const wordSimilarity = calculateStringSimilarity(cleanText, cleanExpected);
    setSimilarity(wordSimilarity);
    
    // Check for text similarity first
    const isSimilarEnough = wordSimilarity >= SIMILARITY_THRESHOLD;
    
    // Only check exact match if similarity is high enough
    const isExactMatch = 
      cleanText === cleanExpected || 
      cleanText.split(/\s+/).includes(cleanExpected) ||
      new RegExp(`\\b${cleanExpected}\\b`).test(cleanText);
    
    // Find the word in the recognized words to check confidence
    // We look for words that are most similar to our expected word
    let highestSimilarity = 0;
    let bestMatchingWord = null;
    
    for (const word of result.words) {
      const normalizedWord = normalizeRussianText(word.word.toLowerCase());
      const similarityScore = calculateStringSimilarity(normalizedWord, cleanExpected);
      
      if (similarityScore > highestSimilarity) {
        highestSimilarity = similarityScore;
        bestMatchingWord = word;
      }
    }
    
    // Extract confidence level if a similar word was found
    const confidence = bestMatchingWord ? bestMatchingWord.confidence : 0;
    setConfidenceLevel(confidence);
    
    // Only consider good pronunciation if similarity is high enough
    const isGoodPronunciation = isSimilarEnough && confidence >= CONFIDENCE_THRESHOLD;
    
    // Only count as correct if the word is recognized AND well-pronounced
    const isCorrectAnswer = (isExactMatch || isSimilarEnough) && isGoodPronunciation;
    
    // Provide specific feedback based on the issue
    if (wordSimilarity < SIMILARITY_THRESHOLD) {
      // If the word is completely different
      setPronunciationFeedback(`Вы сказали совсем другое слово. Нужно: ${task.expectedWord}`);
    } else if (!isGoodPronunciation) {
      // If the word is similar but pronunciation is poor
      setPronunciationFeedback('Произношение недостаточно четкое. Говорите более ясно.');
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
      similarity: wordSimilarity,
      isSimilarEnough,
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
            
            {similarity !== null && (
              <div className="similarity-meter">
                <p>Схожесть со словом "{task.expectedWord}": {Math.round(similarity * 100)}%</p>
                <div className="progress-bar">
                  <div 
                    className={`progress-indicator ${similarity >= SIMILARITY_THRESHOLD ? 'good' : 'poor'}`}
                    style={{ width: `${similarity * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
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