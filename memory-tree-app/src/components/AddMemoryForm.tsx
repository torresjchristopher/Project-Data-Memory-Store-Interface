import React, { useState } from 'react';
import type { Person, Memory, MemoryType } from '../types';

interface AddMemoryFormProps {
  people: Person[];
  onAddMemory: (memory: Memory) => void;
  onAddPerson: (person: Person) => void;
  onCancel: () => void;
}

type SubmissionMode = 'STORY' | 'FILE' | 'BOTH';

const AddMemoryForm: React.FC<AddMemoryFormProps> = ({ people, onAddMemory, onAddPerson, onCancel }) => {
  const [isAddingNewPerson, setIsAddingNewPerson] = useState(false);
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>('STORY');
  
  // Memory Fields
  const [content, setContent] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileType, setFileType] = useState<MemoryType>('image');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  
  // Person Fields
  const [newPersonName, setNewPersonName] = useState('');
  const [parentId, setParentId] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData(reader.result as string);
        // Basic type detection
        if (file.type.startsWith('image/')) setFileType('image');
        else if (file.type.startsWith('audio/')) setFileType('audio');
        else if (file.type.startsWith('video/')) setFileType('video');
        else if (file.type === 'application/pdf') setFileType('pdf');
        else setFileType('document');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAddingNewPerson) {
      if (!newPersonName.trim()) return;
      onAddPerson({
        id: Math.random().toString(36).substr(2, 9),
        name: newPersonName.trim(),
        parentId: parentId || undefined,
      });
      setIsAddingNewPerson(false);
      setNewPersonName('');
    } else {
      if (!selectedPersonId) {
        alert("Please select a family member for this memory.");
        return;
      }

      const finalType = submissionMode === 'STORY' ? 'text' : fileType;
      const finalContent = submissionMode === 'STORY' ? content : (submissionMode === 'FILE' ? (fileData || '') : `${content}\n\n[FILE_ATTACHED]`);
      
      // If BOTH, we store the file data in a way that includes the description
      // For simplicity in this version, we'll store the text. 
      // A more robust app would store multiple fields, but we'll stick to the current Memory type.
      
      onAddMemory({
        id: Math.random().toString(36).substr(2, 9),
        type: finalType,
        content: submissionMode === 'BOTH' ? `${content}|DELIM|${fileData}` : (submissionMode === 'STORY' ? content : (fileData || '')),
        location,
        timestamp: new Date(date),
        personIds: [selectedPersonId],
      });
      onCancel();
    }
  };

  return (
    <div className="card mb-4 shadow-sm border-0">
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
            {isAddingNewPerson ? '← Back to Memories' : '+ Add New Person'}
          </button>
        </div>
      </div>
      
      <div className="card-body p-4">
        <form onSubmit={handleSubmit}>
          {isAddingNewPerson ? (
            <div className="animate-fade-in">
              <div className="mb-4">
                <label className="form-label fw-bold">Full Legal or Preferred Name</label>
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
                <label className="form-label fw-bold">Parent / Biological Connection</label>
                <select className="form-select form-select-lg border-2" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">No Direct Connection (Root Person)</option>
                  {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <p className="form-text mt-2">Connecting people helps build your family tree visualization.</p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="mb-4">
                <label className="form-label fw-bold d-block mb-3">What would you like to share?</label>
                <div className="btn-group w-100" role="group">
                  <input type="radio" className="btn-check" name="mode" id="m1" checked={submissionMode === 'STORY'} onChange={() => setSubmissionMode('STORY')} />
                  <label className="btn btn-outline-primary py-3" htmlFor="m1">Write a Story</label>
                  
                  <input type="radio" className="btn-check" name="mode" id="m2" checked={submissionMode === 'FILE'} onChange={() => setSubmissionMode('FILE')} />
                  <label className="btn btn-outline-primary py-3" htmlFor="m2">Upload a Photo</label>
                  
                  <input type="radio" className="btn-check" name="mode" id="m3" checked={submissionMode === 'BOTH'} onChange={() => setSubmissionMode('BOTH')} />
                  <label className="btn btn-outline-primary py-3" htmlFor="m3">Photo + Story</label>
                </div>
              </div>

              {(submissionMode === 'STORY' || submissionMode === 'BOTH') && (
                <div className="mb-4">
                  <label className="form-label fw-bold">The Story</label>
                  <textarea 
                    className="form-control border-2" 
                    rows={5}
                    placeholder="Tell the story of this moment..."
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    required 
                  />
                </div>
              )}

              {(submissionMode === 'FILE' || submissionMode === 'BOTH') && (
                <div className="mb-4">
                  <label className="form-label fw-bold">Choose Photo or File</label>
                  <div className="p-4 border-2 border-dashed rounded text-center bg-light" style={{ border: '2px dashed #ced4da' }}>
                    <input 
                      type="file" 
                      id="fileInput"
                      className="d-none" 
                      onChange={handleFileChange} 
                      accept="image/*,audio/*,video/*,.pdf"
                    />
                    <label htmlFor="fileInput" className="btn btn-secondary px-4">
                      {fileData ? 'Change File' : 'Select File'}
                    </label>
                    {fileData && (
                      <div className="mt-2 text-success small fw-bold">
                        ✓ File ready for preservation
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="row">
                <div className="col-md-6 mb-4">
                  <label className="form-label fw-bold">Location</label>
                  <input 
                    type="text" 
                    className="form-control border-2" 
                    placeholder="e.g. Family Farm, Ohio"
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    required 
                  />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label fw-bold">Approximate Date</label>
                  <input 
                    type="date" 
                    className="form-control border-2" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Who is this memory about?</label>
                <select 
                  className="form-select border-2 form-select-lg" 
                  value={selectedPersonId} 
                  onChange={(e) => setSelectedPersonId(e.target.value)}
                  required
                >
                  <option value="">Select a family member...</option>
                  {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-end gap-3 pt-3">
            <button type="button" className="btn btn-light btn-lg px-5" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg px-5 shadow-sm">
              {isAddingNewPerson ? 'Save Member' : 'Preserve Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemoryForm;
