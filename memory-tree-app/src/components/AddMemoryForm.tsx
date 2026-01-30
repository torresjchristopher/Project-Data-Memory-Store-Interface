import React, { useState } from 'react';
import type { Person, Memory, MemoryType } from '../types';

interface AddMemoryFormProps {
  people: Person[];
  onAddMemory: (memory: Memory) => void;
  onAddPerson: (person: Person) => void;
  onCancel: () => void;
}

const AddMemoryForm: React.FC<AddMemoryFormProps> = ({ people, onAddMemory, onAddPerson, onCancel }) => {
  const [type, setType] = useState<MemoryType>('text');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  
  const [isAddingNewPerson, setIsAddingNewPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [parentId, setParentId] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAddingNewPerson) {
      const newPerson: Person = {
        id: Math.random().toString(36).substr(2, 9),
        name: newPersonName,
        parentId: parentId || undefined,
      };
      onAddPerson(newPerson);
      setIsAddingNewPerson(false);
      setNewPersonName('');
    } else {
      const newMemory: Memory = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        content,
        location,
        timestamp: new Date(date),
        personIds: [selectedPersonId],
      };
      onAddMemory(newMemory);
      onCancel();
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h2 className="card-title">{isAddingNewPerson ? 'ENTITY REGISTRATION' : 'ARCHIVE ENTRY'}</h2>
        <form onSubmit={handleSubmit}>
          {/* ... existing switch button ... */}
          <div className="mb-3">
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-sm mb-3"
              onClick={() => setIsAddingNewPerson(!isAddingNewPerson)}
            >
              {isAddingNewPerson ? '>> SWITCH TO ARCHIVE ENTRY' : '>> SWITCH TO ENTITY REGISTRATION'}
            </button>
          </div>

          {isAddingNewPerson ? (
            <>
              <div className="mb-3">
                <label className="form-label text-muted small">DESIGNATION / NAME</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newPersonName} 
                  onChange={(e) => setNewPersonName(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">PARENT ORIGIN</label>
                <select className="form-select" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">None (Root)</option>
                  {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label text-muted small">ARCHIVE TYPE</label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value as MemoryType)}>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">CONTENT</label>
                {type === 'text' ? (
                  <textarea 
                    className="form-control" 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    required 
                  />
                ) : (
                  <input 
                    type="file" 
                    className="form-control" 
                    onChange={handleFileChange} 
                    accept={type === 'image' ? 'image/*' : type === 'pdf' ? 'application/pdf' : '*/*'}
                    required 
                  />
                )}
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">GEOSPATIAL LOCATION</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">TEMPORAL TIMESTAMP</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small">LINKED ENTITY</label>
                <select 
                  className="form-select" 
                  value={selectedPersonId} 
                  onChange={(e) => setSelectedPersonId(e.target.value)}
                  required
                >
                  <option value="">Select entity</option>
                  {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </>
          )}

          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>CANCEL</button>
            <button type="submit" className="btn btn-success">
              {isAddingNewPerson ? 'ADD ENTITY' : 'SUBMIT ENTRY'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemoryForm;
