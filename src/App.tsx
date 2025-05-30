import React from 'react';
import './App.css';
import SpeechTrainer from './components/SpeechTrainer';
import { DifficultyProvider } from './context/DifficultyContext';

function App() {
  return (
    <DifficultyProvider>
      <div className="App">
        <SpeechTrainer />
      </div>
    </DifficultyProvider>
  );
}

export default App;
