import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ProxyDashboard() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState([]);
  const [ws, setWs] = useState(null);

  const token = localStorage.getItem("token"); // Store token on login

  useEffect(() => {
    fetchLogs();
    fetchStats();

    const websocket = new WebSocket("wss://web-blocker.onrender.com/ws/logs");

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs((prev) => [data, ...prev].slice(0, 50));
    };
    setWs(websocket);

    return () => websocket.close();
  }, []);

  const fetchLogs = async () => {
    const res = await fetch("https://web-blocker.onrender.com/logs?limit=50", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLogs(data.logs);
  };

  const fetchStats = async () => {
    const res = await fetch("https://web-blocker.onrender.com/logs/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStats(data.stats);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Proxy Dashboard</h1>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold mb-2">Recent Logs</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-2 py-1 border">Time</th>
                <th className="px-2 py-1 border">Site</th>
                <th className="px-2 py-1 border">Status</th>
                <th className="px-2 py-1 border">Reason</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-100">
                  <td className="px-2 py-1 border">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-2 py-1 border">{log.site}</td>
                  <td className="px-2 py-1 border">{log.status}</td>
                  <td className="px-2 py-1 border">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Stats Pie Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-xl font-semibold mb-2">Top Blocked Sites</h2>
        <PieChart width={400} height={300}>
          <Pie
            data={stats}
            dataKey="count"
            nameKey="site"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {stats.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </motion.div>
    </div>
  );
}
