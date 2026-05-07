import { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Shield, 
  Zap, 
  MessageSquare, 
  Save, 
  RotateCcw,
  AlertTriangle,
  Globe,
  Lock
} from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('ai')
  const [aiSettings, setAiSettings] = useState({
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    systemPrompt: 'You are a professional medical assistant specialized in Indian healthcare...',
    maxTokens: 2000,
    temperature: 0.2,
    fallbackEnabled: true
  })

  const [securitySettings, setSecuritySettings] = useState({
    adminEmails: 'admin@medcore.com, support@medcore.com',
    twoFactor: true,
    sessionTimeout: 60,
    maxFailedLogins: 5
  })

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Admin Settings</h1>
        <p className="text-sm font-semibold text-slate-500">Configure global AI parameters, security protocols, and system behavior.</p>
      </header>

      <div className="flex gap-8">
        <div className="w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
              activeTab === 'ai' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Cpu size={18} />
            <span>AI Configuration</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
              activeTab === 'security' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shield size={18} />
            <span>Security & Access</span>
          </button>
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
              activeTab === 'general' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe size={18} />
            <span>General Settings</span>
          </button>
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === 'ai' && (
            <div className="panel-surface p-8 space-y-8">
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="rounded-xl bg-red-50 p-2 text-red-600 dark:bg-red-900/20">
                    <Zap size={20} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">LLM Provider Settings</h3>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="field-block">
                    <label className="field-label">Active Provider</label>
                    <select 
                      className="field-select"
                      value={aiSettings.provider}
                      onChange={e => setAiSettings({...aiSettings, provider: e.target.value})}
                    >
                      <option value="gemini">Google Gemini (Recommended)</option>
                      <option value="grok">xAI Grok-3</option>
                      <option value="openai">OpenAI GPT-4o</option>
                    </select>
                  </div>
                  <div className="field-block">
                    <label className="field-label">Preferred Model</label>
                    <select 
                      className="field-select"
                      value={aiSettings.model}
                      onChange={e => setAiSettings({...aiSettings, model: e.target.value})}
                    >
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="grok-3-mini">Grok-3 Mini</option>
                    </select>
                  </div>
                </div>

                <div className="field-block">
                  <label className="field-label">System Prompt</label>
                  <div className="field-input min-h-[120px] items-start">
                    <textarea 
                      className="w-full border-0 bg-transparent text-sm font-medium outline-none"
                      rows={5}
                      value={aiSettings.systemPrompt}
                      onChange={e => setAiSettings({...aiSettings, systemPrompt: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                   <div className="field-block">
                    <label className="field-label">Max Output Tokens</label>
                    <div className="field-input">
                      <input 
                        type="number" 
                        value={aiSettings.maxTokens}
                        onChange={e => setAiSettings({...aiSettings, maxTokens: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="field-block">
                    <label className="field-label">Temperature</label>
                    <div className="field-input">
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={aiSettings.temperature}
                        onChange={e => setAiSettings({...aiSettings, temperature: parseFloat(e.target.value)})}
                      />
                      <span className="text-xs font-black w-8">{aiSettings.temperature}</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex items-center gap-3 rounded-2xl bg-orange-50 p-4 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                <AlertTriangle size={18} />
                <p className="text-xs font-bold">Changing these values will affect all global AI responses immediately.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="primary-button px-8">
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
                <button className="secondary-button px-8">
                  <RotateCcw size={18} />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="panel-surface p-8 space-y-8">
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="rounded-xl bg-red-50 p-2 text-red-600 dark:bg-red-900/20">
                    <Lock size={20} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Access Control</h3>
                </div>

                <div className="field-block">
                  <label className="field-label">Admin Emails (Comma separated)</label>
                  <div className="field-input">
                    <input 
                      value={securitySettings.adminEmails}
                      onChange={e => setSecuritySettings({...securitySettings, adminEmails: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="field-block">
                    <label className="field-label">Session Timeout (Minutes)</label>
                    <div className="field-input">
                      <input 
                        type="number" 
                        value={securitySettings.sessionTimeout}
                        onChange={e => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="field-block">
                    <label className="field-label">Max Failed Logins</label>
                    <div className="field-input">
                      <input 
                        type="number" 
                        value={securitySettings.maxFailedLogins}
                        onChange={e => setSecuritySettings({...securitySettings, maxFailedLogins: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-6 dark:bg-slate-900/60">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">Two-Factor Authentication</p>
                        <p className="text-xs font-semibold text-slate-500">Require 2FA for all admin accounts</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setSecuritySettings({...securitySettings, twoFactor: !securitySettings.twoFactor})}
                    className={`relative h-6 w-11 rounded-full transition-colors ${securitySettings.twoFactor ? 'bg-green-500' : 'bg-slate-300'}`}
                   >
                     <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${securitySettings.twoFactor ? 'left-6' : 'left-1'}`} />
                   </button>
                </div>
              </section>

              <div className="flex gap-3 pt-4">
                <button className="primary-button px-8">
                  <Save size={18} />
                  <span>Save Security Policy</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
