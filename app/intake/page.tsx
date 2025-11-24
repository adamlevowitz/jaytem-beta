'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function IntakePage() {
  const router = useRouter();
  const [clientType, setClientType] = useState('individual');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    primaryLanguage: 'English',
    secondaryLanguage: '',
    clientStory: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languages = [
    'English', 'Spanish', 'French', 'Portuguese', 'Chinese', 
    'Arabic', 'Russian', 'Japanese', 'Korean', 'German'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.clientStory || !formData.firstName) {
      alert('Please enter client name and story');
      return;
    }

    setIsSubmitting(true);

    // Store form data in sessionStorage for the evaluation page
    const sessionData = {
      sessionId: crypto.randomUUID(),
      clientType,
      clientInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        primaryLanguage: formData.primaryLanguage,
        secondaryLanguage: formData.secondaryLanguage,
      },
      clientStory: formData.clientStory,
      createdAt: new Date().toISOString(),
      aiResponses: {},
    };

    sessionStorage.setItem('jt_session_data', JSON.stringify(sessionData));
    router.push('/evaluation');
  };

  return (
    <div className="min-h-screen bg-[#1e1060]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-blue-600 text-lg mb-6">Client Intake</h1>
          <hr className="mb-6" />

          {/* Client Type */}
          <div className="mb-6">
            <label className="flex items-center mb-2">
              <input
                type="radio"
                name="clientType"
                value="individual"
                checked={clientType === 'individual'}
                onChange={(e) => setClientType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-700">Individual</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="clientType"
                value="corporate"
                checked={clientType === 'corporate'}
                onChange={(e) => setClientType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-700">Corporate</span>
            </label>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <label className="block text-sm font-bold text-gray-700 mb-1 mt-4">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <label className="block text-sm font-bold text-gray-700 mb-1 mt-4">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Primary Language</label>
              <select
                name="primaryLanguage"
                value={formData.primaryLanguage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              
              <label className="block text-sm font-bold text-gray-700 mb-1 mt-4">Secondary Language</label>
              <select
                name="secondaryLanguage"
                value={formData.secondaryLanguage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Client Story */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-1">
              Enter the client's account in their own words. Text may be provided in any language — simply paste it in.
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="clientStory"
              value={formData.clientStory}
              onChange={handleChange}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.clientStory || !formData.firstName}
              className="bg-[#7c8db5] text-white py-3 px-12 rounded-md hover:bg-[#6b7ca4] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
