function Navbar({ title, saveStatus = 'Idle', userCount = 1 }) {
  const statusLabel =
    saveStatus === 'saving'
      ? 'Saving...'
      : saveStatus === 'saved'
      ? 'All changes saved'
      : 'Idle';

  return (
    <header className="flex items-center justify-between border-b border-borderSubtle bg-white px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          CE
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          <div className="text-xs text-gray-500">{statusLabel}</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white bg-indigo-100 text-xs font-medium text-indigo-700">
              U
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {userCount} active {userCount === 1 ? 'user' : 'users'}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

