import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/Header';
import TreeDisplay from './components/TreeDisplay';
import AddMemoryForm from './components/AddMemoryForm';
import AddPersonForm from './components/AddPersonForm';
import MemoryList from './components/MemoryList';
import type { MemoryTree, Memory, Person } from './types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Firebase Imports
import { db } from './firebase';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

type AppState = 'SELECTION' | 'ACTIVE';

function App() {
  const [appState, setAppState] = useState<AppState>('SELECTION');
  const [inputKey, setInputKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [memoryTree, setMemoryTree] = useState<MemoryTree>({
    familyName: 'The Murrays',
    people: [],
    memories: [],
  });
  
  const [showAddMemoryForm, setShowAddMemoryForm] = useState(false);
  const [showAddPersonForm, setShowAddPersonForm] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // --- REAL-TIME SYNC ---
  useEffect(() => {
    if (appState === 'ACTIVE' && memoryTree.protocolKey) {
      setIsSyncing(true);
      const unsub = onSnapshot(doc(db, "trees", memoryTree.protocolKey), (doc) => {
        if (doc.exists()) {
          const data = doc.data() as MemoryTree;
          // Convert Firestore timestamps back to Dates
          const processedMemories = data.memories.map(m => ({
            ...m,
            timestamp: (m.timestamp as any).toDate ? (m.timestamp as any).toDate() : new Date(m.timestamp)
          }));
          setMemoryTree({ ...data, memories: processedMemories });
        }
        setIsSyncing(false);
      });
      return () => unsub();
    }
  }, [appState, memoryTree.protocolKey]);

  const handleStartNewTree = async () => {
    const newKey = Math.floor(100000 + Math.random() * 900000).toString();
    const newTree: MemoryTree = {
      protocolKey: newKey,
      familyName: 'The Murrays',
      people: [],
      memories: [],
    };

    try {
      await setDoc(doc(db, "trees", newKey), newTree);
      setMemoryTree(newTree);
      setAppState('ACTIVE');
    } catch (e) {
      console.error("Error creating tree:", e);
      alert("Failed to connect to database. Check your Firebase config.");
    }
  };

  const handleLoadByKey = () => {
    if (inputKey.length < 6) return;
    // We just set the key and appState; the onSnapshot useEffect handles the fetching
    setMemoryTree(prev => ({ ...prev, protocolKey: inputKey }));
    setAppState('ACTIVE');
  };

  // --- MEMBER MANAGEMENT (Write to Firestore) ---

  const handleSavePerson = async (person: Person) => {
    if (!memoryTree.protocolKey) return;
    
    const treeRef = doc(db, "trees", memoryTree.protocolKey);
    let updatedPeople;

    if (editingPersonId) {
      updatedPeople = memoryTree.people.map(p => p.id === editingPersonId ? person : p);
    } else {
      updatedPeople = [...memoryTree.people, person];
    }

    await updateDoc(treeRef, { people: updatedPeople });
    setEditingPersonId(null);
    setShowAddPersonForm(false);
  };

  const handleDeletePerson = async (personId: string) => {
    const hasMemories = memoryTree.memories.some(m => m.tags.personIds.includes(personId));
    if (hasMemories) {
      alert("Cannot remove this person because they have attached memories.");
      return;
    }

    if (window.confirm("Remove this family member?")) {
      const treeRef = doc(db, "trees", memoryTree.protocolKey!);
      await updateDoc(treeRef, {
        people: memoryTree.people.filter(p => p.id !== personId)
      });
      setSelectedEntityId(null);
    }
  };

  // --- MEMORY MANAGEMENT (Write to Firestore) ---

  const handleAddMemory = async (newMemory: Memory) => {
    if (!memoryTree.protocolKey) return;
    const treeRef = doc(db, "trees", memoryTree.protocolKey);
    await updateDoc(treeRef, {
      memories: arrayUnion(newMemory)
    });
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
    pdf.text("Family Memory Archive", 105, 20, { align: 'center' });
    pdf.addImage(imgData, 'PNG', 10, 30, 190, 0);
    pdf.save(`Family_History_${new Date().getFullYear()}.pdf`);
  };

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

  return (
    <div className="App">
      <Header 
        onAddMemoryClick={() => setShowAddMemoryForm(true)}
        onAddPersonClick={() => { setEditingPersonId(null); setShowAddPersonForm(true); }}
        onExportClick={handleExportClick}
      />
      
      {isSyncing && (
        <div className="bg-success text-white text-center small py-1" style={{ opacity: 0.8 }}>
          Syncing with Cloud...
        </div>
      )}

      <main className="container mt-4">
        {showAddPersonForm && (
          <AddPersonForm 
            personToEdit={editingPersonId ? memoryTree.people.find(p => p.id === editingPersonId) : null}
            onSave={handleSavePerson}
            onCancel={() => { setShowAddPersonForm(false); setEditingPersonId(null); }}
          />
        )}

        {showAddMemoryForm && (
          <AddMemoryForm 
            people={memoryTree.people}
            onAddMemory={handleAddMemory}
            onAddPerson={() => {}} // Legacy prop
            onCancel={() => setShowAddMemoryForm(false)}
          />
        )}

        <div id="tree-container" className="mb-5">
           {memoryTree.people.length === 0 ? (
             <div className="text-center p-5 bg-white border border-dashed rounded text-muted">
               <h3>Your Family Tree is Empty</h3>
               <p>Click "Add Member" above to register the first family member.</p>
             </div>
           ) : (
             <TreeDisplay tree={memoryTree} onSelectPerson={setSelectedEntityId} />
           )}
        </div>

        <div className="text-center mb-4 animate-fade-in">
          <h2 style={{ fontFamily: 'serif', color: '#556b2f' }}>
            {selectedEntityId 
              ? memoryTree.people.find(p => p.id === selectedEntityId)?.name + "'s Artifacts"
              : "Family Bank: " + memoryTree.familyName}
          </h2>
          {selectedEntityId && (
            <div className="d-flex justify-content-center gap-2 mt-2">
               <button className="btn btn-sm btn-outline-secondary" onClick={() => { setEditingPersonId(selectedEntityId); setShowAddPersonForm(true); }}>Edit Member</button>
               <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePerson(selectedEntityId)}>Remove Member</button>
            </div>
          )}
        </div>
        
        <MemoryList memories={filteredMemories} people={memoryTree.people} />
      </main>
    </div>
  )
}

export default App;