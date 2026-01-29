import React from 'react';

interface HeaderProps {
  onAddMemoryClick: () => void;
  onExportClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddMemoryClick, onExportClick }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">Memory Tree</a>
        <div className="d-flex">
          <button className="btn btn-primary me-2" onClick={onAddMemoryClick}>Add Memory</button>
          <button className="btn btn-secondary" onClick={onExportClick}>Export to PDF</button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
