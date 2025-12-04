'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Prompts {
  alphaPersona: string;
  alpha01: string;
  alpha02: string;
  betaPersona: string;
  beta01: string;
  beta02: string;
  kayceePersona: string;
  kaycee01: string;
  kaycee02: string;
}

interface User {
  email: string;
  organization: string;
  role: string;
}

const defaultPrompts: Prompts = {
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

export default function AdminPage() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [prompts, setPrompts] = useState<Prompts>(defaultPrompts);
  const [activeTab, setActiveTab] = useState<'alpha' | 'beta' | 'kaycee' | 'users'>('alpha');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', organization: '', role: 'user' });
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    if (isAuthed) {
      loadPrompts();
      loadUsers();
    }
  }, [isAuthed]);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const { data: dbRow, error } = await supabase
        .from('jt_prompts')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.error('Load error details:', error);
        throw error;
      }

      if (dbRow?.data) {
        setPrompts(dbRow.data);
      }
    } catch (error: any) {
      console.error('Error loading prompts:', error);
      alert(`Failed to load prompts: ${error.message || 'Unknown error'}`);
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleLogin = () => {
    if (adminPassword === '0000') {
      setIsAuthed(true);
    } else {
      alert('Invalid admin password');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('jt_prompts')
        .upsert({
          id: 1,
          data: prompts,
        }, {
          onConflict: 'id',
        });

      if (error) {
        console.error('Save error details:', error);
        throw error;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error: any) {
      console.error('Error saving prompts:', error);
      alert(`Failed to save prompts: ${error.message || 'Unknown error'}`);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (confirm('Reset all prompts to empty? This will clear all current prompts in the database.')) {
      setPrompts(defaultPrompts);
    }
  };

  const updatePrompt = (key: keyof Prompts, value: string) => {
    setPrompts({ ...prompts, [key]: value });
  };

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.organization) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to add user');
        return;
      }

      setNewUser({ email: '', password: '', organization: '', role: 'user' });
      loadUsers();
    } catch (error) {
      alert('Failed to add user');
    }
  };

  const handleUpdatePassword = async (email: string) => {
    if (!editPassword) {
      alert('Please enter a new password');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: editPassword }),
      });

      if (!res.ok) {
        alert('Failed to update password');
        return;
      }

      setEditingUser(null);
      setEditPassword('');
      alert('Password updated');
    } catch (error) {
      alert('Failed to update password');
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`Delete user ${email}?`)) return;

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        alert('Failed to delete user');
        return;
      }

      loadUsers();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Admin Access
          </h1>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Admin Password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  if (loading && !prompts.alphaPersona) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading prompts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Administration</h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/intake')}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back to App
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setActiveTab('alpha')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'alpha'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Alpha (Plaintiff)
            </button>
            <button
              onClick={() => setActiveTab('beta')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'beta'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Beta (Defense)
            </button>
            <button
              onClick={() => setActiveTab('kaycee')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'kaycee'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Kaycee (Final)
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'users'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Add New User */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium text-gray-800 mb-4">Add New User</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Email *"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Password *"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Organization *"
                    value={newUser.organization}
                    onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  onClick={handleAddUser}
                  className="mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add User
                </button>
              </div>

              {/* User List */}
              <div>
                <h3 className="font-medium text-gray-800 mb-4">Current Users</h3>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.email} className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                      <div>
                        <p className="font-medium text-gray-800">{user.email}</p>
                        <p className="text-sm text-gray-500">{user.organization} • {user.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingUser === user.email ? (
                          <>
                            <input
                              type="password"
                              placeholder="New password"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <button
                              onClick={() => handleUpdatePassword(user.email)}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingUser(null); setEditPassword(''); }}
                              className="text-gray-500 hover:text-gray-700 text-sm"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUser(user.email)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Change Password
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.email)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Alpha Prompts */}
          {activeTab === 'alpha' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-md mb-6 text-sm text-blue-800">
                <strong>Workflow:</strong> Alpha (Plaintiff Analysis) → Beta (Defense Counter-Analysis) → Kaycee (Plaintiff Rewrite with Defense Knowledge)
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alpha Persona (Plaintiff Attorney Role)
                </label>
                <textarea
                  value={prompts.alphaPersona}
                  onChange={(e) => updatePrompt('alphaPersona', e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alpha 01 (Initial Case Evaluation)
                </label>
                <textarea
                  value={prompts.alpha01}
                  onChange={(e) => updatePrompt('alpha01', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alpha 02 (Draft Complaint)
                </label>
                <textarea
                  value={prompts.alpha02}
                  onChange={(e) => updatePrompt('alpha02', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Beta Prompts */}
          {activeTab === 'beta' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beta Persona (Defense Attorney Role)
                </label>
                <textarea
                  value={prompts.betaPersona}
                  onChange={(e) => updatePrompt('betaPersona', e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beta 01 (Defense Analysis)
                </label>
                <textarea
                  value={prompts.beta01}
                  onChange={(e) => updatePrompt('beta01', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beta 02 (Defense Strategy Document)
                </label>
                <textarea
                  value={prompts.beta02}
                  onChange={(e) => updatePrompt('beta02', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Kaycee Prompts */}
          {activeTab === 'kaycee' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kaycee Persona (Senior Plaintiff Strategist)
                </label>
                <textarea
                  value={prompts.kayceePersona}
                  onChange={(e) => updatePrompt('kayceePersona', e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kaycee 01 (Strengthened Plaintiff Strategy)
                </label>
                <textarea
                  value={prompts.kaycee01}
                  onChange={(e) => updatePrompt('kaycee01', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kaycee 02 (Final Enhanced Complaint & Roadmap)
                </label>
                <textarea
                  value={prompts.kaycee02}
                  onChange={(e) => updatePrompt('kaycee02', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Action Buttons (hide for users tab) */}
          {activeTab !== 'users' && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <button
                onClick={handleReset}
                className="bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200 transition-colors"
              >
                Reset to Empty
              </button>
              <div className="flex items-center gap-4">
                {saved && <span className="text-green-600 font-medium">Saved!</span>}
                <button
                  onClick={loadPrompts}
                  disabled={loading}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Reload from DB'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save to DB'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}