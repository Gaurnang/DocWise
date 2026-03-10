function EditorContainer({ children }) {
  return (
    <div className="flex flex-1 justify-center bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-4xl flex-col rounded-lg border border-borderSubtle bg-canvas shadow-sm">
        {children}
      </div>
    </div>
  );
}

export default EditorContainer;

