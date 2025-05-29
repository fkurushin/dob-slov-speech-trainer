# Speech Trainer Web Application

A web application for speech training, where users are prompted to say specific words based on images shown. 

## Features

- Displays images with text prompts
- Records and transcribes user's speech
- Validates if the user said the correct word
- Tracks progress through multiple tasks
- Provides feedback on correct/incorrect responses

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Modern web browser with support for the Web Speech API (Chrome recommended)

### Installation

1. Clone the repository:
```
git clone <repository-url>
```

2. Navigate to the project directory:
```
cd speech-trainer
```

3. Install dependencies:
```
npm install
```

4. Start the development server:
```
npm start
```

5. Open your browser and go to `http://localhost:3000`

## Usage

1. The application will display an image with a prompt (e.g., "скажи котик").
2. Click the "Начать говорить" button when you're ready to speak.
3. Say the word shown in the prompt.
4. The application will transcribe what you said and check if it matches the expected word.
5. If correct, you'll move to the next task. If incorrect, you can try again.

## Adding Your Own Images

Place your images in the `public` folder and update the image paths in `src/data/tasks.ts`.

## Customizing Tasks

Edit the `tasks` array in `src/data/tasks.ts` to customize the prompts, expected words, and images.

## Technologies Used

- React
- TypeScript
- Web Speech API

## License

This project is licensed under the MIT License.
