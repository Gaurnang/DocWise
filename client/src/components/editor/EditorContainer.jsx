function EditorContainer({ children }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {children}
    </div>
  );
}

export default EditorContainer;

