'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { pdf } from '@react-pdf/renderer';
import { supabase } from '@/lib/supabase';
import EvaluationPDF from '@/components/EvaluationPDF';
import ReactMarkdown from 'react-markdown';

interface SessionData {
  sessionId: string;
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
  acknowledgedAt?: string;
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
  const [expandedSections, setExpandedSections] = useState<string[]>(['assessment', 'strategy']);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [organization, setOrganization] = useState('');
  const cancelledRef = useRef(false);

  useEffect(() => {
    const user = sessionStorage.getItem('jt_user');
    if (user) {
      const parsed = JSON.parse(user);
      setOrganization(parsed.organization || '');
    }

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
      const { data: dbRow } = await supabase.from('jt_prompts').select('*').eq('id', 1).single();
      const prompts = dbRow?.data ?? defaultPrompts;

      const steps = [
        { key: 'alpha01', label: 'Analyzing case viability...' },
        { key: 'alpha02', label: 'Developing initial strategy...' },
        { key: 'beta01', label: 'Stress-testing defenses...' },
        { key: 'beta02', label: 'Evaluating counter-strategies...' },
        { key: 'kaycee01', label: 'Finalizing case assessment...' },
        { key: 'kaycee02', label: 'Preparing battle plan...' },
      ];

      for (const step of steps) {
        if (cancelledRef.current) {
          setIsLoading(false);
          sessionStorage.removeItem('jt_session_data');
          return;
        }

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

  const handleCancel = () => {
    cancelledRef.current = true;
    setCurrentStep('Cancelling...');
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleNewEvaluation = () => {
    sessionStorage.removeItem('jt_session_data');
    router.push('/intake');
  };

  const handleClearClientInfo = () => {
    sessionStorage.removeItem('jt_session_data');
    setSessionData(null);
    router.push('/intake');
  };

  const handleDownloadPDF = async () => {
    if (!sessionData) return;

    const blob = await pdf(
      <EvaluationPDF
        clientInfo={sessionData.clientInfo}
        clientStory={sessionData.clientStory}
        aiResponses={sessionData.aiResponses}
        createdAt={sessionData.createdAt}
        organization={organization}
        acknowledgedAt={sessionData.acknowledgedAt}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sessionData.clientInfo.lastName}_${sessionData.clientInfo.firstName}_Evaluation.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    sessionStorage.removeItem('jt_session_data');
    setIsDownloaded(true);
  };

  const MarkdownContent = ({ content }: { content: string }) => (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0" {...props} />,
        h2: ({ node, ...props }) => <h4 className="text-lg font-bold text-gray-800 mt-5 mb-2" {...props} />,
        h3: ({ node, ...props }) => <h5 className="text-base font-semibold text-gray-800 mt-4 mb-2" {...props} />,
        p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed mb-3" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 space-y-1 mb-4 text-gray-700" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 space-y-1 mb-4 text-gray-700" {...props} />,
        li: ({ node, ...props }) => <li className="pl-2" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-[#1e1060] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Letterhead */}
          <div className="bg-gradient-to-r from-[#1e1060] to-[#2d1a8f] text-white px-8 py-6">
            <h1 className="text-3xl font-bold mb-1">{organization || 'Loading...'}</h1>
            <p className="text-blue-100 text-sm">Case Evaluation & Strategic Analysis</p>
          </div>

          {/* Client Info Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-8 py-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Client</p>
                <p className="font-semibold text-gray-900">
                  {sessionData.clientInfo.firstName} {sessionData.clientInfo.lastName}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Date Prepared</p>
                <p className="font-semibold text-gray-900">{formatDate(sessionData.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Email</p>
                <p className="font-semibold text-gray-900">{sessionData.clientInfo.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Phone</p>
                <p className="font-semibold text-gray-900">{sessionData.clientInfo.phone}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Primary Language</p>
                <p className="font-semibold text-gray-900">{sessionData.clientInfo.primaryLanguage}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Secondary Language</p>
                <p className="font-semibold text-gray-900">{sessionData.clientInfo.secondaryLanguage || 'N/A'}</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20 px-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1e1060] mx-auto mb-6"></div>
              <p className="text-xl text-gray-700 font-medium mb-2">{currentStep}</p>
              <p className="text-gray-500 mb-6">This comprehensive analysis may take several minutes...</p>
              <button
                onClick={handleCancel}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Cancel Evaluation
              </button>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-20 px-8">
              <p className="text-xl font-semibold mb-2">Analysis Failed</p>
              <p>{error}</p>
            </div>
          ) : (
            <div className="px-8 py-8">
              {/* Case Assessment */}
              <section className="mb-10">
                <button
                  onClick={() => toggleSection('assessment')}
                  className="w-full flex items-center justify-between text-left mb-4 pb-2 border-b-2 border-[#1e1060]"
                >
                  <h2 className="text-2xl font-bold text-gray-900">Case Assessment</h2>
                  <span className="text-2xl text-[#1e1060]">
                    {expandedSections.includes('assessment') ? '−' : '+'}
                  </span>
                </button>
                {expandedSections.includes('assessment') && (
                  <div className="prose prose-sm max-w-none">
                    <MarkdownContent content={sessionData.aiResponses.kaycee01 || ''} />
                  </div>
                )}
              </section>

              {/* Strategic Action Plan */}
              <section className="mb-10">
                <button
                  onClick={() => toggleSection('strategy')}
                  className="w-full flex items-center justify-between text-left mb-4 pb-2 border-b-2 border-[#1e1060]"
                >
                  <h2 className="text-2xl font-bold text-gray-900">Strategic Action Plan</h2>
                  <span className="text-2xl text-[#1e1060]">
                    {expandedSections.includes('strategy') ? '−' : '+'}
                  </span>
                </button>
                {expandedSections.includes('strategy') && (
                  <div className="prose prose-sm max-w-none">
                    <MarkdownContent content={sessionData.aiResponses.kaycee02 || ''} />
                  </div>
                )}
              </section>

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-gray-300">
                <p className="text-xs text-gray-500 italic text-center mb-2">
                  Confidential Attorney Work Product — Prepared by {organization}
                </p>
                <p className="text-xs text-gray-400 text-center">
                  This document was generated using Microsoft Azure AI services. Client data is not stored or retained after the session ends.
                  This does not constitute legal advice. All information should be reviewed by a licensed attorney before any action is taken.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isLoading && !error && (
            <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-between items-center">
              <div className="flex gap-4">
                <button
                  onClick={handleNewEvaluation}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  ← New Evaluation
                </button>
                <button
                  onClick={handleClearClientInfo}
                  className="text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Clear Client Info
                </button>
              </div>
              {isDownloaded ? (
                <span className="text-green-600 font-medium">✓ Downloaded — session cleared</span>
              ) : (
                <button
                  onClick={handleDownloadPDF}
                  className="bg-[#1e1060] text-white py-3 px-8 rounded-md hover:bg-[#2d1a8f] transition-colors font-medium shadow-lg"
                >
                  Download PDF Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}