import React, { useEffect, useState } from 'react';
import { request } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Video, Award, Sparkles, Send, Play, CheckCircle, FileText, Activity, Mic, MicOff, Volume2 } from 'lucide-react';

export default function Interviews() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInterview, setActiveInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedCompletedInt, setSelectedCompletedInt] = useState(null);
  
  // Speech Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize Speech Recognition if supported
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setResponses(prev => {
            const currentText = prev[currentQuestionIndex] || '';
            return {
              ...prev,
              [currentQuestionIndex]: currentText + (currentText && !currentText.endsWith(' ') ? ' ' : '') + finalTranscript
            };
          });
        }
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
    
    loadInterviews();
  }, [currentQuestionIndex]); // Re-bind when question changes to keep closure fresh

  const loadInterviews = async () => {
    try {
      const data = await request('/interviews');
      setInterviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startInterview = (interview) => {
    setActiveInterview(interview);
    setCurrentQuestionIndex(0);
    setResponses({});
  };

  const handleResponseChange = (qIndex, value) => {
    setResponses(prev => ({
      ...prev,
      [qIndex]: value
    }));
  };

  const generateAutoMockResponse = (q) => {
    const mockAns = [
      "I have extensive experience designing React hooks and structuring state. In my last project, I refactored our context provider to use modular reducers, which reduced page render delays by 40% and improved code readability.",
      "When designing backend REST APIs, I prioritize clean URL structures, proper HTTP status codes, and input schema validation using libraries like Pydantic. I use Docker containers to standardise local development.",
      "To optimize database performance, I study the execution plan to identify missing indexes. I also apply caching layers, restructure relational joins, and utilize connection pooling to lower query response times.",
      "I manage project constraints by practicing transparent communication and agile sprint planning. I align key stakeholders early and focus on core MVP deliverables to meet strict deadlines successfully."
    ];
    // Pick an answer based on question index or random
    const idx = currentQuestionIndex % mockAns.length;
    handleResponseChange(currentQuestionIndex, mockAns[idx]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < activeInterview.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      stopSpeaking();
      if (isRecording && recognition) recognition.stop();
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSpeakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  const toggleRecording = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
      return;
    }
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleSubmitInterview = async () => {
    // Construct responses
    const formattedResponses = activeInterview.questions.map((q, idx) => {
      const text = responses[idx] || "I don't have direct experience with this but I am eager to learn and adapt.";
      return {
        q: q.q,
        transcript: text,
        sentiment: "Positive", // Will be analyzed by AI
        confidence_score: 85.0
      };
    });

    setSubmitting(true);
    try {
      await request(`/interviews/${activeInterview._id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ responses: formattedResponses })
      });
      alert("Interview responses submitted successfully! AI is analyzing your results.");
      setActiveInterview(null);
      loadInterviews();
    } catch (e) {
      console.error(e);
      alert("Error submitting interview.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading Interviews...</div>;

  // Render Interview simulator for Employees
  if (activeInterview) {
    const currentQ = activeInterview.questions[currentQuestionIndex];
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">AI Interview Simulator</span>
          <span className="text-xs font-semibold text-slate-400">Question {currentQuestionIndex + 1} of {activeInterview.questions.length}</span>
        </div>

        <div className="space-y-4">
          <span className="inline-block px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 text-xs font-bold uppercase">
            {currentQ.type} Question
          </span>
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-150 leading-relaxed pr-4">
              {currentQ.q}
            </h3>
            <button 
              onClick={() => handleSpeakQuestion(currentQ.q)}
              className="p-2 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              title="Listen to Question"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Answer (Type or transcribe)</label>
            <button 
              onClick={toggleRecording}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isRecording 
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isRecording ? (
                <><MicOff className="h-3.5 w-3.5 mr-1.5 animate-pulse" /> Stop Recording</>
              ) : (
                <><Mic className="h-3.5 w-3.5 mr-1.5" /> Start Speech Input</>
              )}
            </button>
          </div>
          <textarea
            value={responses[currentQuestionIndex] || ''}
            onChange={(e) => handleResponseChange(currentQuestionIndex, e.target.value)}
            rows="6"
            placeholder="Explain in detail your experience and technical details..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Tip: Structure your response using STAR method (Situation, Task, Action, Result).</span>
            <button
              onClick={() => generateAutoMockResponse(currentQ.q)}
              className="text-indigo-500 hover:text-indigo-600 font-semibold flex items-center cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" /> Use AI Speech Mock
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
          >
            Previous Question
          </button>

          {currentQuestionIndex < activeInterview.questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold cursor-pointer"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleSubmitInterview}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Interview'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Interviews List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-slate-850 dark:text-slate-150">Active Candidate Interviews</h3>
          <span className="text-xs font-semibold text-slate-500">{interviews.length} Scheduled total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/20 dark:bg-slate-900/10">
                <th className="p-4">Applicant ID / Reference</th>
                <th className="p-4">Scheduled Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">AI Score Card</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {interviews.map(int => (
                <tr key={int._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Application Reference</div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">#{int.application_id}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-700 dark:text-slate-350">{new Date(int.scheduled_at).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{new Date(int.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                      int.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {int.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {int.status === 'Completed' ? (
                      <div className="text-xs space-y-0.5">
                        <div>Comm: <strong className="text-indigo-650 dark:text-indigo-400">{int.communication_score}%</strong></div>
                        <div>Conf: <strong className="text-indigo-650 dark:text-indigo-400">{int.confidence_score}%</strong></div>
                        <div>Sentiment: <strong className="capitalize">{int.overall_sentiment.toLowerCase()}</strong></div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Awaiting completion</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {int.status === 'Completed' ? (
                      <button
                        onClick={() => setSelectedCompletedInt(int)}
                        className="px-3 py-1.5 rounded-lg border border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-xs font-semibold flex items-center inline-flex cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" /> View Report
                      </button>
                    ) : (
                      user.role === 'Employee' ? (
                        <button
                          onClick={() => startInterview(int)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center inline-flex cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 mr-1" /> Start Simulation
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Waiting for candidate</span>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {interviews.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">No scheduled interviews. Set up a schedule from the Candidates Pipeline Board.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Interview Feedback Report Modal */}
      {selectedCompletedInt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative overflow-y-auto max-h-[90vh] no-scrollbar">
            <button 
              onClick={() => setSelectedCompletedInt(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-655"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-2 mb-6">
              <Award className="h-5 w-5 text-indigo-500" />
              <h3 className="text-xl font-bold text-slate-850 dark:text-slate-150">AI Interview Feedback Report</h3>
            </div>

            <div className="space-y-6">
              {/* Score panel */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Communication</div>
                  <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{selectedCompletedInt.communication_score}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Confidence</div>
                  <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{selectedCompletedInt.confidence_score}%</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Sentiment</div>
                  <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 capitalize">{selectedCompletedInt.overall_sentiment.toLowerCase()}</div>
                </div>
              </div>

              {/* Feedback Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI feedback evaluation</h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-250 dark:border-slate-800 rounded-xl text-sm leading-relaxed text-slate-650 dark:text-slate-350">
                  {selectedCompletedInt.feedback_summary}
                </div>
              </div>

              {/* QA List */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interview Transcripts</h4>
                <div className="space-y-4">
                  {selectedCompletedInt.responses.map((resp, i) => (
                    <div key={i} className="space-y-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                      <div className="font-semibold text-sm text-slate-800 dark:text-slate-150">Q: {resp.q}</div>
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                        A: "{resp.transcript}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
