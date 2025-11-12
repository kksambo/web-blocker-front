import React from "react";

export default function LogsTable({ logs }) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="font-bold text-lg mb-4">Recent Logs</h2>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">Time</th>
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">Site</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx} className="border-b">
              <td className="px-4 py-2">{log.time}</td>
              <td className="px-4 py-2">{log.user}</td>
              <td className="px-4 py-2">{log.site}</td>
              <td className="px-4 py-2">{log.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
