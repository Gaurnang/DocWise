function EditorContainer({ children }) {
  return (
    <div className="flex flex-1 justify-center overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-12">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

export default EditorContainer;

