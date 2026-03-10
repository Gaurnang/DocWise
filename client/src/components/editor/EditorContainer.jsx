function EditorContainer({ children }) {
  return (
    <div className="flex flex-1 justify-center overflow-y-auto bg-[var(--editor-bg)] px-8 py-12">
      <div className="w-full max-w-[720px]">
        {children}
      </div>
    </div>
  );
}

export default EditorContainer;

