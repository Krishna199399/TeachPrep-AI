import React, { useState } from 'react';
import { FiMic, FiMicOff, FiLoader } from 'react-icons/fi';
import useSpeechToText from '@/hooks/useSpeechToText';

interface SpeechRecognitionProps {
  onTextCapture: (text: string) => void;
  placeholder?: string;
  buttonLabel?: string;
  className?: string;
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({
  onTextCapture,
  placeholder = 'Speak to enter text...',
  buttonLabel = 'Voice Input',
  className = '',
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  
  const {
    text,
    isListening,
    startListening,
    stopListening,
    resetText,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechToText({
    continuous: true,
    clearOnStop: false,
  });

  // Handle starting the speech recognition
  const handleStart = () => {
    resetText();
    startListening();
    setShowFeedback(true);
  };

  // Handle stopping the speech recognition
  const handleStop = () => {
    stopListening();
    if (text.trim()) {
      onTextCapture(text);
    }
  };

  // If browser doesn't support speech recognition
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-sm text-gray-500">
        Your browser does not support speech recognition.
      </div>
    );
  }

  // If microphone isn't available
  if (!isMicrophoneAvailable) {
    return (
      <div className="text-sm text-gray-500">
        Microphone access is required for speech recognition.
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        {/* Speech input display area */}
        <div className="relative flex-1">
          <input
            type="text"
            className="input input-bordered w-full pr-10"
            placeholder={placeholder}
            value={text}
            onChange={(e) => onTextCapture(e.target.value)}
            readOnly={isListening}
          />
          
          {/* Microphone button inside input */}
          <button
            onClick={isListening ? handleStop : handleStart}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full 
              ${isListening 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <FiMicOff className="h-5 w-5" /> : <FiMic className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Speech recognition feedback */}
      {showFeedback && (
        <div className="mt-2 text-sm">
          {isListening ? (
            <div className="flex items-center text-primary-600">
              <div className="mr-2 flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-1"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span>Listening...</span>
            </div>
          ) : text ? (
            <div className="text-gray-600">
              Speech captured. Click the microphone icon to start over.
            </div>
          ) : (
            <div className="text-gray-600">
              Click the microphone icon and start speaking.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeechRecognition; 