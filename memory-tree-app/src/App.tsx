import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/Header';
import TreeDisplay from './components/TreeDisplay';
import AddMemoryForm from './components/AddMemoryForm';
import MemoryList from './components/MemoryList';
import type { MemoryTree, Memory, Person } from './types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type AppState = 'SELECTION' | 'ACTIVE';

function App() {
  const [appState, setAppState] = useState<AppState>('SELECTION');
  const [memoryTree, setMemoryTree] = useState<MemoryTree>({
    people: [],
    memories: [],
  });
  const [showAddMemoryForm, setShowAddMemoryForm] = useState(false);
  const [logs, setLogs] = useState<string[]>(["SYSTEM READY...", "WAITING FOR INPUT..."]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${new Date().toLocaleTimeString()}: ${msg}`].slice(-5));
  };

  const handleStartNewTree = () => {
    const rootPerson: Person = { id: 'root', name: 'ORIGIN' };
    setMemoryTree({
      people: [rootPerson],
      memories: [],
    });
    setAppState('ACTIVE');
    addLog("NEW TREE INITIALIZED AT ORIGIN.");
  };

  const handleLoadExistingTree = () => {
    // Mock load
    setMemoryTree({
      people: [
        { id: '1', name: 'Grandma' },
        { id: '2', name: 'Mom', parentId: '1' },
        { id: '4', name: 'Me', parentId: '2' },
      ],
      memories: [
        { id: 'm1', type: 'text', content: 'Grandma\'s recipe.', location: 'Vault', timestamp: new Date('1985-01-01'), personIds: ['1'] },
      ],
    });
    setAppState('ACTIVE');
    addLog("EXISTING DATA LOADED FROM LOCAL STORAGE.");
  };

  const handleAddMemory = (newMemory: Memory) => {
    setMemoryTree(prev => ({
      ...prev,
      memories: [...prev.memories, newMemory]
    }));
    addLog(`MEMORY ADDED: [${newMemory.type.toUpperCase()}] at ${newMemory.location}`);
  };

  const handleAddPerson = (newPerson: Person) => {
    setMemoryTree(prev => ({
      ...prev,
      people: [...prev.people, newPerson]
    }));
    addLog(`ENTITY ADDED: ${newPerson.name}`);
  };

  const handleExportClick = async () => {
    addLog("GENERATING EXPORT DATA...");
    const input = document.getElementById('tree-container');
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.text("MEMORY TREE PROTOCOL - FAMILY BOOK", 10, 10);
    pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
    pdf.save("memory-protocol.pdf");
    addLog("EXPORT COMPLETE. FILE SAVED.");
  };

  if (appState === 'SELECTION') {
    return (
      <div className="App container d-flex flex-column justify-content-center align-items-center" style={{height: '100vh'}}>
        <div className="text-center">
          <h1 className="cursor-blink">MEMORY TREE PROTOCOL</h1>
          <p className="mb-5 text-muted">SECURE ARCHIVE v1.0.4</p>
          <div className="d-grid gap-3 col-10 mx-auto">
            <button className="btn btn-lg btn-primary" onClick={handleStartNewTree}>[ START NEW TREE ]</button>
            <button className="btn btn-lg btn-secondary" onClick={handleLoadExistingTree}>[ LOAD EXISTING ARCHIVE ]</button>
          </div>
        </div>
        <div className="mt-5 w-100 p-3" style={{border: '1px solid #333', backgroundColor: '#050505'}}>
          {logs.map((log, i) => <div key={i} className="text-muted small">{log}</div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header 
        onAddMemoryClick={() => setShowAddMemoryForm(true)}
        onExportClick={handleExportClick}
      />
      <main className="container mt-4">
        <div className="mb-2 p-2" style={{border: '1px solid #333', backgroundColor: '#050505', fontSize: '0.8rem'}}>
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
        
        {showAddMemoryForm && (
          <AddMemoryForm 
            people={memoryTree.people}
            onAddMemory={handleAddMemory}
            onAddPerson={handleAddPerson}
            onCancel={() => setShowAddMemoryForm(false)}
          />
        )}
        
        <div id="tree-container" className="mb-4">
          <TreeDisplay tree={memoryTree} />
        </div>
        
        <MemoryList memories={memoryTree.memories} people={memoryTree.people} />
      </main>
    </div>
  )
}

export default App;