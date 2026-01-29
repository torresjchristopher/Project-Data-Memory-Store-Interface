import React from 'react';
import type { Memory, Person } from '../types';

interface MemoryListProps {
  memories: Memory[];
  people: Person[];
}

const MemoryList: React.FC<MemoryListProps> = ({ memories, people }) => {
  const getPersonName = (id: string) => people.find(p => p.id === id)?.name || 'Unknown';

  return (
    <div className="memory-list">
      <h3 className="mb-4">Memory Gallery</h3>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {memories.map(memory => (
          <div key={memory.id} className="col">
            <div className="card h-100 shadow-sm">
              {memory.type === 'image' && (
                <img src={memory.content} className="card-img-top" alt="Memory" style={{ height: '200px', objectFit: 'cover' }} />
              )}
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className={`badge ${
                    memory.type === 'text' ? 'bg-primary' : 
                    memory.type === 'image' ? 'bg-success' : 
                    memory.type === 'audio' ? 'bg-warning' : 'bg-danger'
                  }`}>
                    {memory.type.toUpperCase()}
                  </span>
                  <small className="text-muted">{new Date(memory.timestamp).toLocaleDateString()}</small>
                </div>
                <h5 className="card-title">{memory.location}</h5>
                <p className="card-text">
                  {memory.type === 'text' ? memory.content : `Media Link: ${memory.content.substring(0, 30)}...`}
                </p>
              </div>
              <div className="card-footer bg-transparent">
                <small className="text-muted">
                  With: {memory.personIds.map(id => getPersonName(id)).join(', ')}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryList;
