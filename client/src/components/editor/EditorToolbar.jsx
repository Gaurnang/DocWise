import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const API_BASE = 'http://localhost:4000';

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

function EditorToolbar({ onDelete, documentId }) {
  const [formats, setFormats] = useState({ bold: false, italic: false, underline: false });
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(null);
  const moreButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [summaryError, setSummaryError] = useState('');

  const [showQnaModal, setShowQnaModal] = useState(false);
  const [qnaLoading, setQnaLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [sourcesUsed, setSourcesUsed] = useState(null);
  const [qnaError, setQnaError] = useState('');

  useEffect(() => {
    if (!showMoreMenu) return;
    function handleClickOutside(e) {
      const inButton = moreButtonRef.current?.contains(e.target);
      const inDropdown = dropdownRef.current?.contains(e.target);
      if (!inButton && !inDropdown) setShowMoreMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  function handleMoreOptionsClick() {
    if (!showMoreMenu && moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setShowMoreMenu((v) => !v);
  }

  async function handleConfirmDelete() {
    if (!onDelete) return;
    setDeleting(true);
    await onDelete();
    setDeleting(false);
    setShowDeleteConfirm(false);
  }

  const toggleFormat = (format) => {
    setFormats(prev => ({ ...prev, [format]: !prev[format] }));
  };

  const formatOptions = ['Heading 1', 'Heading 2', 'Paragraph', 'Quote', 'Code'];

  async function handleSummarizeClick() {
    setShowSummaryModal(true);
    setSummaryLoading(true);
    setSummaryError('');
    setSummaryText('');
    try {
      const res = await fetch(`${API_BASE}/api/documents/${documentId}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }
      setSummaryText(data.summary);
    } catch (err) {
      setSummaryError(err.message || 'Something went wrong while summarizing.');
    } finally {
      setSummaryLoading(false);
    }
  }

  async function handleAskSubmit(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setQnaLoading(true);
    setQnaError('');
    setAnswerText('');
    setSourcesUsed(null);

    try {
      const res = await fetch(`${API_BASE}/api/documents/${documentId}/qna`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get an answer');
      }
      setAnswerText(data.answer);
      setSourcesUsed(data.sources_used);
    } catch (err) {
      setQnaError(err.message || 'Something went wrong while answering.');
    } finally {
      setQnaLoading(false);
    }
  }

  function closeQnaModal() {
    setShowQnaModal(false);
    setQuestion('');
    setAnswerText('');
    setSourcesUsed(null);
    setQnaError('');
  }

  return (
    <div className="flex items-center gap-1 p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex-wrap md:flex-nowrap overflow-x-auto">
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

      <div className="mx-1 h-6 w-px bg-slate-300" />

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

      <div className="mx-1 h-6 w-px bg-slate-300" />

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

      <div className="mx-1 h-6 w-px bg-slate-300" />

      <ToolbarButton title="Comments">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-2H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 2z" />
        </svg>
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-slate-300" />

      <button
        type="button"
        title="Summarize this document"
        onClick={handleSummarizeClick}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 text-sm font-medium text-purple-700 transition-all hover:bg-purple-100 active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Summarize
      </button>

      <button
        type="button"
        title="Ask AI about this document"
        onClick={() => setShowQnaModal(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-700 transition-all hover:bg-blue-100 active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Ask AI
      </button>

      <div ref={moreButtonRef}>
        <ToolbarButton
          title="More options"
          onClick={handleMoreOptionsClick}
          isActive={showMoreMenu}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </ToolbarButton>
      </div>

      {showMoreMenu && dropdownPos && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999 }}
          className="w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-slideInLeft"
        >
          <button
            type="button"
            onClick={() => {
              setShowMoreMenu(false);
              setShowDeleteConfirm(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Document
          </button>
        </div>,
        document.body
      )}

      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-sm mx-4 rounded-xl border border-slate-200 bg-white shadow-xl p-8 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Delete Document?</h2>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. The document will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-10 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="flex-1 h-10 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showSummaryModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 rounded-xl border border-slate-200 bg-white shadow-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Document Summary</h2>
            </div>

            {summaryLoading && (
              <div className="flex items-center gap-3 py-6 text-slate-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-purple-600" />
                <span className="text-sm">Generating summary...</span>
              </div>
            )}

            {!summaryLoading && summaryError && (
              <p className="text-sm text-red-600 mb-4">{summaryError}</p>
            )}

            {!summaryLoading && !summaryError && summaryText && (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{summaryText}</p>
            )}

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="px-4 h-9 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showQnaModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 rounded-xl border border-slate-200 bg-white shadow-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Ask AI about this document</h2>
            </div>

            <form onSubmit={handleAskSubmit} className="flex gap-2 mb-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about this document..."
                className="flex-1 h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={qnaLoading || !question.trim()}
                className="px-4 h-10 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {qnaLoading ? '...' : 'Ask'}
              </button>
            </form>

            {qnaLoading && (
              <div className="flex items-center gap-3 py-4 text-slate-500">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}

            {!qnaLoading && qnaError && (
              <p className="text-sm text-red-600">{qnaError}</p>
            )}

            {!qnaLoading && !qnaError && answerText && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-2">{answerText}</p>
                {sourcesUsed !== null && (
                  <p className="text-xs text-slate-400">
                    Based on {sourcesUsed} relevant section{sourcesUsed === 1 ? '' : 's'} of this document.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={closeQnaModal}
                className="px-4 h-9 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default EditorToolbar;