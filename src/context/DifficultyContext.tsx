import React, { createContext, useState, useContext } from 'react';
import { DifficultyLevel } from '../components/DifficultySelector';

interface DifficultySettings {
  confidenceThreshold: number;
  similarityThreshold: number;
}

// Define the difficulty levels and their thresholds
const difficultySettings: Record<DifficultyLevel, DifficultySettings> = {
  easy: {
    confidenceThreshold: 0.65,  // 65% - More forgiving
    similarityThreshold: 0.5,   // 50% - More forgiving for word matching
  },
  medium: {
    confidenceThreshold: 0.75,  // 75% - Moderate difficulty
    similarityThreshold: 0.6,   // 60% - Requires moderately accurate words
  },
  hard: {
    confidenceThreshold: 0.85,  // 85% - Strict pronunciation requirements
    similarityThreshold: 0.7,   // 70% - Requires accurate word recognition
  },
};

// The shape of our context
interface DifficultyContextType {
  difficulty: DifficultyLevel;
  setDifficulty: (difficulty: DifficultyLevel) => void;
  settings: DifficultySettings;
}

// Create the context with default values
const DifficultyContext = createContext<DifficultyContextType>({
  difficulty: 'medium',
  setDifficulty: () => {},
  settings: difficultySettings.medium,
});

// Custom hook to use the difficulty context
export const useDifficulty = () => useContext(DifficultyContext);

// Provider component
export const DifficultyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to get stored difficulty from localStorage, default to 'medium'
  const [difficulty, setDifficultyState] = useState<DifficultyLevel>(() => {
    const stored = localStorage.getItem('speechTrainerDifficulty');
    return (stored as DifficultyLevel) || 'medium';
  });

  // Update localStorage when difficulty changes
  const setDifficulty = (newDifficulty: DifficultyLevel) => {
    setDifficultyState(newDifficulty);
    localStorage.setItem('speechTrainerDifficulty', newDifficulty);
  };

  // Get settings for current difficulty
  const settings = difficultySettings[difficulty];

  // Value object for the context
  const value = {
    difficulty,
    setDifficulty,
    settings,
  };

  return (
    <DifficultyContext.Provider value={value}>
      {children}
    </DifficultyContext.Provider>
  );
};

export default DifficultyContext; 