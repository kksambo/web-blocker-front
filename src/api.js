// src/components/BlockedSites.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlockedSites, addBlockedSite, removeBlockedSite } from '../services/api';

const BlockedSites = ({ onLogout }) => {
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBlockedSites();
  }, []);

  const loadBlockedSites = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getBlockedSites(token);
      setSites(data);
    } catch (err) {
      setError('Failed to load blocked sites');
      console.error('Error loading sites:', err);
    }
  };

  const handleAddSite = async (e) => {
    e.preventDefault();
    if (!newSite.trim()) return;

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await addBlockedSite(newSite.trim(), token);
      setNewSite('');
      await loadBlockedSites();
    } catch (err) {
      setError(err.message || 'Failed to add site');
      console.error('Error adding site:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSite = async (site) => {
    try {
      const token = localStorage.getItem('token');
      await removeBlockedSite(site, token);
      await loadBlockedSites();
    } catch (err) {
      setError(err.message || 'Failed to remove site');
      console.error('Error removing site:', err);
    }
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
            <h1 className="display-5 fw-bold text-primary mb-4">Blocked Sites</h1>
            <p className="lead text-muted mb-5">
              Manage the list of websites you want to block
            </p>
          </div>
        </div>

        {/* Add Site Form */}
        <div className="row mb-5">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="card-title mb-4">Add New Site to Block</h5>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleAddSite}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter domain (e.g., facebook.com)"
                        value={newSite}
                        onChange={(e) => setNewSite(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-4">
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100"
                        disabled={loading || !newSite.trim()}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Adding...
                          </>
                        ) : (
                          'Add Site'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Sites List */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="card-title mb-4">Blocked Websites</h5>
                
                {sites.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No sites blocked yet. Add some sites to get started.</p>
                  </div>
                ) : (
                  <div className="list-group">
                    {sites.map((site, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-bold">{site}</span>
                          <br />
                          <small className="text-muted">Click remove to unblock</small>
                        </div>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveSite(site)}
                          disabled={loading}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h6 className="card-title text-primary">Tips</h6>
                <ul className="list-unstyled text-muted small">
                  <li className="mb-2">• Use domain names only (e.g., facebook.com)</li>
                  <li className="mb-2">• Subdomains are automatically blocked</li>
                  <li className="mb-2">• You can add up to 100 sites</li>
                  <li>• Changes take effect immediately</li>
                </ul>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="card border-0 shadow-sm mt-4">
              <div className="card-body p-4">
                <h6 className="card-title text-primary">Quick Actions</h6>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setNewSite('facebook.com')}
                    disabled={loading}
                  >
                    Add Facebook
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setNewSite('youtube.com')}
                    disabled={loading}
                  >
                    Add YouTube
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setNewSite('twitter.com')}
                    disabled={loading}
                  >
                    Add Twitter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedSites;