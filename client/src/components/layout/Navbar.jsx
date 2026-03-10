function Navbar({ saveStatus = 'idle', onToggleSidebar }) {
  const statusLabels = {
    saving: 'Saving...',
    saved: 'All changes saved',
    live: 'All changes saved',
    idle: '',
  };
  const statusLabel = statusLabels[saveStatus] || '';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-5">
      {/* Left: workspace name */}
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-lg font-bold text-[var(--ink)]">Workspace</span>
      </div>

      {/* Right: save status + collaborator avatars + settings */}
      <div className="flex items-center gap-4">
        {statusLabel && (
          <span className="text-[13px] text-[var(--accent)]">
            {statusLabel}
          </span>
        )}

        {/* Collaborator placeholder avatars */}
        <div className="flex -space-x-2">
          {[
            { initials: 'JD', bg: 'bg-amber-100', text: 'text-amber-700' },
            { initials: 'AK', bg: 'bg-blue-100', text: 'text-blue-700' },
            { initials: 'NP', bg: 'bg-rose-100', text: 'text-rose-700' },
          ].map((u) => (
            <div
              key={u.initials}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white ${u.bg} text-[10px] font-semibold ${u.text}`}
            >
              {u.initials}
            </div>
          ))}
        </div>

        {/* Settings gear */}
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--secondary)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--ink)]"
          aria-label="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="3" />
            <path d="M10 1v2M10 17v2M3.93 3.93l1.41 1.41M14.66 14.66l1.41 1.41M1 10h2M17 10h2M3.93 16.07l1.41-1.41M14.66 5.34l1.41-1.41" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default Navbar;

