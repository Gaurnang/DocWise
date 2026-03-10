function ToolbarButton({ children, title }) {
  return (
    <button
      type="button"
      title={title}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--ink)] transition-colors hover:bg-[var(--hover)]"
    >
      {children}
    </button>
  );
}

function EditorToolbar() {
  return (
    <div className="flex items-center gap-1">
      {/* Normal Text dropdown */}
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--line)] bg-white px-3 text-[13px] text-[var(--ink)] transition-colors hover:bg-[var(--hover)]"
      >
        Normal Text
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2.5 4l2.5 2.5L7.5 4" />
        </svg>
      </button>

      {/* Separator */}
      <div className="mx-1 h-5 w-px bg-[var(--line)]" />

      {/* Formatting icons */}
      <ToolbarButton title="Bold">
        <span className="text-[15px] font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton title="Italic">
        <span className="text-[15px] italic">I</span>
      </ToolbarButton>
      <ToolbarButton title="Underline">
        <span className="text-[15px] underline">T</span>
      </ToolbarButton>
      <ToolbarButton title="Link">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6.5 9.5a3 3 0 004-4.5l-1-1a3 3 0 00-4.24 0L4 5.25" />
          <path d="M9.5 6.5a3 3 0 00-4 4.5l1 1a3 3 0 004.24 0L12 10.75" />
        </svg>
      </ToolbarButton>
      <ToolbarButton title="Users">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <circle cx="6" cy="5" r="2" />
          <path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" />
          <circle cx="11" cy="5.5" r="1.5" />
          <path d="M11 9c1.7 0 3 1.3 3 3" />
        </svg>
      </ToolbarButton>
      <ToolbarButton title="Indent">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 4h12M6 8h8M6 12h8M2 7l2.5 1.5L2 10" />
        </svg>
      </ToolbarButton>
      <ToolbarButton title="Checklist">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <path d="M3.5 4.5l1 1 2-2" />
          <rect x="2" y="9" width="5" height="5" rx="1" />
          <line x1="9" y1="4.5" x2="14" y2="4.5" />
          <line x1="9" y1="11.5" x2="14" y2="11.5" />
        </svg>
      </ToolbarButton>
      <ToolbarButton title="List">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 4h12M2 8h12M2 12h12" />
        </svg>
      </ToolbarButton>
    </div>
  );
}

export default EditorToolbar;

