// src/components/Logs.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logService } from '../services/api';

const Logs = ({ onLogout }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await logService.getLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.status === filter;
  });

  const getStatusBadge = (status) => {
    const variants = {
      BLOCKED: 'danger',
      ALLOWED: 'success'
    };
    return <span className={`badge bg-${variants[status]}`}>{status}</span>;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

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
              <h1 className="display-5 fw-bold text-primary">Activity Logs</h1>
              <select
                className="form-select w-auto"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="ALL">All Activities</option>
                <option value="BLOCKED">Blocked Only</option>
                <option value="ALLOWED">Allowed Only</option>
              </select>
            </div>
            <p className="lead text-muted mb-5">
              Monitor all website access attempts
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Domain</th>
                          <th>Status</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.map((log, index) => (
                          <tr key={index}>
                            <td>
                              <code>{log.domain}</code>
                            </td>
                            <td>
                              {getStatusBadge(log.status)}
                            </td>
                            <td className="text-muted">
                              {formatDate(log.timestamp)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredLogs.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-muted">No logs found for the selected filter.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logs;