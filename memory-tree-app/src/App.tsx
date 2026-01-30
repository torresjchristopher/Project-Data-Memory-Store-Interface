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
  const [inputKey, setInputKey] = useState('');
  const [memoryTree, setMemoryTree] = useState<MemoryTree>({
    people: [],
    memories: [],
  });
  const [showAddMemoryForm, setShowAddMemoryForm] = useState(false);
  const [logs, setLogs] = useState<string[]>(["SYSTEM READY...", "WAITING FOR AUTHENTICATION..."]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${msg}`].slice(-5));
  };

  // Auto-save whenever tree changes
  useEffect(() => {
    if (memoryTree.protocolKey) {
      localStorage.setItem(`MT_PROTO_${memoryTree.protocolKey}`, JSON.stringify(memoryTree));
    }
  }, [memoryTree]);

  const handleStartNewTree = () => {
    const newKey = Math.floor(100000 + Math.random() * 900000).toString();
    const rootPerson: Person = { id: 'root', name: 'ORIGIN' };
    setMemoryTree({
      protocolKey: newKey,
      people: [rootPerson],
      memories: [],
    });
    setAppState('ACTIVE');
    addLog(`NEW PROTOCOL ${newKey} INITIALIZED.`);
  };

  const handleLoadByKey = () => {
    const saved = localStorage.getItem(`MT_PROTO_${inputKey}`);
    if (saved) {
      setMemoryTree(JSON.parse(saved));
      setAppState('ACTIVE');
      addLog(`PROTOCOL ${inputKey} ACCESS GRANTED.`);
    } else {
      addLog(`ERROR: PROTOCOL ${inputKey} NOT FOUND IN LOCAL BUFFER.`);
    }
  };

  // ... rest of handlers (handleAddMemory, handleAddPerson, handleExportClick) remain same


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
    addLog("COMPILING FULL ARCHIVE DATA...");
    const treeElement = document.getElementById('tree-container');
    if (!treeElement) return;

    // Use a higher scale for better resolution in PDF
    const canvas = await html2canvas(treeElement, { 
      backgroundColor: '#000',
      scale: 2
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 1. Title Page
    pdf.setFillColor(0, 0, 0);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.setTextColor(0, 255, 65);
    pdf.setFont("courier", "bold");
    pdf.setFontSize(30);
    pdf.text("ARCHIVE PROTOCOL: ALPHA", pageWidth/2, 50, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text("STRICTLY CONFIDENTIAL - FAMILY LINEAGE", pageWidth/2, 70, { align: 'center' });
    pdf.setDrawColor(0, 255, 65);
    pdf.line(20, 80, pageWidth-20, 80);
    pdf.setFontSize(10);
    pdf.text(`TOTAL ENTITIES: ${memoryTree.people.length}`, 30, 100);
    pdf.text(`TOTAL MEMORIES: ${memoryTree.memories.length}`, 30, 110);
    pdf.text(`GENERATED ON: ${new Date().toLocaleString()}`, 30, 120);

    // 2. Tree Visualization
    pdf.addPage();
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text("VISUAL HIERARCHY MAP", 15, 20);
    const imgProps = pdf.getImageProperties(imgData);
    const pdfImgWidth = pageWidth - 20;
    const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 10, 30, pdfImgWidth, pdfImgHeight);

    // 3. Detailed Records
    memoryTree.people.forEach((person) => {
      const personMemories = memoryTree.memories.filter(m => m.personIds.includes(person.id));
      if (personMemories.length > 0) {
        pdf.addPage();
        pdf.setDrawColor(0, 255, 65);
        pdf.setFillColor(245, 245, 245);
        pdf.rect(10, 10, pageWidth - 20, 20, 'F');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(18);
        pdf.text(`RECORD: ${person.name.toUpperCase()}`, 15, 23);
        
        let yPos = 45;
        personMemories.forEach((mem, idx) => {
          if (yPos > pageHeight - 80) {
            pdf.addPage();
            yPos = 20;
          }

          pdf.setDrawColor(200, 200, 200);
          pdf.line(15, yPos, pageWidth - 15, yPos);
          
          pdf.setFont("courier", "bold");
          pdf.setFontSize(11);
          pdf.text(`[${idx + 1}] TYPE: ${mem.type.toUpperCase()}`, 15, yPos + 10);
          pdf.setFont("courier", "normal");
          pdf.text(`DATE: ${new Date(mem.timestamp).toLocaleDateString()}`, pageWidth - 15, yPos + 10, { align: 'right' });
          pdf.text(`LOCATION: ${mem.location}`, 15, yPos + 17);

          if (mem.type === 'image' && mem.content.startsWith('data:image')) {
             try {
               pdf.addImage(mem.content, 'JPEG', 15, yPos + 22, 50, 40);
               yPos += 45;
             } catch (e) {
               pdf.text("IMAGE ATTACHMENT [SECURED]", 15, yPos + 25);
             }
          }

          pdf.setFontSize(12);
          const displayContent = mem.type === 'text' ? mem.content : `FILE_REF: ${mem.type.toUpperCase()}_DATA`;
          const splitText = pdf.splitTextToSize(`CONTENT: ${displayContent}`, pageWidth - 30);
          pdf.text(splitText, 15, yPos + 27);
          
          yPos += 20 + (splitText.length * 6);
        });
      }
    });

    pdf.save(`Family_Protocol_${new Date().getFullYear()}.pdf`);
    addLog("FULL ARCHIVE EXPORTED TO PDF.");
  };

  if (appState === 'SELECTION') {
    return (
      <div className="App container d-flex flex-column justify-content-center align-items-center" style={{height: '100vh'}}>
        <div className="text-center w-100" style={{maxWidth: '400px'}}>
          <h1 className="cursor-blink">MEMORY TREE PROTOCOL</h1>
          <p className="mb-5 text-muted">SECURE ARCHIVE v1.2.0</p>
          
          <div className="mb-4">
            <button className="btn btn-lg btn-primary w-100 mb-3" onClick={handleStartNewTree}>[ INITIALIZE NEW PROTOCOL ]</button>
            <div className="d-flex gap-2">
              <input 
                type="number" 
                className="form-control text-center" 
                placeholder="ENTER KEY (6-DIGITS)" 
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
              />
              <button className="btn btn-secondary" onClick={handleLoadByKey}>LOAD</button>
            </div>
          </div>
        </div>
        <div className="mt-5 w-100 p-3" style={{border: '1px solid #333', backgroundColor: '#050505', maxWidth: '600px'}}>
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
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="p-2 flex-grow-1 me-3" style={{border: '1px solid #333', backgroundColor: '#050505', fontSize: '0.8rem'}}>
            {logs.map((log, i) => <div key={i}>{log}</div>)}
          </div>
          <div className="text-end">
            <div className="small text-muted">ACTIVE PROTOCOL</div>
            <div className="fw-bold text-success">{memoryTree.protocolKey}</div>
            <button className="btn btn-sm btn-outline-danger mt-1" onClick={() => setAppState('SELECTION')}>TERMINATE SESSION</button>
          </div>
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