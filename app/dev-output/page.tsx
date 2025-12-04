'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export default function DevOutputPage() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('jt_session_data');
    if (!stored) {
      router.push('/intake');
      return;
    }
    setSessionData(JSON.parse(stored));
  }, [router]);

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const steps = [
    { key: 'alpha01', name: 'ALPHA 01 - Initial Case Evaluation', color: 'bg-blue-900' },
    { key: 'alpha02', name: 'ALPHA 02 - Draft Complaint', color: 'bg-blue-800' },
    { key: 'beta01', name: 'BETA 01 - Defense Analysis', color: 'bg-red-900' },
    { key: 'beta02', name: 'BETA 02 - Defense Strategy', color: 'bg-red-800' },
    { key: 'kaycee01', name: 'KAYCEE 01 - Strengthened Strategy', color: 'bg-green-900' },
    { key: 'kaycee02', name: 'KAYCEE 02 - Final Enhanced Complaint', color: 'bg-green-800' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🔧 Developer Output Viewer</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/evaluation')}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              View Evaluation
            </button>
            <button
              onClick={() => router.push('/intake')}
              className="bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              New Intake
            </button>
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Client Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-400">Name:</span> {sessionData.clientInfo.firstName} {sessionData.clientInfo.lastName}</div>
            <div><span className="text-gray-400">Email:</span> {sessionData.clientInfo.email}</div>
            <div><span className="text-gray-400">Phone:</span> {sessionData.clientInfo.phone}</div>
            <div><span className="text-gray-400">Language:</span> {sessionData.clientInfo.primaryLanguage}</div>
          </div>
          <div className="mt-4">
            <div className="text-gray-400 mb-2">Client Story:</div>
            <div className="bg-gray-900 p-4 rounded text-sm whitespace-pre-wrap">{sessionData.clientStory}</div>
          </div>
        </div>

        {/* AI Outputs */}
        <div className="space-y-6">
          {steps.map((step) => {
            const output = sessionData.aiResponses[step.key as keyof typeof sessionData.aiResponses];
            
            return (
              <div key={step.key} className="bg-gray-800 rounded-lg overflow-hidden">
                {/* Step Header */}
                <div className={`${step.color} px-6 py-4`}>
                  <h2 className="text-xl font-bold">{step.name}</h2>
                </div>
                
                {/* Output Content */}
                <div className="p-6">
                  {output ? (
                    <div className="space-y-4">
                      {/* Character Count */}
                      <div className="text-xs text-gray-400 flex justify-between items-center border-b border-gray-700 pb-2">
                        <span>Output Length: {output.length.toLocaleString()} characters</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(output);
                            alert('Copied to clipboard!');
                          }}
                          className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white"
                        >
                          Copy
                        </button>
                      </div>
                      
                      {/* Output Text */}
                      <div className="bg-gray-900 p-4 rounded text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                        {output}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">No output yet...</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Export All Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              const allOutputs = steps
                .map((step) => {
                  const output = sessionData.aiResponses[step.key as keyof typeof sessionData.aiResponses];
                  return `${'='.repeat(80)}\n${step.name}\n${'='.repeat(80)}\n\n${output || 'No output'}\n\n`;
                })
                .join('\n');
              
              navigator.clipboard.writeText(allOutputs);
              alert('All outputs copied to clipboard!');
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-md font-medium"
          >
            📋 Copy All Outputs
          </button>
        </div>
      </div>
    </div>
  );
}