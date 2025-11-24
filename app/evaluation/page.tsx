'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pdf } from '@react-pdf/renderer';
import EvaluationPDF from '@/components/EvaluationPDF';

interface SessionData {
  sessionId: string;
  clientType: string;
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    primaryLanguage: string;
    secondaryLanguage: string;
  };
  clientStory: string;
  createdAt: string;
  aiResponses: {
    alpha01?: string;
    alpha02?: string;
    beta01?: string;
    beta02?: string;
    kaycee01?: string;
    kaycee02?: string;
  };
}

const defaultPrompts = {
  alphaPersona: '',
  alpha01: '',
  alpha02: '',
  betaPersona: '',
  beta01: '',
  beta02: '',
  kayceePersona: '',
  kaycee01: '',
  kaycee02: '',
};

export default function EvaluationPage() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('jt_session_data');
    if (!stored) {
      router.push('/intake');
      return;
    }

    const data: SessionData = JSON.parse(stored);
    setSessionData(data);

    if (data.aiResponses?.kaycee02) {
      setIsLoading(false);
      return;
    }

    runEvaluation(data);
  }, [router]);

  const runEvaluation = async (data: SessionData) => {
    try {
      const storedPrompts = localStorage.getItem('jt_prompts');
      const prompts = storedPrompts ? JSON.parse(storedPrompts) : defaultPrompts;

      const steps = [
        { key: 'alpha01', label: 'Alpha: Analyzing case...' },
        { key: 'alpha02', label: 'Alpha: Drafting complaint...' },
        { key: 'beta01', label: 'Beta: Defense analysis...' },
        { key: 'beta02', label: 'Beta: Defense strategy...' },
        { key: 'kaycee01', label: 'Kaycee: Strengthening case...' },
        { key: 'kaycee02', label: 'Kaycee: Final strategy...' },
      ];

      for (const step of steps) {
        setCurrentStep(step.label);

        const res = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: step.key,
            clientStory: data.clientStory,
            clientInfo: data.clientInfo,
            previousResponses: data.aiResponses,
            prompts,
          }),
        });

        const result = await res.json();
        data.aiResponses[step.key as keyof typeof data.aiResponses] = result.result;
        updateSession(data);

        // 3 second delay between calls
        if (step.key !== 'kaycee02') {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      setIsLoading(false);
    } catch (err) {
      setError('Failed to generate evaluation. Please try again.');
      setIsLoading(false);
    }
  };

  const updateSession = (data: SessionData) => {
    sessionStorage.setItem('jt_session_data', JSON.stringify(data));
    setSessionData({ ...data });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-[#1e1060] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1060]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Marshall, Ginsburg & Motley LLP
            <br />
            Case Evaluation
          </h1>

          {/* Client Info */}
          <div className="mb-6 text-gray-700">
            <p><strong>Client:</strong> {sessionData.clientInfo.firstName} {sessionData.clientInfo.lastName}</p>
            <p><strong>Email:</strong> {sessionData.clientInfo.email}</p>
            <p><strong>Phone:</strong> {sessionData.clientInfo.phone}</p>
            <p><strong>Primary Language:</strong> {sessionData.clientInfo.primaryLanguage}</p>
            {sessionData.clientInfo.secondaryLanguage && (
              <p><strong>Secondary Language:</strong> {sessionData.clientInfo.secondaryLanguage}</p>
            )}
            <p><strong>Prepared on:</strong> {formatDate(sessionData.createdAt)}</p>
          </div>

          <hr className="my-6" />

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{currentStep}</p>
              <p className="text-gray-400 text-sm mt-2">This may take a few minutes...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-12">{error}</div>
          ) : (
            <>
              {/* Client Story */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Story</h2>
                <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">{sessionData.clientStory}</div>
              </section>

              {/* Alpha Section */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-blue-800 mb-4">ALPHA - Plaintiff Analysis</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Case Evaluation</h3>
                  <div className="text-gray-700 whitespace-pre-wrap bg-blue-50 p-4 rounded">{sessionData.aiResponses.alpha01}</div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Draft Complaint</h3>
                  <div className="text-gray-700 whitespace-pre-wrap bg-blue-50 p-4 rounded">{sessionData.aiResponses.alpha02}</div>
                </div>
              </section>

              {/* Beta Section */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-red-800 mb-4">BETA - Defense Analysis</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Defense Counter-Analysis</h3>
                  <div className="text-gray-700 whitespace-pre-wrap bg-red-50 p-4 rounded">{sessionData.aiResponses.beta01}</div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Defense Strategy</h3>
                  <div className="text-gray-700 whitespace-pre-wrap bg-red-50 p-4 rounded">{sessionData.aiResponses.beta02}</div>
                </div>
              </section>

              {/* Kaycee Section */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-green-800 mb-4">KAYCEE - Final Plaintiff Strategy</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Strengthened Case Strategy</h3>
                  <div className="text-gray-700 whitespace-pre-wrap bg-green-50 p-4 rounded">{sessionData.aiResponses.kaycee01}</div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Final Enhanced Complaint & Roadmap</h3>
                  <div className="text-gray-700 whitespace-pre-wrap bg-green-50 p-4 rounded">{sessionData.aiResponses.kaycee02}</div>
                </div>
              </section>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={async () => {
                const blob = await pdf(
                  <EvaluationPDF
                    clientInfo={sessionData.clientInfo}
                    clientStory={sessionData.clientStory}
                    aiResponses={sessionData.aiResponses}
                    createdAt={sessionData.createdAt}
                  />
                ).toBlob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${sessionData.clientInfo.lastName}_${sessionData.clientInfo.firstName}_Evaluation.pdf`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('jt_session_data');
                router.push('/intake');
              }}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              New Evaluation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}