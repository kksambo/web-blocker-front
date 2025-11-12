import React, { useEffect, useState } from "react";
import { getLogs, getStats } from "../api/api";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import BlockedSitesForm from "../components/BlockedSitesForm";
import UsersTable from "../components/UsersTable";
import StatsChart from "../components/StatsChart";
import LogsTable from "../components/LogsTable";
import StatsCard from "../components/StatsCard";

export default function Home() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchData();
    setupWebSocket();
  }, []);

  const fetchData = async () => {
    const logsRes = await getLogs();
    const statsRes = await getStats();
    setLogs(logsRes.data);
    setStats(statsRes.data);
  };

  const setupWebSocket = () => {
    const socket = new SockJS("http://localhost:8000/ws/logs");
    const stompClient = Stomp.over(socket);
    stompClient.connect({}, () => {
      stompClient.subscribe("/topic/logs", (message) => {
        const log = JSON.parse(message.body);
        setLogs((prev) => [log, ...prev.slice(0, 49)]);
      });
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg">Sidebar here</div>
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-3 gap-6 my-6">
          <StatsCard title="Total Logs" value={stats.totalLogs || 0} />
          <StatsCard title="Blocked Sites" value={stats.blockedSites || 0} />
          <StatsCard title="Active Users" value={stats.activeUsers || 0} />
        </div>

        <BlockedSitesForm refreshLogs={fetchData} />
        <UsersTable />
        <StatsChart />
        <LogsTable logs={logs} />
      </div>
    </div>
  );
}
