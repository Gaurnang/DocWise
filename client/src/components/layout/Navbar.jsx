import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ saveStatus = 'idle', onToggleSidebar, title = 'Workspace' }) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  
  const statusConfig = {
    saving: { label: 'Saving...', icon: '⏳', color: 'text-orange-600' },
    saved: { label: 'All changes saved', icon: '✓', color: 'text-green-600' },
    live: { label: 'Synced in real-time', icon: '●', color: 'text-green-600' },
    error: { label: 'Failed to save', icon: '✕', color: 'text-red-600' },
    idle: { label: '', icon: '', color: '' },
  };

  const status = statusConfig[saveStatus] || statusConfig.idle;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
              ✎
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Docwise</h1>
              <p className="text-xs text-slate-500">Collaborative Editor</p>
            </div>
          </div>
        </div>

        {/* Center: Current document title */}
        {title && title !== 'Workspace' && (
          <div className="hidden md:flex items-center gap-2 flex-1 mx-8">
            <div className="flex-1 text-center">
              <h2 className="text-sm font-medium text-slate-700 truncate">{title}</h2>
            </div>
          </div>
        )}

        {/* Right: Status and Settings */}
        <div className="flex items-center gap-6">
          {/* Save status */}
          {status.label && (
            <div className={`flex items-center gap-2 text-sm font-medium ${status.color}`}>
              <span className={`text-lg ${status.icon === '⏳' ? 'animate-pulse' : ''}`}>{status.icon}</span>
              <span className="hidden sm:inline">{status.label}</span>
            </div>
          )}

          {/* Collaborators */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 cursor-pointer group">
              {[
                { initials: 'JD', bg: 'bg-blue-500' },
                { initials: 'AK', bg: 'bg-purple-500' },
                { initials: 'NP', bg: 'bg-pink-500' },
              ].map((u) => (
                <div
                  key={u.initials}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white ${u.bg} text-white text-xs font-semibold shadow-md transition-transform group-hover:scale-110`}
                  title={u.initials}
                >
                  {u.initials[0]}
                </div>
              ))}
              <button className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200">
                +
              </button>
            </div>
          </div>

          {/* Settings dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white border border-slate-200 shadow-lg py-2 animate-slideInRight">
                <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700">
                  📋 Share Document
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700">
                  🔒 Permissions
                </button>
                <div className="border-t border-slate-200 my-2" />
                <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700">
                  ⚙️ Settings
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700">
                  ℹ️ Help & Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

