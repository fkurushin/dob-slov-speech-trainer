import React from 'react';
import './DifficultySelector.css';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface DifficultySelectorProps {
  currentDifficulty: DifficultyLevel;
  onChange: (difficulty: DifficultyLevel) => void;
}

const difficultyLabels = {
  easy: 'Легкий',
  medium: 'Средний',
  hard: 'Сложный'
};

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ 
  currentDifficulty, 
  onChange 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value as DifficultyLevel);
  };

  return (
    <div className="difficulty-selector">
      <h3 className="difficulty-title">Сложность произношения</h3>
      <div className="difficulty-options">
        {Object.entries(difficultyLabels).map(([value, label]) => (
          <div key={value} className="difficulty-option">
            <input
              type="radio"
              id={`difficulty-${value}`}
              name="difficulty"
              value={value}
              checked={currentDifficulty === value}
              onChange={handleChange}
            />
            <label 
              htmlFor={`difficulty-${value}`}
              className={currentDifficulty === value ? 'selected' : ''}
            >
              {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector; 