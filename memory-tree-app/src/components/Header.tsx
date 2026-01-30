import React from 'react';

interface HeaderProps {
  onAddMemoryClick: () => void;
  onExportClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddMemoryClick, onExportClick }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top">
      <div className="container">
        <span className="navbar-brand mb-0 h1">Family Memory Tree</span>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={onAddMemoryClick}>
            <span className="me-2">+</span>Add New Memory
          </button>
          <button className="btn btn-outline-secondary" onClick={onExportClick}>
            Download Archive (PDF)
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
