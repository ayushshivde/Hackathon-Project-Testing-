import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiVolume2, FiVolumeX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const VoiceCommand = ({ onSOSTrigger, isSOSActive }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      // Handle results
      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        setTranscript(transcript);
        
        // Check for SOS commands
        if (transcript.toLowerCase().includes('help') || 
            transcript.toLowerCase().includes('emergency') ||
            transcript.toLowerCase().includes('sos') ||
            transcript.toLowerCase().includes('send location')) {
          handleSOSCommand();
        }
      };

      // Handle end of recognition
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      // Handle errors
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        switch (event.error) {
          case 'no-speech':
            toast.error('No speech detected. Please try again.');
            break;
          case 'audio-capture':
            toast.error('No microphone found. Please check your microphone.');
            break;
          case 'not-allowed':
            toast.error('Microphone access denied. Please allow microphone access.');
            break;
          case 'network':
            toast.error('Network error. Please check your connection.');
            break;
          default:
            toast.error('Speech recognition error. Please try again.');
        }
      };
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!isSupported) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    if (isSOSActive) {
      toast.error('SOS is already active');
      return;
    }

    try {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
      toast.success('Listening... Say "Help me" or "Send location"');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Failed to start voice recognition');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSOSCommand = async () => {
    if (isSOSActive) {
      toast.error('SOS is already active');
      return;
    }

    setIsProcessing(true);
    stopListening();

    try {
      // Add a small delay to show the processing state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await onSOSTrigger();
      toast.success('SOS activated via voice command!');
    } catch (error) {
      console.error('Error triggering SOS via voice:', error);
      toast.error('Failed to activate SOS');
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  if (!isSupported) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <FiVolumeX className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Voice commands not supported in this browser
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Voice Commands</h3>
          <div className="flex items-center space-x-2">
            {isListening && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            )}
            <span className="text-sm text-gray-500">
              {isListening ? 'Listening...' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Voice Button */}
        <div className="text-center mb-4">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isSOSActive || isProcessing}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : isSOSActive || isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white hover:scale-105'
            }`}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isListening ? (
              <FiMicOff className="w-6 h-6" />
            ) : (
              <FiMic className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Status Messages */}
        <div className="space-y-2">
          {isSOSActive && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-800">
                  SOS is active
                </span>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">
                  Processing voice command...
                </span>
              </div>
            </div>
          )}

          {transcript && !isProcessing && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <FiVolume2 className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  You said:
                </span>
              </div>
              <p className="text-sm text-gray-600 italic">"{transcript}"</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Try saying:</p>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">• "Help me"</div>
            <div className="text-xs text-gray-600">• "Emergency"</div>
            <div className="text-xs text-gray-600">• "Send location"</div>
            <div className="text-xs text-gray-600">• "SOS"</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VoiceCommand;
