# Speech Training App with Vosk

This branch implements an offline speech recognition solution using [Vosk](https://alphacephei.com/vosk/) for the speech training application.

## Features

- **Offline Speech Recognition**: Works without internet connection
- **Russian Language Support**: Uses a dedicated Russian language model
- **Browser Compatibility**: Works in all modern browsers
- **Accurate Recognition**: Better recognition quality for Russian words

## Implementation Details

This implementation uses `vosk-browser`, a WebAssembly version of the Vosk speech recognition toolkit. Key features:

1. **First-time Model Loading**: 
   - Downloads a ~30-50MB Russian language model
   - Shows progress indicator during download
   - Caches the model for future use

2. **Audio Processing**:
   - Uses WebAudio API to capture microphone input
   - Processes audio in real-time
   - Returns accurate Russian transcriptions

3. **Browser Compatibility**:
   - Works in Chrome, Firefox, Safari, and other modern browsers
   - No cloud service dependencies

## Getting Started

### Setup and Installation

1. Clone the repository
2. Switch to the `feature-vosk-api` branch
3. Install dependencies:
   ```
   npm install
   ```
4. Download a Russian Vosk model:
   - Download from https://alphacephei.com/vosk/models (vosk-model-small-ru is recommended)
   - Place the model zip file in `public/models/vosk-model-small-ru.zip`
5. Start the development server:
   ```
   npm start
   ```

### Building for Production

For production deployment:
```
npm run build
```

## Important Notes

1. **Model Size**: The Russian model is approximately 30-50MB and will be downloaded on first use.
2. **Privacy**: All speech recognition happens on the client side - no data is sent to servers.
3. **Performance**: The app requires WebAssembly support in the browser.

## License

This project uses the Vosk toolkit which is licensed under the Apache 2.0 license. 