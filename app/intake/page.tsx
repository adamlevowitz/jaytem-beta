'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function IntakePage() {
  const router = useRouter();
  const [organization, setOrganization] = useState('');
  const [clientInfo, setClientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    primaryLanguage: 'English',
    secondaryLanguage: '',
  });
  const [clientStory, setClientStory] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem('jt_user');
    if (user) {
      const parsed = JSON.parse(user);
      setOrganization(parsed.organization || '');
    }
  }, []);

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date().toISOString();
    const sessionId = crypto.randomUUID();

    // Save acknowledgment proof to Supabase
    await supabase.from('jt_acknowledgments').insert({
      session_id: sessionId,
      client_email: clientInfo.email,
      client_name: `${clientInfo.firstName} ${clientInfo.lastName}`,
      organization: organization,
      acknowledged_at: now,
    });

    const sessionData = {
      sessionId,
      clientInfo,
      clientStory,
      organization,
      acknowledgedAt: now,
      createdAt: now,
      aiResponses: {},
    };

    sessionStorage.setItem('jt_session_data', JSON.stringify(sessionData));
    router.push('/evaluation');
  };

  return (
    <div className="min-h-screen bg-[#1e1060]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {organization || 'Loading...'}
            </h1>
            <p className="text-black text-lg">Client Intake</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={clientInfo.firstName}
                  onChange={(e) => setClientInfo({ ...clientInfo, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={clientInfo.lastName}
                  onChange={(e) => setClientInfo({ ...clientInfo, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Language *
                </label>
                <input
                  type="text"
                  value={clientInfo.primaryLanguage}
                  onChange={(e) => setClientInfo({ ...clientInfo, primaryLanguage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Language
                </label>
                <input
                  type="text"
                  value={clientInfo.secondaryLanguage}
                  onChange={(e) => setClientInfo({ ...clientInfo, secondaryLanguage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Client Story */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Story *
              </label>
              <textarea
                value={clientStory}
                onChange={(e) => setClientStory(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the legal issue in detail (copy and paste in any language)..."
                required
              />
            </div>

            {/* Disclaimer Acknowledgment */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acknowledge"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1e1060] focus:ring-[#1e1060]"
                required
              />
              <label htmlFor="acknowledge" className="text-sm text-gray-600">
                I understand that submitting this form does not create an attorney-client relationship.
  This information will be processed using Microsoft Azure AI services and is not stored or retained after your session ends.
  This does not constitute legal advice. All matters require review by a licensed attorney. <span className="text-red-500">*</span>
 </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#1e1060] text-white py-3 px-8 rounded-md hover:bg-[#2d1a8f] transition-colors font-medium"
              >
                Submit Intake
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}