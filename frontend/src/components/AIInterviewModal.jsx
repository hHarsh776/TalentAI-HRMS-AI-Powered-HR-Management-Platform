import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, StopCircle, CheckCircle, X, Loader2, Play, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../utils/api';

const QUESTIONS = [
  "Could you please introduce yourself and walk me through your background?",
  "What is your proudest technical achievement?",
  "How do you handle disagreements with your team?",
  "Can you explain a complex concept to a non-technical stakeholder?",
  "What is your approach to testing and ensuring code quality?",
  "Describe a time you failed and what you learned.",
  "How do you prioritize your tasks when under a tight deadline?",
  "What are your thoughts on recent industry trends?",
  "Where do you see yourself in 3 years?",
  "Do you have any questions for us?"
];

export default function AIInterviewModal({ isOpen, onClose, onComplete }) {
  const { token } = useAuth();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [responses, setResponses] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Speech Recognition hook
  const recognitionRef = useRef(null);

  const speakText = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isOpen) {
      speakText(QUESTIONS[currentQIndex]);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [currentQIndex, isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setTextInput(prev => prev + " " + finalTranscript);
          }
        };
      }
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTextInput('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleNext = async () => {
    const currentQ = QUESTIONS[currentQIndex];
    const newResponses = [
      ...responses,
      {
        q: currentQ,
        transcript: textInput || "No response provided.",
        sentiment: "Neutral",
        confidence_score: 80
      }
    ];
    
    setResponses(newResponses);
    setTextInput('');
    if (isRecording) toggleRecording();

    if (currentQIndex < QUESTIONS.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      // Submit
      setSubmitting(true);
      try {
        const res = await fetch(`${API_BASE}/interviews/demo_evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ responses: newResponses })
        });
        const data = await res.json();
        onComplete(data);
      } catch (e) {
        console.error(e);
        // Mock fallback if backend offline
        onComplete({
          communication_score: 88,
          confidence_score: 82,
          overall_sentiment: "Positive",
          feedback_summary: "Great job! Your responses were clear and professional."
        });
      } finally {
        setSubmitting(false);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600">
          <div className="flex items-center text-white">
            <Video className="h-5 w-5 mr-2" />
            <h2 className="font-bold">AI Simple Interview</h2>
          </div>
          <button onClick={onClose} className="text-indigo-100 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span>Question {currentQIndex + 1} of {QUESTIONS.length}</span>
            <div className="flex space-x-1">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`h-2 w-6 rounded-full ${i <= currentQIndex ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
              ))}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 text-center leading-relaxed flex items-center justify-center">
            "{QUESTIONS[currentQIndex]}"
            <button 
              onClick={() => speakText(QUESTIONS[currentQIndex])}
              className="ml-3 p-2 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-full transition"
              title="Speak Question"
            >
              <Volume2 className="h-6 w-6" />
            </button>
          </h3>

          <div className="relative">
            <textarea
              className="w-full h-40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
              placeholder="Type your answer here or click the microphone to speak..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center text-red-500 animate-pulse">
                <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                <span className="text-xs font-bold">Listening...</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={toggleRecording}
              className={`flex items-center px-5 py-3 rounded-xl font-bold transition-all shadow-sm ${
                isRecording 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400'
              }`}
            >
              {isRecording ? <StopCircle className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
              {isRecording ? 'Stop Speaking' : 'Dictate Answer'}
            </button>

            <button
              onClick={handleNext}
              disabled={submitting}
              className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : currentQIndex === QUESTIONS.length - 1 ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Submit Interview
                </>
              ) : (
                <>
                  Next Question
                  <Play className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
