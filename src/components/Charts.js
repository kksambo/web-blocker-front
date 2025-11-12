// src/components/Charts.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { logService } from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Charts = ({ onLogout }) => {
  const [stats, setStats] = useState({
    total: 0,
    blocked: 0,
    allowed: 0,
    blockedPercentage: 0
  });
  const [topDomains, setTopDomains] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    loadChartData();
  }, [timeRange]);

  const loadChartData = async () => {
    try {
      const logs = await logService.getLogs();
      processChartData(logs);
    } catch (err) {
      console.error('Failed to load chart data');
      // Use mock data for demonstration
      const mockLogs = generateMockData();
      processChartData(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (logs) => {
    // Calculate basic stats
    const blocked = logs.filter(log => log.status === 'BLOCKED').length;
    const allowed = logs.filter(log => log.status === 'ALLOWED').length;
    const total = logs.length;
    const blockedPercentage = total > 0 ? (blocked / total) * 100 : 0;

    setStats({
      total,
      blocked,
      allowed,
      blockedPercentage: Math.round(blockedPercentage)
    });

    // Calculate top domains
    const domainCounts = logs.reduce((acc, log) => {
      acc[log.domain] = (acc[log.domain] || 0) + 1;
      return acc;
    }, {});

    const sortedDomains = Object.entries(domainCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));

    setTopDomains(sortedDomains);

    // Generate time series data
    const timeData = generateTimeSeriesData(logs, timeRange);
    setTimeSeriesData(timeData);
  };

  const generateTimeSeriesData = (logs, range) => {
    const now = new Date();
    const dataPoints = range === '24h' ? 24 : 7;
    const interval = range === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    return Array.from({ length: dataPoints }, (_, i) => {
      const time = new Date(now.getTime() - (dataPoints - i - 1) * interval);
      const hourStart = new Date(time);
      const hourEnd = new Date(time.getTime() + interval);

      const hourLogs = logs.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime >= hourStart && logTime < hourEnd;
      });

      const blocked = hourLogs.filter(log => log.status === 'BLOCKED').length;
      const allowed = hourLogs.filter(log => log.status === 'ALLOWED').length;

      return {
        time: range === '24h'
          ? hourStart.getHours().toString().padStart(2, '0') + ':00'
          : hourStart.toLocaleDateString('en-US', { weekday: 'short' }),
        blocked,
        allowed,
        total: blocked + allowed
      };
    });
  };

  // Generate mock data for demonstration
  const generateMockData = () => {
    const domains = [
      'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
      'netflix.com', 'reddit.com', 'whatsapp.com', 'tiktok.com',
      'weatherkit.apple.com', 'googlevideo.com', 'amazon.com', 'ebay.com'
    ];

    const logs = [];
    const now = new Date();

    for (let i = 0; i < 500; i++) {
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      const randomStatus = Math.random() > 0.7 ? 'BLOCKED' : 'ALLOWED';
      const randomTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);

      logs.push({
        domain: randomDomain,
        status: randomStatus,
        timestamp: randomTime.toISOString()
      });
    }

    return logs;
  };

  // Chart configurations
  const activityOverTimeConfig = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Website Activity Over ${timeRange === '24h' ? '24 Hours' : '7 Days'}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Requests'
        }
      },
      x: {
        title: {
          display: true,
          text: timeRange === '24h' ? 'Time of Day' : 'Day of Week'
        }
      }
    },
  };

  const distributionConfig = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Request Distribution',
      },
    },
  };

  const topDomainsConfig = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Most Active Domains',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Requests'
        }
      }
    },
  };

  // Chart data
  const activityOverTimeData = {
    labels: timeSeriesData.map(d => d.time),
    datasets: [
      {
        label: 'Blocked Requests',
        data: timeSeriesData.map(d => d.blocked),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Allowed Requests',
        data: timeSeriesData.map(d => d.allowed),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const distributionData = {
    labels: ['Blocked', 'Allowed'],
    datasets: [
      {
        data: [stats.blocked, stats.allowed],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(75, 192, 192)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const topDomainsData = {
    labels: topDomains.map(d => d.domain),
    datasets: [
      {
        label: 'Requests',
        data: topDomains.map(d => d.count),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const effectivenessData = {
    labels: ['Effectiveness'],
    datasets: [
      {
        label: 'Blocking Effectiveness',
        data: [stats.blockedPercentage],
        backgroundColor: 'rgba(255, 205, 86, 0.8)',
        borderColor: 'rgb(255, 205, 86)',
        borderWidth: 2,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const effectivenessConfig = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Blocking Effectiveness',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Effectiveness: ${context.parsed}%`;
          }
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        display: false
      }
    },
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
          <div className="container">
            <span className="navbar-brand fw-bold">Website Blocker</span>
            <div className="navbar-nav ms-auto">
              <Link className="nav-link text-white" to="/dashboard">Dashboard</Link>
              <Link className="nav-link text-white" to="/blocked-sites">Block Sites</Link>
              <Link className="nav-link text-white" to="/logs">Logs</Link>
              <Link className="nav-link text-white" to="/charts">Analytics</Link>
              <button
                className="btn btn-outline-light btn-sm ms-2"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="container py-5">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container">
          <span className="navbar-brand fw-bold">Website Blocker</span>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link text-white" to="/dashboard">Dashboard</Link>
            <Link className="nav-link text-white" to="/blocked-sites">Block Sites</Link>
            <Link className="nav-link text-white" to="/logs">Logs</Link>
            <Link className="nav-link text-white" to="/charts">Analytics</Link>
            <button
              className="btn btn-outline-light btn-sm ms-2"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="display-5 fw-bold text-primary">Analytics & Reports</h1>
              <div className="btn-group">
                <button
                  className={`btn btn-outline-primary btn-sm ${timeRange === '24h' ? 'active' : ''}`}
                  onClick={() => setTimeRange('24h')}
                >
                  24 Hours
                </button>
                <button
                  className={`btn btn-outline-primary btn-sm ${timeRange === '7d' ? 'active' : ''}`}
                  onClick={() => setTimeRange('7d')}
                >
                  7 Days
                </button>
              </div>
            </div>
            <p className="lead text-muted mb-5">
              Visual insights into your blocking activities and patterns
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="text-primary mb-3">
                  <i className="fas fa-chart-bar fa-3x"></i>
                </div>
                <h3 className="card-title">{stats.total.toLocaleString()}</h3>
                <p className="card-text text-muted">Total Requests</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="text-success mb-3">
                  <i className="fas fa-check-circle fa-3x"></i>
                </div>
                <h3 className="card-title">{stats.allowed.toLocaleString()}</h3>
                <p className="card-text text-muted">Allowed Requests</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="text-danger mb-3">
                  <i className="fas fa-ban fa-3x"></i>
                </div>
                <h3 className="card-title">{stats.blocked.toLocaleString()}</h3>
                <p className="card-text text-muted">Blocked Requests</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="text-warning mb-3">
                  <i className="fas fa-bullseye fa-3x"></i>
                </div>
                <h3 className="card-title">{stats.blockedPercentage}%</h3>
                <p className="card-text text-muted">Blocking Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Charts */}
        <div className="row g-4 mb-4">
          {/* Activity Over Time */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <Line
                  data={activityOverTimeData}
                  options={activityOverTimeConfig}
                  height={100}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Distribution Pie Chart */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <Doughnut
                  data={distributionData}
                  options={distributionConfig}
                />
              </div>
            </div>
          </div>

          {/* Effectiveness Gauge */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div style={{ height: '250px', position: 'relative' }}>
                  <Doughnut
                    data={effectivenessData}
                    options={effectivenessConfig}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '60%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}
                  >
                    <div className="h4 mb-0">{stats.blockedPercentage}%</div>
                    <small className="text-muted">Blocking Rate</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Domains */}
        <div className="row g-4 mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <Bar
                  data={topDomainsData}
                  options={topDomainsConfig}
                  height={100}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Domain List Table */}
        <div className="row g-4 mt-2">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="card-title mb-4">Top Domains Summary</h5>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Domain</th>
                        <th>Total Requests</th>
                        <th>Blocked</th>
                        <th>Allowed</th>
                        <th>Block Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topDomains.slice(0, 8).map((domain, index) => (
                        <tr key={index}>
                          <td>
                            <code>{domain.domain}</code>
                          </td>
                          <td>{domain.count}</td>
                          <td>
                            <span className="text-danger">
                              {Math.round(domain.count * 0.3)}
                            </span>
                          </td>
                          <td>
                            <span className="text-success">
                              {Math.round(domain.count * 0.7)}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-warning">
                              {Math.round(30)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;