import React from 'react';
import type { Memory, Person } from '../types';

interface MemoryListProps {
  memories: Memory[];
  people: Person[];
}

const MemoryList: React.FC<MemoryListProps> = ({ memories, people }) => {
  const getPersonName = (id: string) => people.find(p => p.id === id)?.name || 'Unknown';

  const parseContent = (memory: Memory) => {
    if (memory.content.includes('|DELIM|')) {
      const [text, file] = memory.content.split('|DELIM|');
      return { text, file };
    }
    return { 
      text: memory.type === 'text' ? memory.content : '', 
      file: memory.type !== 'text' ? memory.content : null 
    };
  };

  if (memories.length === 0) {
    return (
      <div className="text-center py-5 bg-white rounded shadow-sm border border-dashed" style={{ border: '2px dashed #dee2e6' }}>
        <h4 className="text-muted fw-bold">Your archive is empty.</h4>
        <p className="text-muted mb-0">Capture your first family story or photo to begin.</p>
      </div>
    );
  }

  return (
    <div className="memory-list mt-5">
      <div className="d-flex align-items-center mb-4">
        <h3 className="mb-0 fw-bold" style={{ color: '#556b2f' }}>Family Archive</h3>
        <div className="ms-3 badge bg-light text-muted border">{memories.length} entries</div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {memories.map(memory => {
          const { text, file } = parseContent(memory);
          return (
            <div key={memory.id} className="col">
              <div className="card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: '12px' }}>
                {file && (
                  <div className="bg-light d-flex align-items-center justify-content-center overflow-hidden" style={{ height: '240px' }}>
                    {memory.type === 'image' ? (
                      <img src={file} className="w-100 h-100" alt="Memory" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="text-center p-4">
                        <div className="display-4 mb-2">📄</div>
                        <div className="fw-bold text-muted text-uppercase small">{memory.type} file</div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className={`badge rounded-pill px-3 py-2 ${
                      memory.type === 'text' ? 'bg-primary' : 
                      memory.type === 'image' ? 'bg-success' : 
                      'bg-secondary'
                    }`}>
                      {memory.type.toUpperCase()}
                    </span>
                    <small className="text-muted fw-bold">
                      {new Date(memory.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                    </small>
                  </div>
                  
                  {memory.location && (
                    <div className="small text-muted mb-3 d-flex align-items-center">
                      <span className="me-1">📍</span> {memory.location}
                    </div>
                  )}
                  
                  {text && (
                    <p className="card-text text-dark" style={{ 
                      fontSize: '1rem', 
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: '6',
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {text}
                    </p>
                  )}
                </div>

                <div className="card-footer bg-white border-0 px-4 pb-4">
                  <div className="pt-3 border-top">
                    <small className="text-muted d-block mb-1 text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                      About
                    </small>
                    <div className="fw-bold" style={{ color: '#2c3e50' }}>
                      {memory.tags.isFamilyMemory 
                        ? "Whole Family" 
                        : memory.tags.personIds.map(id => getPersonName(id)).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryList;