import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blockService } from "../services/api";
import axios from "axios";

const categories = [
  "social_media",
  "streaming",
  "gambling",
  "ai_tools",
  "gaming",
  "shopping",
];

const BlockedSites = ({ onLogout }) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [aiSites, setAiSites] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadBlockedSites();
  }, []);

  const loadBlockedSites = async () => {
    try {
      const data = await blockService.getBlockedSites();
      setSites(data);
    } catch (err) {
      setError("Failed to load blocked sites");
    }
  };

  const handleCategoryChange = async (e) => {
    const selected = e.target.value;
    setCategory(selected);
    await fetchAiSuggestedSites(selected);
  };

  const fetchAiSuggestedSites = async (category) => {
    setAiLoading(true);
    try {
      const res = await axios.get(
        `https://web-blocker.onrender.com/suggest/blocked-sites?category=${category}`
      );
      setAiSites(res.data); // store AI suggestions in state
      if (res.data.length > 0) setShowModal(true); // show modal if suggestions exist
    } catch (err) {
      console.error("Failed to fetch AI suggested sites", err);
      setError("Failed to fetch AI suggested sites");
    } finally {
      setAiLoading(false);
    }
  };

  const handleBlockAll = async () => {
    setShowModal(false);
    setAiLoading(true);
    try {
      for (const site of aiSites) {
        try {
          await blockService.addBlockedSite(site.domain);
        } catch {
          console.warn("Failed to add site:", site.domain);
        }
      }
      await loadBlockedSites();
      setAiSites([]); // clear AI suggestions after adding
    } catch (err) {
      setError("Failed to block AI suggested sites");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
        <div className="container">
          <span className="navbar-brand fw-bold">Website Blocker</span>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link text-white" to="/dashboard">Dashboard</Link>
            <Link className="nav-link text-white" to="/blocked-sites">Block Sites</Link>
            <Link className="nav-link text-white" to="/logs">Logs</Link>
            <Link className="nav-link text-white" to="/charts">Analytics</Link>
            <button className="btn btn-outline-light btn-sm ms-2" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        {/* Category Selector */}
        <div className="row mb-5">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="card-title mb-4 text-primary">Block Sites by Category</h5>
                <select
                  className="form-select"
                  value={category}
                  onChange={handleCategoryChange}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat.replace("_", " ")}</option>
                  ))}
                </select>
                {aiLoading && <p className="text-muted mt-2">Processing AI suggestions...</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Blocked Websites */}
        <div className="row mb-5">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="card-title mb-4">Blocked Websites</h5>
                {error && <div className="alert alert-danger">{error}</div>}

                {sites.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No sites blocked yet.</p>
                  </div>
                ) : (
                  <div className="list-group">
                    {sites.map((site, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <span className="fw-bold">{site}</span>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={async () => {
                            try {
                              await blockService.removeBlockedSite(site);
                              await loadBlockedSites();
                            } catch {
                              setError("Failed to remove site");
                            }
                          }}
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
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Blocking</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  AI has suggested <strong>{aiSites.length}</strong> sites for the "{category.replace("_", " ")}" category.
                  Do you want to block all of them?
                </p>
                <ul className="list-group">
                  {aiSites.map((site, idx) => (
                    <li key={idx} className="list-group-item">
                      {site.domain} - <small>{site.reason}</small>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleBlockAll}>
                  Block All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default BlockedSites;
