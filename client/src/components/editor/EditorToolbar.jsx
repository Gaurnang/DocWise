import { useState } from 'react';

function ToolbarButton({ children, title, onClick, isActive = false }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-500 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95'
      }`}
    >
      {children}
    </button>
  );
}

function EditorToolbar() {
  const [formats, setFormats] = useState({ bold: false, italic: false, underline: false });
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const toggleFormat = (format) => {
    setFormats(prev => ({ ...prev, [format]: !prev[format] }));
  };

  const formatOptions = ['Heading 1', 'Heading 2', 'Paragraph', 'Quote', 'Code'];

  return (
    <div className="flex items-center gap-1 p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex-wrap md:flex-nowrap overflow-x-auto">
      {/* Style dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowFormatMenu(!showFormatMenu)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 font-medium transition-all hover:bg-slate-50 active:scale-95"
        >
          <span>Normal Text</span>
          <svg
            className={`w-4 h-4 transition-transform ${showFormatMenu ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {showFormatMenu && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 animate-slideInLeft">
            {formatOptions.map((option) => (
              <button
                key={option}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                onClick={() => setShowFormatMenu(false)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="mx-1 h-6 w-px bg-slate-300" />

      {/* Text formatting */}
      <ToolbarButton
        title="Bold (Ctrl+B)"
        isActive={formats.bold}
        onClick={() => toggleFormat('bold')}
      >
        <span className="font-bold text-base">B</span>
      </ToolbarButton>

      <ToolbarButton
        title="Italic (Ctrl+I)"
        isActive={formats.italic}
        onClick={() => toggleFormat('italic')}
      >
        <span className="italic text-base">I</span>
      </ToolbarButton>

      <ToolbarButton
        title="Underline (Ctrl+U)"
        isActive={formats.underline}
        onClick={() => toggleFormat('underline')}
      >
        <span className="underline text-base">U</span>
      </ToolbarButton>

      {/* Separator */}
      <div className="mx-1 h-6 w-px bg-slate-300" />

      {/* Advanced formatting */}
      <ToolbarButton title="Link">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </ToolbarButton>

      <ToolbarButton title="Mention">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      </ToolbarButton>

      <ToolbarButton title="List">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </ToolbarButton>

      <ToolbarButton title="Checklist">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </ToolbarButton>

      <ToolbarButton title="Indent">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0H4" />
        </svg>
      </ToolbarButton>

      {/* Separator */}
      <div className="mx-1 h-6 w-px bg-slate-300" />

      {/* Additional options */}
      <ToolbarButton title="Comments">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-2H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 2z" />
        </svg>
      </ToolbarButton>

      <ToolbarButton title="More options">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </ToolbarButton>
    </div>
  );
}

export default EditorToolbar;

