/**
 * MEMORY BROWSER - Database-Driven Console
 * 
 * Pure interface for exploring memories by person
 * 100% database-derived (no hardcoded UI logic)
 * 
 * Data flow: Database → UI displays
 */

import React, { useState, useMemo } from 'react';
import type { Memory, MemoryTree } from '../types';
import '../styles/MemoryBrowser.css';

interface MemoryBrowserProps {
  tree: MemoryTree;
  onArtifactClick: (artifact: Memory) => void;
}

/**
 * MemoryBrowser: Database as source of truth
 * - All people pulled from database
 * - All memories pulled from database
 * - UI is derived display layer only
 */
const MemoryBrowser: React.FC<MemoryBrowserProps> = ({ tree, onArtifactClick }) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Derive people from database
  const peopleList = useMemo(() => {
    return tree.people.sort((a, b) => a.name.localeCompare(b.name));
  }, [tree.people]);

  // Derive selected person's memories from database
  const selectedMemories = useMemo(() => {
    if (!selectedPersonId) return [];
    return tree.memories
      .filter(m => m.tags.personIds.includes(selectedPersonId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedPersonId, tree.memories]);

  // Get selected person object
  const selectedPerson = useMemo(() => {
    return peopleList.find(p => p.id === selectedPersonId) || null;
  }, [selectedPersonId, peopleList]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="memory-browser">
      {/* Header */}
      <div className="browser-header">
        <h1 className="browser-title">Memory Archive</h1>
        <p className="browser-subtitle">
          {tree.people.length} members • {tree.memories.length} memories
        </p>
      </div>

      <div className="browser-container">
        {/* Sidebar: People List (Hyperlinked) */}
        <aside className="browser-sidebar">
          <div className="sidebar-header">
            <h2>Members</h2>
            <span className="member-count">{peopleList.length}</span>
          </div>

          {/* Family Link */}
          <div
            className={`person-link family-link ${selectedPersonId === null ? 'active' : ''}`}
            onClick={() => setSelectedPersonId(null)}
          >
            <span className="person-name">The {tree.familyName.split(' ')[tree.familyName.split(' ').length - 1]} Family</span>
            <span className="person-count">{tree.memories.length}</span>
          </div>

          {/* Individual People (Hyperlinks) */}
          <div className="people-list">
            {peopleList.map(person => (
              <div
                key={person.id}
                className={`person-link ${selectedPersonId === person.id ? 'active' : ''}`}
                onClick={() => setSelectedPersonId(person.id)}
                title={person.birthDate ? `b. ${formatDate(person.birthDate)}` : 'No birthdate'}
              >
                <span className="person-name">{person.name}</span>
                <span className="person-count">
                  {tree.memories.filter(m => m.tags.personIds.includes(person.id)).length}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main: Memories Grid */}
        <main className="browser-main">
          {selectedPerson ? (
            <>
              {/* Person Header */}
              <div className="person-header">
                <div>
                  <h2 className="person-title">{selectedPerson.name}</h2>
                  {selectedPerson.birthDate && (
                    <p className="person-meta">
                      Born {formatDate(selectedPerson.birthDate)}
                    </p>
                  )}
                  {selectedPerson.bio && (
                    <p className="person-bio">{selectedPerson.bio}</p>
                  )}
                </div>
              </div>

              {/* Memories Grid */}
              <div className="memories-section">
                <div className="section-label">
                  Memories ({selectedMemories.length})
                </div>

                {selectedMemories.length > 0 ? (
                  <div className="memories-grid">
                    {selectedMemories.map(memory => (
                      <div
                        key={memory.id}
                        className="memory-card"
                        onClick={() => onArtifactClick(memory)}
                      >
                        <div className="memory-date">{formatDate(memory.timestamp)}</div>
                        <div className="memory-title">
                          {memory.content.split('|DELIM|')[0].substring(0, 60)}
                        </div>
                        {memory.location && (
                          <div className="memory-location">{memory.location}</div>
                        )}
                        <div className="memory-type">{memory.type}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    No memories yet for {selectedPerson.name}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Family View */}
              <div className="family-header">
                <h2 className="family-title">{tree.familyName}</h2>
                <p className="family-meta">
                  {tree.people.length} members • {tree.memories.length} total artifacts
                </p>
              </div>

              {/* All Memories */}
              <div className="memories-section">
                <div className="section-label">
                  All Memories ({tree.memories.length})
                </div>

                {tree.memories.length > 0 ? (
                  <div className="memories-grid">
                    {tree.memories
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map(memory => {
                        const memoryPeople = tree.people.filter(p =>
                          memory.tags.personIds.includes(p.id)
                        );
                        return (
                          <div
                            key={memory.id}
                            className="memory-card"
                            onClick={() => onArtifactClick(memory)}
                          >
                            <div className="memory-date">{formatDate(memory.timestamp)}</div>
                            <div className="memory-title">
                              {memory.content.split('|DELIM|')[0].substring(0, 60)}
                            </div>
                            {memoryPeople.length > 0 && (
                              <div className="memory-people">
                                {memoryPeople.map(p => p.name).join(', ')}
                              </div>
                            )}
                            {memory.location && (
                              <div className="memory-location">{memory.location}</div>
                            )}
                            <div className="memory-type">{memory.type}</div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="empty-state">
                    No memories in archive yet
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default MemoryBrowser;
