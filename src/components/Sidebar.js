export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white p-6 flex flex-col">
      <h1 className="text-xl font-bold mb-6">Site Blocker</h1>
      <nav className="flex flex-col gap-4">
        <a href="#" className="hover:bg-gray-700 p-2 rounded">Dashboard</a>
        <a href="#" className="hover:bg-gray-700 p-2 rounded">Logs</a>
        <a href="#" className="hover:bg-gray-700 p-2 rounded">Settings</a>
      </nav>
    </div>
  );
}