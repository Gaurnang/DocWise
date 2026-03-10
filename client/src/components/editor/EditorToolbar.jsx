const actions = [
  { label: 'B', title: 'Bold' },
  { label: 'I', title: 'Italic' },
  { label: 'U', title: 'Underline' },
  { label: 'H1', title: 'Heading 1' },
  { label: '•', title: 'Bullet list' },
];

function EditorToolbar() {
  return (
    <div className="flex items-center gap-2 border-b border-borderSubtle bg-slate-50 px-6 py-2">
      {actions.map((action) => (
        <button
          key={action.title}
          type="button"
          title={action.title}
          className="inline-flex h-8 items-center justify-center rounded-md border border-transparent bg-white px-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

export default EditorToolbar;

