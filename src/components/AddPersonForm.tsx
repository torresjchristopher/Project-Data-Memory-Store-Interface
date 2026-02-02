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
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (personToEdit) {
      setName(personToEdit.name);
      setBirthYear(personToEdit.birthYear.toString());
      setBio(personToEdit.bio || '');
    }
  }, [personToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthYear) return;

    const person: Person = {
      id: personToEdit ? personToEdit.id : Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      birthYear: parseInt(birthYear),
      bio: bio.trim(),
    };

    onSave(person);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid var(--navy-lighter)',
    borderRadius: '10px',
    fontSize: '16px',
    fontFamily: 'var(--font-sans)',
    transition: 'all 200ms ease-out'
  };

  const labelStyle = {
    display: 'block' as const,
    marginBottom: '8px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: 'var(--navy-primary)'
  };

  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid rgba(30, 27, 75, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(30, 27, 75, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--navy-10)',
          background: 'linear-gradient(135deg, var(--navy-primary), var(--navy-light))',
          color: 'white'
        }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-serif)' }}>
            {personToEdit ? 'Edit Member' : 'Add Member'}
          </h3>
        </div>

        {/* Body */}
        <div style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Name</label>
              <input 
                type="text" 
                placeholder="Full name"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                autoFocus
                required 
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Birth Year</label>
              <input 
                type="number" 
                placeholder="1950"
                value={birthYear} 
                onChange={(e) => setBirthYear(e.target.value)} 
                required 
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Bio (Optional)</label>
              <textarea 
                placeholder="Tell their story..."
                rows={5} 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                style={{...inputStyle, minHeight: '120px', resize: 'vertical'}}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: '1.5px solid var(--navy-lighter)',
                  borderRadius: '10px',
                  background: 'transparent',
                  color: 'var(--navy-primary)',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'var(--navy-10)';
                  (e.target as HTMLButtonElement).style.borderColor = 'var(--navy-light)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'transparent';
                  (e.target as HTMLButtonElement).style.borderColor = 'var(--navy-lighter)';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'var(--navy-primary)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(30, 27, 75, 0.1)',
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'var(--navy-light)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.target as HTMLButtonElement).style.boxShadow = '0 12px 16px rgba(30, 27, 75, 0.15)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.background = 'var(--navy-primary)';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.target as HTMLButtonElement).style.boxShadow = '0 4px 6px rgba(30, 27, 75, 0.1)';
                }}
              >
                {personToEdit ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPersonForm;
