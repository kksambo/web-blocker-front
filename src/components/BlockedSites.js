import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blockService } from "../services/api";
import axios from "axios";

const BlockedSites = ({ onLogout }) => {
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSites, setAiSites] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadBlockedSites();
    fetchAiSuggestedSites();
  }, []);

  const loadBlockedSites = async () => {
    try {
      const data = await blockService.getBlockedSites(); // returns array of strings
      setSites(data); // store as array of strings
    } catch (err) {
      setError("Failed to load blocked sites");
    }
  };

  const fetchAiSuggestedSites = async () => {
    setAiLoading(true);
    try {
      const res = await axios.get(
        "https://web-blocker.onrender.com/suggest/blocked-sites"
      );
      setAiSites(res.data);
    } catch (err) {
      console.error("Failed to fetch AI suggested sites", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSite = async (e) => {
    e.preventDefault();
    if (!newSite.trim()) return;

    setLoading(true);
    try {
      await blockService.addBlockedSite(newSite.trim());
      setNewSite("");
      await loadBlockedSites();
    } catch (err) {
      setError("Failed to add site");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSite = async (domain) => {
    try {
      await axios.delete(
        `https://web-blocker.onrender.com/blocked-sites/${domain}`
      );
      await loadBlockedSites();
    } catch (err) {
      setError("Failed to remove site");
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container">
          <span className="navbar-brand fw-bold">Website Blocker</span>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link text-white" to="/dashboard">
              Dashboard
            </Link>
            <Link className="nav-link text-white" to="/blocked-sites">
              Block Sites
            </Link>
            <Link className="nav-link text-white" to="/logs">
              Logs
            </Link>
            <Link className="nav-link text-white" to="/charts">
              Analytics
            </Link>
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
        <div className="row mb-5">
          <div className="col-12">
            <h1 className="display-5 fw-bold text-primary mb-2">
              Blocked Sites
            </h1>
            <p className="lead text-muted">
              Manage the list of websites you want to block
            </p>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="card-title mb-4">Add New Site to Block</h5>
                <form onSubmit={handleAddSite}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter domain (e.g., facebook.com)"
                        value={newSite}
                        onChange={(e) => setNewSite(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading || !newSite.trim()}
                      >
                        {loading ? "Adding..." : "Add Site"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="card-title mb-4">Blocked Websites</h5>

                {error && <div className="alert alert-danger">{error}</div>}

                {sites.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">
                      No sites blocked yet. Add some sites to get started.
                    </p>
                  </div>
                ) : (
                  <div className="list-group">
                    {sites.map((site, index) => (
                      <div
                        key={index}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span className="fw-bold">{site}</span>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveSite(site)}
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

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="card-title mb-4 text-primary">
                  AI Suggested Sites to Block
                </h5>
                {aiLoading ? (
                  <p className="text-muted">Loading suggestions...</p>
                ) : aiSites.length === 0 ? (
                  <p className="text-muted">No AI suggestions available</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {aiSites.map((site, idx) => (
                      <li
                        key={idx}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <span className="fw-bold">{site.domain}</span>
                          <br />
                          <small className="text-muted">{site.reason}</small>
                        </div>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={async () => {
                            try {
                              await blockService.addBlockedSite(site.domain);
                              await loadBlockedSites();
                            } catch {
                              setError("Failed to add AI suggested site");
                            }
                          }}
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h6 className="card-title text-primary">Tips</h6>
                <ul className="list-unstyled text-muted small">
                  <li>• Use domain names only (e.g., youtube.com)</li>
                  <li>• Subdomains are automatically blocked</li>
                  <li>• You can add up to 100 sites</li>
                  <li>• Changes take effect immediately</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedSites;
