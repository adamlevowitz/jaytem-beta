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
    persona?: string;
    caseAnalysis?: string;
    caseStrategy?: string;
  };
}

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

    // If we already have AI responses, don't re-run
    if (data.aiResponses?.persona) {
      setIsLoading(false);
      return;
    }

    // Run AI evaluation
    runEvaluation(data);
  }, [router]);

  const runEvaluation = async (data: SessionData) => {
    try {
      setCurrentStep('Generating Persona...');
      const personaRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'persona',
          clientStory: data.clientStory,
          clientInfo: data.clientInfo,
        }),
      });
      const personaData = await personaRes.json();
      data.aiResponses.persona = personaData.result;
      updateSession(data);

      setCurrentStep('Analyzing Case...');
      const analysisRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'analysis',
          clientStory: data.clientStory,
          clientInfo: data.clientInfo,
          previousResponses: { persona: data.aiResponses.persona },
        }),
      });
      const analysisData = await analysisRes.json();
      data.aiResponses.caseAnalysis = analysisData.result;
      updateSession(data);

      setCurrentStep('Developing Strategy...');
      const strategyRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'strategy',
          clientStory: data.clientStory,
          clientInfo: data.clientInfo,
          previousResponses: {
            persona: data.aiResponses.persona,
            caseAnalysis: data.aiResponses.caseAnalysis,
          },
        }),
      });
      const strategyData = await strategyRes.json();
      data.aiResponses.caseStrategy = strategyData.result;
      updateSession(data);

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
    return <div className="min-h-screen bg-[#1e1060] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#1e1060]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-gray-500 text-sm mb-2">Container title</p>
          <hr className="mb-6" />

          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Marshall, Ginsburg & Motley LLP<br />Case Evaluation
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
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-12">{error}</div>
          ) : (
            <>
              {/* Client Story */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Client Story</h2>
                <hr className="mb-4" />
                <div className="text-gray-700 whitespace-pre-wrap">{sessionData.clientStory}</div>
              </section>

              {/* Jaytem Persona */}
              <section className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-2">JAYTEM</h2>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Jaytem Persona</h3>
                <div className="text-gray-700 whitespace-pre-wrap">{sessionData.aiResponses.persona}</div>
              </section>

              {/* Case Analysis */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Case Analysis</h3>
                <div className="text-gray-700 whitespace-pre-wrap">{sessionData.aiResponses.caseAnalysis}</div>
              </section>

              {/* Case Strategy */}
              <section className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Case Strategy</h3>
                <div className="text-gray-700 whitespace-pre-wrap">{sessionData.aiResponses.caseStrategy}</div>
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