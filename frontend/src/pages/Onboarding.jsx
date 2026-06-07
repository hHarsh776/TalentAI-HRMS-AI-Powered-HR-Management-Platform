import React, { useEffect, useState } from 'react';
import { request } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Sparkles, FileText, CheckCircle, FileUp, X, Check } from 'lucide-react';

export default function Onboarding() {
  const { user } = useAuth();
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOfferText, setActiveOfferText] = useState('');
  const [activeOnbId, setActiveOnbId] = useState(null);

  useEffect(() => {
    loadOnboardings();
  }, []);

  const loadOnboardings = async () => {
    try {
      const data = await request('/onboarding');
      setOnboardings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOffer = async (onbId) => {
    try {
      const res = await request(`/onboarding/${onbId}/generate-offer`, {
        method: 'POST'
      });
      setActiveOfferText(res.offer_letter_text);
      setActiveOnbId(onbId);
      loadOnboardings();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleChecklist = async (onb, taskIdx) => {
    const updatedChecklist = onb.checklist.map((item, idx) => {
      if (idx === taskIdx) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    try {
      await request(`/onboarding/${onb._id}`, {
        method: 'PUT',
        body: JSON.stringify({ checklist: updatedChecklist })
      });
      loadOnboardings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadDocument = async (onb, docIdx) => {
    const updatedDocs = onb.documents.map((item, idx) => {
      if (idx === docIdx) {
        return { ...item, status: 'Uploaded' };
      }
      return item;
    });

    try {
      await request(`/onboarding/${onb._id}`, {
        method: 'PUT',
        body: JSON.stringify({ documents: updatedDocs })
      });
      alert(`Document uploaded successfully! Status set to pending verification.`);
      loadOnboardings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyDocument = async (onb, docIdx) => {
    const updatedDocs = onb.documents.map((item, idx) => {
      if (idx === docIdx) {
        return { ...item, status: 'Verified' };
      }
      return item;
    });

    try {
      await request(`/onboarding/${onb._id}`, {
        method: 'PUT',
        body: JSON.stringify({ documents: updatedDocs })
      });
      loadOnboardings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignOfferLetterEmployee = async (onb) => {
    const updatedChecklist = onb.checklist.map(item => {
      if (item.task === 'Sign Offer Letter') {
        return { ...item, completed: true };
      }
      return item;
    });

    try {
      await request(`/onboarding/${onb._id}`, {
        method: 'PUT',
        body: JSON.stringify({ checklist: updatedChecklist })
      });
      alert("Offer letter signed and accepted!");
      loadOnboardings();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Loading Onboarding portals...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {onboardings.map((onb) => (
        <div key={onb._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome Aboard{onb.candidate_name ? `, ${onb.candidate_name}` : ''}!</h2>
            <p className="text-indigo-100 text-sm">Let's get you set up for your new role{onb.job_title ? `: ${onb.job_title}` : ` (App #${onb.application_id})`}</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Action Item 1: Offer Letter */}
            <div className="flex items-start space-x-4">
              <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${onb.offer_letter_text ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {onb.offer_letter_text ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Sign Offer Letter</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Review and sign your digital employment agreement.</p>
                {onb.offer_letter_text || onb.offer_letter_url ? (
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        setActiveOfferText(onb.offer_letter_text || "Standard offer text. Position: Software Developer.");
                        setActiveOnbId(onb._id);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 text-sm font-semibold cursor-pointer"
                    >
                      Read Offer Letter
                    </button>
                    {user.role === 'Employee' && !onb.checklist.find(i => i.task === 'Sign Offer Letter')?.completed && (
                      <button
                        onClick={() => handleSignOfferLetterEmployee(onb)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md cursor-pointer"
                      >
                        Accept & Sign
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    {user.role !== 'Employee' ? (
                      <button
                        onClick={() => handleGenerateOffer(onb._id)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md flex items-center cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4 mr-2 animate-pulse" /> Generate AI Offer Letter
                      </button>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Pending HR Generation...</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Action Item 2: Document Verification */}
            <div className="flex items-start space-x-4">
              <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${onb.documents.every(d => d.status === 'Verified') ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {onb.documents.every(d => d.status === 'Verified') ? <Check className="w-5 h-5" /> : '2'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Upload Required Documents</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Please provide identity and background check documents.</p>
                <div className="space-y-3">
                  {onb.documents.filter(doc => doc.name !== "Passport/ID Card").map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="font-semibold text-slate-700 dark:text-slate-200">{doc.name}</div>
                        <div className={`text-xs mt-1 font-medium ${doc.status === 'Verified' ? 'text-emerald-500' : (doc.status === 'Uploaded' ? 'text-indigo-500' : 'text-slate-500')}`}>
                          Status: {doc.status}
                        </div>
                      </div>
                      
                      {doc.status === 'Pending' && (
                        <label className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center cursor-pointer transition-colors relative overflow-hidden">
                          <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                // Find the original index in the unfiltered array
                                const originalIdx = onb.documents.findIndex(d => d.name === doc.name);
                                handleUploadDocument(onb, originalIdx);
                              }
                            }}
                          />
                          <FileUp className="h-3.5 w-3.5 mr-1.5" /> Upload File
                        </label>
                      )}
                      
                      {doc.status === 'Uploaded' && (
                        <button
                          onClick={() => {
                            const originalIdx = onb.documents.findIndex(d => d.name === doc.name);
                            handleVerifyDocument(onb, originalIdx);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5 mr-1.5" /> Verify
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {onboardings.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500">
          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No Active Onboarding</h3>
          <p className="mt-2 text-sm text-slate-500">Candidates moved to 'Offered' will automatically appear here.</p>
        </div>
      )}

      {/* Offer Letter Viewer Modal */}
      {activeOfferText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl p-8 shadow-2xl relative">
            <button 
              onClick={() => {
                setActiveOfferText('');
                setActiveOnbId(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-2 mb-6">
              <FileText className="h-6 w-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Employment Agreement</h3>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 max-h-[60vh] overflow-y-auto no-scrollbar">
              <pre className="text-sm font-sans whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                {activeOfferText}
              </pre>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  alert("Offer rejected.");
                  setActiveOfferText('');
                  setActiveOnbId(null);
                }}
                className="px-6 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 text-sm font-bold shadow-sm cursor-pointer transition-colors"
              >
                Reject Offer
              </button>
              <button
                onClick={() => {
                  const matchedOnb = onboardings.find(o => o._id === activeOnbId);
                  if (matchedOnb) handleSignOfferLetterEmployee(matchedOnb);
                  setActiveOfferText('');
                  setActiveOnbId(null);
                }}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md cursor-pointer transition-colors"
              >
                Accept & Sign Agreement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
