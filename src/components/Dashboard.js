// src/components/Dashboard.js
import React from "react";
import { Link } from "react-router-dom";

const Dashboard = ({ onLogout }) => {
  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation */}
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

      {/* Main Content */}
      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <h1 className="display-4 fw-bold text-primary mb-4">Dashboard</h1>
            <p className="lead text-muted mb-5">
              Monitor and manage your website blocking activities
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row g-4">
          <div className="col-md-4">
            <Link to="/blocked-sites" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-card">
                <div className="card-body text-center p-4">
                  <div className="text-primary mb-3">
                    <i className="fas fa-plus-circle fa-2x"></i>
                  </div>
                  <h5 className="card-title">Manage Blocked Sites</h5>
                  <p className="card-text text-muted">
                    Add or remove websites from your block list
                  </p>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/logs" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-card">
                <div className="card-body text-center p-4">
                  <div className="text-info mb-3">
                    <i className="fas fa-list-alt fa-2x"></i>
                  </div>
                  <h5 className="card-title">View Activity Logs</h5>
                  <p className="card-text text-muted">
                    Monitor all blocked and allowed requests
                  </p>
                </div>
              </div>
            </Link>
          </div>
          <div className="col-md-4">
            <Link to="/charts" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 hover-card">
                <div className="card-body text-center p-4">
                  <div className="text-success mb-3">
                    <i className="fas fa-chart-pie fa-2x"></i>
                  </div>
                  <h5 className="card-title">Analytics & Reports</h5>
                  <p className="card-text text-muted">
                    View detailed analytics and reports
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
