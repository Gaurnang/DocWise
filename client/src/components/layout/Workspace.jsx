function Workspace({ children }) {
  return (
    <section className="flex flex-1 flex-col bg-slate-50">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col px-6 py-8">
        {children}
      </div>
    </section>
  );
}

export default Workspace;

