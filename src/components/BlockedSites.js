import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { blockService } from "../services/api";

const BlockedSites = ({ onLogout }) => {
  const [sites, setSites] = useState([]);
  const [newSite, setNewSite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSites, setAiSites] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [category, setCategory] = useState("streaming");

  useEffect(() => {
    loadBlockedSites();
    fetchAiSuggestedSites(category);
  }, []);

  const loadBlockedSites = async () => {
    try {
      const data = await blockService.getBlockedSites();
      setSites(data);
    } catch (err) {
      setError("Failed to load blocked sites");
    }
  };

  const fetchAiSuggestedSites = async (selectedCategory) => {
    setAiLoading(true);
    try {
      const res = await axios.get(
        `https://web-blocker.onrender.com/suggest/blocked-sites?category=${selectedCategory}`
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
      await axios.delete(`https://web-blocker.onrender.com/blocked-sites/${domain}`);
      await loadBlockedSites();
    } catch (err) {
      setError("Failed to remove site");
    }
  };

  const handleCategoryChange = async (e) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    fetchAiSuggestedSites(newCategory);
  };

  const handleAddAllAiSites = async () => {
    try {
      for (let site of aiSites) {
        await blockService.addBlockedSite(site.domain);
      }
      await loadBlockedSites();
    } catch (err) {
      setError("Failed to add all AI suggested sites");
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
        <h1 className="display-5 fw-bold text-primary mb-4">Blocked Sites</h1>

        {/* Manual Add */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Add New Site Manually</h5>
            <form onSubmit={handleAddSite}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter domain (e.g., facebook.com)"
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loading || !newSite.trim()}
                >
                  {loading ? "Adding..." : "Add Site"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* AI Suggested */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title text-primary">AI Suggested Sites</h5>
              <div>
                <select
                  className="form-select"
                  value={category}
                  onChange={handleCategoryChange}
                >
                  <option value="streaming">Streaming</option>
                  <option value="social_media">Social Media</option>
                  <option value="gambling">Gambling</option>
                  <option value="gaming">Gaming</option>
                  <option value="shopping">Shopping</option>
                  <option value="ai_tools">AI Tools</option>
                </select>
              </div>
            </div>

            {aiLoading ? (
              <p className="text-muted">Loading suggestions...</p>
            ) : aiSites.length === 0 ? (
              <p className="text-muted">No AI suggestions available</p>
            ) : (
              <>
                <button
                  className="btn btn-success btn-sm mb-2"
                  onClick={handleAddAllAiSites}
                >
                  Add All AI Suggested Sites
                </button>
                <ul className="list-group">
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
              </>
            )}
          </div>
        </div>

        {/* Blocked Sites List */}
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">Blocked Sites</h5>
            {error && <div className="alert alert-danger">{error}</div>}
            {sites.length === 0 ? (
              <p className="text-muted">No sites blocked yet.</p>
            ) : (
              <ul className="list-group">
                {sites.map((site, idx) => (
                  <li
                    key={idx}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span className="fw-bold">{site}</span>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveSite(site)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedSites;
