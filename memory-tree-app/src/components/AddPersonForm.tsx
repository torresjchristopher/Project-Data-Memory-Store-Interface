import React, { useState, useEffect } from 'react';
import type { Person } from '../types';

interface AddPersonFormProps {
  personToEdit?: Person | null; // If provided, we are in Edit Mode
  onSave: (person: Person) => void;
  onCancel: () => void;
}

const AddPersonForm: React.FC<AddPersonFormProps> = ({ personToEdit, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');

  useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setBirthYear(personToEdit.birthYear.toString());
    }
  }, [personToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthYear) return;

    const person: Person = {
      id: personToEdit ? personToEdit.id : Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      birthYear: parseInt(birthYear),
      parentId: undefined // Not used in ring logic
    };

    onSave(person);
  };

  return (
    <div className="card mb-4 shadow-sm border-0 animate-fade-in" style={{ borderLeft: '5px solid #556b2f' }}>
      <div className="card-body p-4">
        <h4 className="mb-3 fw-bold" style={{ color: '#556b2f' }}>
          {personToEdit ? 'Edit Family Member' : 'Register New Family Member'}
        </h4>
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-7 mb-3">
              <label className="form-label fw-bold">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Grandma Rose"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                autoFocus
                required 
              />
            </div>
            <div className="col-md-5 mb-3">
              <label className="form-label fw-bold">Birth Year</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="YYYY"
                value={birthYear} 
                onChange={(e) => setBirthYear(e.target.value)} 
                required 
              />
              <div className="form-text small">Determines ring position (Center = Oldest).</div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-2">
            <button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary px-4">
              {personToEdit ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPersonForm;