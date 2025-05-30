import React, { useState, useEffect } from 'react';
import { tasks } from '../data/tasks';
import TaskCard from './TaskCard';
import DifficultySelector from './DifficultySelector';
import { useDifficulty } from '../context/DifficultyContext';
import './SpeechTrainer.css';

const SpeechTrainer: React.FC = () => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const { difficulty, setDifficulty } = useDifficulty();
  
  // Debug: Log current task index and corresponding task
  useEffect(() => {
    console.log('Current task index:', currentTaskIndex);
    console.log('Current task:', tasks[currentTaskIndex]);
    console.log('All tasks:', tasks);
  }, [currentTaskIndex]);
  
  const handleTaskCompleted = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentTaskIndex(0);
    setIsCompleted(false);
  };

  return (
    <div className="speech-trainer">
      <header className="trainer-header">
        <h1>Говори и Учись</h1>
        <p className="subtitle">Тренажер для практики произношения</p>
      </header>

      <DifficultySelector 
        currentDifficulty={difficulty}
        onChange={setDifficulty}
      />
      
      <div className="trainer-content">
        {!isCompleted ? (
          <>
            <div className="progress-bar">
              <div 
                className="progress-indicator" 
                style={{ width: `${((currentTaskIndex + 1) / tasks.length) * 100}%` }}
              ></div>
            </div>
            <div className="task-progress">
              Задание {currentTaskIndex + 1} из {tasks.length}
            </div>
            
            <TaskCard 
              key={`task-${currentTaskIndex}`}
              task={tasks[currentTaskIndex]} 
              onTaskCompleted={handleTaskCompleted} 
            />
          </>
        ) : (
          <div className="completion-message">
            <h2>Поздравляем!</h2>
            <p>Вы успешно завершили все задания.</p>
            <button className="restart-button" onClick={handleRestart}>
              Начать заново
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechTrainer; 