import { Bell, Settings, Search } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-6 shrink-0">
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 max-w-md">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search candidates, jobs..."
          className="bg-transparent text-gray-600 placeholder-gray-400 outline-none flex-1 min-w-0"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 ml-auto">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Settings size={16} />
        </button>
        <div className="flex items-center gap-2 ml-1.5">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white" style={{ fontSize: 11, fontWeight: 700 }}>JD</span>
          </div>
          <span className="text-gray-700" style={{ fontSize: 13, fontWeight: 500 }}>Jana Doe</span>
        </div>
      </div>
    </header>
  );
}
