import React, { useState } from 'react';
import type { Person, Memory, MemoryType } from '../types';

interface AddMemoryFormProps {
  people: Person[];
  onAddMemory: (memory: Memory) => void;
  onAddPerson: (person: Person) => void;
  onCancel: () => void;
}

const AddMemoryForm: React.FC<AddMemoryFormProps> = ({ people, onAddMemory, onAddPerson, onCancel }) => {
  const [isAddingNewPerson, setIsAddingNewPerson] = useState(false);
  
  // Memory Fields
  const [content, setContent] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileType, setFileType] = useState<MemoryType>('text'); // Default to text if no file
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Tagging
  const [tagScope, setTagScope] = useState<'FAMILY' | 'PERSON'>('FAMILY');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  
  // Person Fields
  const [newPersonName, setNewPersonName] = useState('');
  const [birthYear, setBirthYear] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData(reader.result as string);
        if (file.type.startsWith('image/')) setFileType('image');
        else if (file.type.startsWith('audio/')) setFileType('audio');
        else if (file.type.startsWith('video/')) setFileType('video');
        else if (file.type === 'application/pdf') setFileType('pdf');
        else setFileType('document');
      };
      reader.readAsDataURL(file);
    } else {
        setFileData(null);
        setFileType('text');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAddingNewPerson) {
      if (!newPersonName.trim() || !birthYear) return;
      onAddPerson({
        id: Math.random().toString(36).substr(2, 9),
        name: newPersonName.trim(),
        birthYear: parseInt(birthYear),
        parentId: undefined,
      });
      setIsAddingNewPerson(false);
      setNewPersonName('');
      setBirthYear('');
    } else {
      // VALIDATION: Must have either text OR file
      if (!content.trim() && !fileData) {
        alert("Please provide either a story description OR upload a file.");
        return;
      }

      if (tagScope === 'PERSON' && !selectedPersonId) {
        alert("Please select a family member.");
        return;
      }

      // Determine final type
      const finalType = fileData ? fileType : 'text';
      
      // Construct content string
      // If both: "Description|DELIM|File"
      // If only file: "|DELIM|File" (empty text part)
      // If only text: "Description"
      let finalContent = content;
      if (fileData) {
          finalContent = `${content}|DELIM|${fileData}`;
      }
      
      onAddMemory({
        id: Math.random().toString(36).substr(2, 9),
        type: finalType,
        content: finalContent,
        location,
        timestamp: new Date(date),
        tags: {
            isFamilyMemory: tagScope === 'FAMILY',
            personIds: tagScope === 'PERSON' ? [selectedPersonId] : []
        }
      });
      onCancel();
    }
  };

  return (
    <div className="card mb-4 shadow-sm border-0 animate-fade-in" style={{ borderLeft: '5px solid #556b2f' }}>
      <div className="card-header bg-white border-bottom p-4">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold" style={{ color: '#556b2f' }}>
            {isAddingNewPerson ? 'Register Family Member' : 'Preserve a Memory'}
          </h4>
          <button 
            type="button" 
            className="btn btn-link text-decoration-none p-0 fw-bold"
            style={{ color: '#8fbc8f' }}
            onClick={() => setIsAddingNewPerson(!isAddingNewPerson)}
          >
            {isAddingNewPerson ? '← Back to Memories' : '+ Register New Person'}
          </button>
        </div>
      </div>
      
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          {isAddingNewPerson ? (
            <div className="animate-fade-in">
              <div className="mb-4">
                <label className="form-label fw-bold">Full Name</label>
                <input 
                  type="text" 
                  className="form-control form-control-lg border-2" 
                  placeholder="e.g. Mary Elizabeth Smith"
                  value={newPersonName} 
                  onChange={(e) => setNewPersonName(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold">Birth Year</label>
                <input 
                  type="number" 
                  className="form-control form-control-lg border-2" 
                  placeholder="e.g. 1950"
                  value={birthYear} 
                  onChange={(e) => setBirthYear(e.target.value)} 
                  required 
                />
                <div className="form-text">Used to place them in the correct generation ring.</div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              
              {/* WHO */}
              <div className="mb-4 p-3 bg-light rounded border">
                <label className="form-label fw-bold">Who is this for?</label>
                <div className="d-flex gap-3 mb-3">
                    <div className="form-check">
                        <input className="form-check-input" type="radio" name="tagScope" id="tagFamily" checked={tagScope === 'FAMILY'} onChange={() => setTagScope('FAMILY')} />
                        <label className="form-check-label" htmlFor="tagFamily">The Whole Family (Center Bank)</label>
                    </div>
                    <div className="form-check">
                        <input className="form-check-input" type="radio" name="tagScope" id="tagPerson" checked={tagScope === 'PERSON'} onChange={() => setTagScope('PERSON')} />
                        <label className="form-check-label" htmlFor="tagPerson">Specific Person</label>
                    </div>
                </div>
                
                {tagScope === 'PERSON' && (
                    <select 
                        className="form-select border-2" 
                        value={selectedPersonId} 
                        onChange={(e) => setSelectedPersonId(e.target.value)}
                        required
                    >
                        <option value="">Select family member...</option>
                        {people.map(p => <option key={p.id} value={p.id}>{p.name} (b. {p.birthYear})</option>)}
                    </select>
                )}
              </div>

              {/* WHAT (Unified) */}
              <div className="row">
                  <div className="col-md-7 mb-3">
                      <label className="form-label fw-bold">Description / Story (Optional if file attached)</label>
                      <textarea 
                        className="form-control border-2" 
                        rows={5}
                        placeholder="What is happening in this memory?"
                        value={content} 
                        onChange={(e) => setContent(e.target.value)} 
                      />
                  </div>
                  <div className="col-md-5 mb-3">
                      <label className="form-label fw-bold">Attach File (Optional if story written)</label>
                      <div className={`p-4 border-2 border-dashed rounded text-center ${fileData ? 'bg-success-subtle border-success' : 'bg-light'}`} style={{ borderStyle: 'dashed' }}>
                        <input 
                            type="file" 
                            id="fileUpload"
                            className="d-none" 
                            onChange={handleFileChange} 
                            accept="image/*,audio/*,video/*,.pdf"
                        />
                        <label htmlFor="fileUpload" className="btn btn-outline-secondary">
                            {fileData ? 'Change File' : 'Select File'}
                        </label>
                        {fileData && <div className="mt-2 small text-success fw-bold">✓ Attached</div>}
                      </div>
                  </div>
              </div>

              {/* WHEN & WHERE */}
              <div className="row">
                <div className="col-md-6 mb-4">
                  <label className="form-label fw-bold">Location</label>
                  <input type="text" className="form-control border-2" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label fw-bold">Approximate Date</label>
                  <input type="date" className="form-control border-2" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-end gap-3 pt-3 border-top">
            <button type="button" className="btn btn-light px-4" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary px-5 shadow-sm">
              {isAddingNewPerson ? 'Register Member' : 'Save Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemoryForm;