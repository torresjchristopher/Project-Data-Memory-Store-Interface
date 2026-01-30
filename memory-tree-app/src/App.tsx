import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/Header';
import TreeDisplay from './components/TreeDisplay';
import AddMemoryForm from './components/AddMemoryForm';
import AddPersonForm from './components/AddPersonForm'; // New Component
import MemoryList from './components/MemoryList';
import type { MemoryTree, Memory, Person } from './types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type AppState = 'SELECTION' | 'ACTIVE';

function App() {
  const [appState, setAppState] = useState<AppState>('SELECTION');
  const [inputKey, setInputKey] = useState('');
  
  // Default State for "The Murrays"
  const [memoryTree, setMemoryTree] = useState<MemoryTree>({
    familyName: 'The Murrays',
    people: [],
    memories: [],
  });
  
  const [showAddMemoryForm, setShowAddMemoryForm] = useState(false);
  const [showAddPersonForm, setShowAddPersonForm] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);

  // Selection State: null = Family View (Center), string = Person ID
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Auto-save whenever tree changes
  useEffect(() => {
    if (memoryTree.protocolKey) {
      localStorage.setItem(`MT_PROTO_${memoryTree.protocolKey}`, JSON.stringify(memoryTree));
    }
  }, [memoryTree]);

  const handleStartNewTree = () => {
    const newKey = Math.floor(100000 + Math.random() * 900000).toString();
    // Start EMPTY - User must add members
    setMemoryTree({
      protocolKey: newKey,
      familyName: 'The Murrays',
      people: [],
      memories: [],
    });
    setAppState('ACTIVE');
  };

  const handleLoadByKey = () => {
    const saved = localStorage.getItem(`MT_PROTO_${inputKey}`);
    if (saved) {
      setMemoryTree(JSON.parse(saved));
      setAppState('ACTIVE');
    } else {
      alert(`Could not find a family tree with key: ${inputKey}`);
    }
  };

  // --- MEMBER MANAGEMENT ---

  const handleSavePerson = (person: Person) => {
    if (editingPersonId) {
      // Edit Mode
      setMemoryTree(prev => ({
        ...prev,
        people: prev.people.map(p => p.id === editingPersonId ? person : p)
      }));
      setEditingPersonId(null);
    } else {
      // Add Mode
      setMemoryTree(prev => ({
        ...prev,
        people: [...prev.people, person]
      }));
    }
    setShowAddPersonForm(false);
  };

  const handleDeletePerson = (personId: string) => {
    // Check if person has memories
    const hasMemories = memoryTree.memories.some(m => m.tags.personIds.includes(personId));
    if (hasMemories) {
      alert("Cannot remove this person because they have attached memories. Please delete or reassign their memories first.");
      return;
    }

    if (window.confirm("Are you sure you want to remove this family member?")) {
      setMemoryTree(prev => ({
        ...prev,
        people: prev.people.filter(p => p.id !== personId)
      }));
      setSelectedEntityId(null); // Go back to family view
    }
  };

  const startEditPerson = (personId: string) => {
    setEditingPersonId(personId);
    setShowAddPersonForm(true);
  };

  // --- MEMORY MANAGEMENT ---

  const handleAddMemory = (newMemory: Memory) => {
    setMemoryTree(prev => ({
      ...prev,
      memories: [...prev.memories, newMemory]
    }));
  };
  
  // Passed to AddMemoryForm (legacy wrapper)
  const handleAddPersonFromMemoryForm = (newPerson: Person) => {
     // Redirect to main handler
     setMemoryTree(prev => ({
        ...prev,
        people: [...prev.people, newPerson]
      }));
  };

  // Filter memories
  const filteredMemories = selectedEntityId 
    ? memoryTree.memories.filter(m => m.tags.personIds.includes(selectedEntityId))
    : memoryTree.memories.filter(m => m.tags.isFamilyMemory); 

  const handleExportClick = async () => {
    const treeElement = document.getElementById('tree-container');
    if (!treeElement) return;

    const canvas = await html2canvas(treeElement, { backgroundColor: '#ffffff', scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.text("Family Memory Archive", pageWidth/2, 20, { align: 'center' });
    pdf.addImage(imgData, 'PNG', 10, 30, pageWidth - 20, 0);
    pdf.save(`Family_History_${new Date().getFullYear()}.pdf`);
  };

  // --- RENDER ---

  if (appState === 'SELECTION') {
    return (
      <div className="App container-fluid p-0">
        <div className="row g-0" style={{ minHeight: '100vh' }}>
          <div className="col-lg-6 d-none d-lg-flex bg-primary flex-column justify-content-center align-items-center text-white p-5" 
               style={{ 
                 backgroundImage: 'linear-gradient(rgba(85, 107, 47, 0.8), rgba(85, 107, 47, 0.9)), url("https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1000&q=80")', 
                 backgroundSize: 'cover',
               }}>
            <h1 className="display-3 fw-bold mb-4 text-white">The Murrays</h1>
            <p className="lead opacity-75">Your Living Family Legacy</p>
          </div>

          <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center bg-white p-4">
            <div className="p-5 text-center" style={{ maxWidth: '480px' }}>
              <h2 className="fw-bold mb-4">Welcome Home</h2>
              <div className="d-grid gap-3">
                <button className="btn btn-primary btn-lg py-3" onClick={handleStartNewTree}>Start New Tree</button>
                <div className="input-group input-group-lg mb-3">
                  <input type="number" className="form-control" placeholder="Enter Key" value={inputKey} onChange={(e) => setInputKey(e.target.value)}/>
                  <button className="btn btn-secondary px-4" onClick={handleLoadByKey}>Load</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const personToEdit = editingPersonId ? memoryTree.people.find(p => p.id === editingPersonId) : null;

  return (
    <div className="App">
      <Header 
        onAddMemoryClick={() => setShowAddMemoryForm(true)}
        onAddPersonClick={() => { setEditingPersonId(null); setShowAddPersonForm(true); }}
        onExportClick={handleExportClick}
      />
      <main className="container mt-4">
        
        {/* Forms Modal Area */}
        {showAddPersonForm && (
          <div className="mb-4">
            <AddPersonForm 
              personToEdit={personToEdit}
              onSave={handleSavePerson}
              onCancel={() => { setShowAddPersonForm(false); setEditingPersonId(null); }}
            />
          </div>
        )}

        {showAddMemoryForm && (
          <div className="mb-4">
            <AddMemoryForm 
              people={memoryTree.people}
              onAddMemory={handleAddMemory}
              onAddPerson={handleAddPersonFromMemoryForm}
              onCancel={() => setShowAddMemoryForm(false)}
            />
          </div>
        )}

        {/* Tree Visualization */}
        <div id="tree-container" className="mb-5">
           {memoryTree.people.length === 0 ? (
             <div className="text-center p-5 bg-white border border-dashed rounded text-muted">
               <h3>Your Family Tree is Empty</h3>
               <p>Click "Add Member" above to register the first family member.</p>
             </div>
           ) : (
             <TreeDisplay 
               tree={memoryTree} 
               onSelectPerson={setSelectedEntityId}
             />
           )}
        </div>

        {/* Selected View Title & Controls */}
        <div className="text-center mb-4 animate-fade-in">
          <h2 style={{ fontFamily: 'serif', color: '#556b2f' }}>
            {selectedEntityId 
              ? memoryTree.people.find(p => p.id === selectedEntityId)?.name + "'s Artifacts"
              : "Family Bank: " + memoryTree.familyName}
          </h2>
          
          {selectedEntityId && (
            <div className="d-flex justify-content-center gap-2 mt-2">
               <button className="btn btn-sm btn-outline-secondary" onClick={() => startEditPerson(selectedEntityId)}>
                 Edit Member
               </button>
               <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePerson(selectedEntityId)}>
                 Remove Member
               </button>
            </div>
          )}

          <p className="text-muted mt-2">
            {selectedEntityId 
              ? "Viewing personal collection" 
              : "Viewing shared family memories (Center Bank)"}
          </p>
        </div>
        
        <MemoryList memories={filteredMemories} people={memoryTree.people} />
      </main>
    </div>
  )
}

export default App;