import { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface UseSpeechToTextProps {
  continuous?: boolean;
  clearOnStop?: boolean;
  language?: string;
}

interface SpeechToTextHook {
  text: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetText: () => void;
  browserSupportsSpeechRecognition: boolean;
  isMicrophoneAvailable: boolean;
}

export const useSpeechToText = ({
  continuous = false,
  clearOnStop = false,
  language = 'en-US',
}: UseSpeechToTextProps = {}): SpeechToTextHook => {
  const [text, setText] = useState<string>('');
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  // Update the text state when transcript changes
  useEffect(() => {
    setText(transcript);
  }, [transcript]);

  // Start listening handler
  const startListening = useCallback(() => {
    SpeechRecognition.startListening({ 
      continuous, 
      language 
    });
  }, [continuous, language]);

  // Stop listening handler
  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
    
    if (clearOnStop) {
      resetTranscript();
      setText('');
    }
  }, [clearOnStop, resetTranscript]);

  // Reset text handler
  const resetText = useCallback(() => {
    resetTranscript();
    setText('');
  }, [resetTranscript]);

  return {
    text,
    isListening: listening,
    startListening,
    stopListening,
    resetText,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  };
};

export default useSpeechToText; 