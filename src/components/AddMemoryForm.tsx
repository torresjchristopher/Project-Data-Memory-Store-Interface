import React, { useState } from 'react';
import type { Person, Memory, MemoryType } from '../types';

interface AddMemoryFormProps {
  people: Person[];
  onAddMemories: (memories: Memory[]) => void;
  onAddPerson: (person: Person) => void;
  onCancel: () => void;
}

const AddMemoryForm: React.FC<AddMemoryFormProps> = ({ people, onAddMemories, onAddPerson, onCancel }) => {
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [content, setContent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [files, setFiles] = useState<Array<{ data: string; type: MemoryType; name: string }>>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      Array.from(selectedFiles).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          let type: MemoryType = 'document';
          if (file.type.startsWith('image/')) type = 'image';
          else if (file.type.startsWith('audio/')) type = 'audio';
          else if (file.type.startsWith('video/')) type = 'video';
          else if (file.type === 'application/pdf') type = 'pdf';

          setFiles(prev => [...prev, {
            data: reader.result as string,
            type,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAddingPerson) {
      if (!newPersonName || !birthDate) return;
      onAddPerson({
        id: Math.random().toString(36).substr(2, 9),
        name: newPersonName,
        birthDate: birthDate,
        birthYear: parseInt(birthDate.split('-')[0]),
        familyGroup: 'Family'
      });
      setNewPersonName('');
      setBirthDate('');
      setIsAddingPerson(false);
      return;
    }

    if (!content && files.length === 0) return;
    if (selectedPersonIds.length === 0) return;

    const memories: Memory[] = [];

    if (files.length > 0) {
      files.forEach(file => {
        memories.push({
          id: Math.random().toString(36).substr(2, 9),
          type: file.type,
          content: content + '|DELIM|' + file.data,
          location: '',
          timestamp: new Date(date),
          tags: {
            isFamilyMemory: true,
            personIds: selectedPersonIds
          }
        });
      });
    } else {
      memories.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'text',
        content,
        location: '',
        timestamp: new Date(date),
        tags: {
          isFamilyMemory: true,
          personIds: selectedPersonIds
        }
      });
    }

    onAddMemories(memories);
    onCancel();
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
    display: 'block',
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
            {isAddingPerson ? 'Add Family Member' : 'Add Memory'}
          </h3>
        </div>

        {/* Body */}
        <div style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            {isAddingPerson ? (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Date of Birth</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
            ) : (
              <div>
                {/* Person */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Who</label>
                  <select
                    multiple
                    value={selectedPersonIds}
                    onChange={(e) => setSelectedPersonIds(Array.from(e.target.selectedOptions, option => option.value))}
                    style={{...inputStyle, minHeight: '120px'}}
                  >
                    {people.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>When</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Memory */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Memory</label>
                  <textarea
                    placeholder="Write what you remember..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{...inputStyle, minHeight: '100px', resize: 'vertical'}}
                  />
                </div>

                {/* Files */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Add Files (Optional)</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{...inputStyle, borderStyle: 'dashed', cursor: 'pointer'}}
                  />
                  {files.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      {files.map((file, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: 'var(--navy-10)',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          fontSize: '14px',
                          color: 'var(--navy-primary)'
                        }}>
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

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
                Save
              </button>
            </div>

            {/* Toggle */}
            <button
              type="button"
              onClick={() => setIsAddingPerson(!isAddingPerson)}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '12px',
                background: 'var(--navy-10)',
                border: 'none',
                borderRadius: '10px',
                color: 'var(--navy-primary)',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 200ms ease-out'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = 'var(--navy-20)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = 'var(--navy-10)';
              }}
            >
              {isAddingPerson ? '← Back to Memory' : 'Add New Person →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMemoryForm;
