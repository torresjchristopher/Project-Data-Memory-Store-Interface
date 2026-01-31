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
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";

type AppState = 'AUTH' | 'ACTIVE';

const MURRAY_PROTOCOL_KEY = "MURRAY_LEGACY_2026"; // Hardcoded for this client
const MURRAY_PASSWORD = "FAMILY_STRENGTH"; // Example password

function App() {
  const [appState, setAppState] = useState<AppState>('AUTH');
  const [passwordInput, setPasswordPasswordInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [authError, setAuthError] = useState('');

  const [memoryTree, setMemoryTree] = useState<MemoryTree>({
    protocolKey: MURRAY_PROTOCOL_KEY,
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
    if (appState === 'ACTIVE') {
      setIsSyncing(true);
      const unsub = onSnapshot(doc(db, "trees", MURRAY_PROTOCOL_KEY), (doc) => {
        if (doc.exists()) {
          const data = doc.data() as MemoryTree;
          const processedMemories = (data.memories || []).map(m => ({
            ...m,
            timestamp: (m.timestamp as any).toDate ? (m.timestamp as any).toDate() : new Date(m.timestamp)
          }));
          setMemoryTree({ ...data, memories: processedMemories });
        }
        setIsSyncing(false);
      });
      return () => unsub();
    }
  }, [appState]);

  const handleMurrayAuth = () => {
    if (passwordInput === MURRAY_PASSWORD) {
      setAppState('ACTIVE');
    } else {
      setAuthError('Incorrect password. Access restricted to the Murray Family.');
    }
  };

  const handleSavePerson = async (person: Person) => {
    const treeRef = doc(db, "trees", MURRAY_PROTOCOL_KEY);
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
    if (window.confirm("Remove this family member?")) {
      const treeRef = doc(db, "trees", MURRAY_PROTOCOL_KEY);
      await updateDoc(treeRef, {
        people: memoryTree.people.filter(p => p.id !== personId),
        memories: memoryTree.memories.filter(m => !m.tags.personIds.includes(personId))
      });
      setSelectedEntityId(null);
    }
  };

  const handleAddMemory = async (newMemory: Memory) => {
    const treeRef = doc(db, "trees", MURRAY_PROTOCOL_KEY);
    await updateDoc(treeRef, {
      memories: arrayUnion(newMemory)
    });
  };

  const filteredMemories = selectedEntityId
    ? memoryTree.memories.filter(m => m.tags.personIds.includes(selectedEntityId))
    : memoryTree.memories.filter(m => m.tags.isFamilyMemory);

  const handleExportClick = async () => {
    const treeElement = document.getElementById('tree-container');
    const archiveElement = document.getElementById('archive-container');
    if (!treeElement || !archiveElement) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Page 1: Family Tree Cover
    const canvasTree = await html2canvas(treeElement, { backgroundColor: '#ffffff', scale: 2 });
    pdf.setFont("serif", "bold");
    pdf.setFontSize(24);
    pdf.text("The Murray Family Legacy", 105, 30, { align: 'center' });
    pdf.addImage(canvasTree.toDataURL('image/png'), 'PNG', 10, 50, 190, 0);
    
    // Pages 2+: Memories
    for (let i = 0; i < filteredMemories.length; i++) {
        pdf.addPage();
        const mem = filteredMemories[i];
        pdf.setFontSize(18);
        pdf.text(mem.location || "Family Memory", 20, 20);
        pdf.setFontSize(12);
        pdf.text(new Date(mem.timestamp).toLocaleDateString(), 20, 30);
        
        if (mem.content.includes('|DELIM|')) {
            const [text, img] = mem.content.split('|DELIM|');
            pdf.addImage(img, 'JPEG', 20, 40, 170, 0);
            pdf.setFont("serif", "normal");
            pdf.text(text, 20, 200, { maxWidth: 170 });
        } else {
            pdf.text(mem.content, 20, 40, { maxWidth: 170 });
        }
    }

    pdf.save(The_Murray_Family_Book_.pdf);
  };

  if (appState === 'AUTH') {
    return (
      <div className="App container-fluid p-0 bg-dark text-white">
        <div className="row g-0 vh-100">
          <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center p-5 text-center" 
               style={{ background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1464692805480-a69dfaaf2428?auto=format&fit=crop&w=1000&q=80")', backgroundSize: 'cover' }}>
            <h1 className="display-2 fw-bold">YUKORA</h1>
            <p className="lead">Memory Store Interface</p>
          </div>
          <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center bg-white text-dark p-5">
            <div style={{ maxWidth: '400px' }} className="text-center">
              <h2 className="fw-bold mb-4">Are you a Murray?</h2>
              <p className="text-muted mb-4">This interface is currently reserved for the Murray family lineage.</p>
              <input 
                type="password" 
                className="form-control form-control-lg mb-3 text-center" 
                placeholder="Family Password" 
                value={passwordInput}
                onChange={e => setPasswordPasswordInput(e.target.value)}
              />
              <button className="btn btn-primary btn-lg w-100 mb-3" onClick={handleMurrayAuth}>Enter Archive</button>
              {authError && <div className="text-danger small">{authError}</div>}
              <div className="mt-5 pt-5 border-top">
                <p className="small text-muted">Interested in a Yukora Tree for your family? <br/> Contact us at yukora.org</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App bg-light min-vh-100">
      <Header
        onAddMemoryClick={() => setShowAddMemoryForm(true)}
        onAddPersonClick={() => { setEditingPersonId(null); setShowAddPersonForm(true); }}
        onExportClick={handleExportClick}
      />

      <main className="container py-5">
        <div id="tree-container" className="mb-5 p-4 bg-white shadow-sm rounded-xl">
           <TreeDisplay tree={memoryTree} onSelectPerson={setSelectedEntityId} />
        </div>

        <div id="archive-container">
            <div className="text-center mb-5">
              <h2 className="display-5" style={{ fontFamily: 'serif', color: '#2d3436' }}>
                {selectedEntityId
                  ? memoryTree.people.find(p => p.id === selectedEntityId)?.name + "'s History"
                  : "The Murray Family Archive"}
              </h2>
              <hr className="w-25 mx-auto" />
            </div>

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
                onAddPerson={() => {}} 
                onCancel={() => setShowAddMemoryForm(false)}
              />
            )}

            <MemoryList memories={filteredMemories} people={memoryTree.people} />
        </div>
      </main>
    </div>
  )
}

export default App;
