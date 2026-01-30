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

  // Auto-save whenever tree changes
  useEffect(() => {
    if (memoryTree.protocolKey) {
      localStorage.setItem(`MT_PROTO_${memoryTree.protocolKey}`, JSON.stringify(memoryTree));
    }
  }, [memoryTree]);

  const handleStartNewTree = () => {
    const newKey = Math.floor(100000 + Math.random() * 900000).toString();
    const rootPerson: Person = { id: 'root', name: 'Family Root' };
    setMemoryTree({
      protocolKey: newKey,
      people: [rootPerson],
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

  const handleAddMemory = (newMemory: Memory) => {
    setMemoryTree(prev => ({
      ...prev,
      memories: [...prev.memories, newMemory]
    }));
  };

  const handleAddPerson = (newPerson: Person) => {
    setMemoryTree(prev => ({
      ...prev,
      people: [...prev.people, newPerson]
    }));
  };

  const handleExportClick = async () => {
    const treeElement = document.getElementById('tree-container');
    if (!treeElement) return;

    // Use a higher scale for better resolution in PDF
    const canvas = await html2canvas(treeElement, { 
      backgroundColor: '#ffffff',
      scale: 2
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 1. Title Page
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    pdf.setTextColor(60, 60, 60);
    pdf.setFont("times", "bold");
    pdf.setFontSize(30);
    pdf.text("Family Memory Archive", pageWidth/2, 50, { align: 'center' });
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.text("Preserving moments for generations", pageWidth/2, 65, { align: 'center' });
    
    pdf.setDrawColor(85, 107, 47); // Olive green
    pdf.setLineWidth(0.5);
    pdf.line(40, 75, pageWidth-40, 75);
    
    pdf.setFontSize(12);
    pdf.text(`Family Members: ${memoryTree.people.length}`, 40, 100);
    pdf.text(`Recorded Memories: ${memoryTree.memories.length}`, 40, 110);
    pdf.text(`Created: ${new Date().toLocaleDateString()}`, 40, 120);

    // 2. Tree Visualization
    pdf.addPage();
    pdf.setTextColor(44, 62, 80);
    pdf.setFontSize(18);
    pdf.text("Family Tree Visualization", 15, 20);
    const imgProps = pdf.getImageProperties(imgData);
    const pdfImgWidth = pageWidth - 20;
    const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 10, 30, pdfImgWidth, pdfImgHeight);

    // 3. Detailed Records
    memoryTree.people.forEach((person) => {
      const personMemories = memoryTree.memories.filter(m => m.personIds.includes(person.id));
      if (personMemories.length > 0) {
        pdf.addPage();
        
        // Header background
        pdf.setFillColor(245, 245, 240); // Off-white
        pdf.rect(0, 0, pageWidth, 30, 'F');
        
        pdf.setTextColor(85, 107, 47); // Olive Green
        pdf.setFont("times", "bold");
        pdf.setFontSize(22);
        pdf.text(person.name, 15, 20);
        
        let yPos = 45;
        personMemories.forEach((mem, idx) => {
          if (yPos > pageHeight - 60) {
            pdf.addPage();
            yPos = 20;
          }

          // Separator
          pdf.setDrawColor(200, 200, 200);
          pdf.line(15, yPos, pageWidth - 15, yPos);
          yPos += 10;
          
          pdf.setTextColor(60, 60, 60);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(12);
          pdf.text(mem.type.charAt(0).toUpperCase() + mem.type.slice(1) + " Memory", 15, yPos);
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.text(new Date(mem.timestamp).toLocaleDateString(), pageWidth - 15, yPos, { align: 'right' });
          
          yPos += 7;
          pdf.setFont("helvetica", "italic");
          pdf.text(mem.location, 15, yPos);
          yPos += 8;

          if (mem.type === 'image' && mem.content.startsWith('data:image')) {
             try {
               // Limit image height
               pdf.addImage(mem.content, 'JPEG', 15, yPos, 60, 45);
               yPos += 50;
             } catch (e) {
               pdf.text("[Image Attached]", 15, yPos + 5);
               yPos += 10;
             }
          }

          pdf.setFont("times", "normal");
          pdf.setFontSize(12);
          const displayContent = mem.type === 'text' ? mem.content : `[Attached File: ${mem.type}]`;
          const splitText = pdf.splitTextToSize(displayContent, pageWidth - 30);
          pdf.text(splitText, 15, yPos + 5);
          
          yPos += 10 + (splitText.length * 6);
        });
      }
    });

    pdf.save(`Family_History_${new Date().getFullYear()}.pdf`);
  };

  if (appState === 'SELECTION') {
    return (
      <div className="App container-fluid p-0">
        <div className="row g-0" style={{ minHeight: '100vh' }}>
          {/* Left Side: Visual/Branding */}
          <div className="col-lg-6 d-none d-lg-flex bg-primary flex-column justify-content-center align-items-center text-white p-5" 
               style={{ 
                 backgroundImage: 'linear-gradient(rgba(85, 107, 47, 0.8), rgba(85, 107, 47, 0.9)), url("https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1000&q=80")', 
                 backgroundSize: 'cover',
                 backgroundPosition: 'center'
               }}>
            <div className="text-center" style={{ maxWidth: '450px' }}>
              <h1 className="display-3 fw-bold mb-4 text-white border-0 shadow-text" style={{ fontFamily: 'var(--app-font-heading)' }}>
                Your Family's Living Legacy
              </h1>
              <p className="lead opacity-75">
                A private, secure place to preserve stories, photos, and connections for the generations to come.
              </p>
            </div>
          </div>

          {/* Right Side: Action Center */}
          <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center bg-white p-4">
            <div className="p-4 p-md-5 text-center" style={{ maxWidth: '480px', width: '100%' }}>
              <div className="mb-5">
                <div className="d-inline-block p-3 rounded-circle bg-light mb-4">
                   <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#556b2f" viewBox="0 0 16 16">
                    <path d="M8.416.223a.5.5 0 0 0-.832 0l-3 4.5A.5.5 0 0 0 5 5.5h.098L3.076 8.735A.5.5 0 0 0 3.5 9.5h.193L1.516 11.518A.5.5 0 0 0 1.5 12.5h13a.5.5 0 0 0 .5-.5.5.5 0 0 0-.154-.368L12.307 9.5h.193a.5.5 0 0 0 .424-.765L10.902 5.5H11a.5.5 0 0 0 .416-.777l-3-4.5zM7.5 4.5h1V1.123L11.25 4.5h-1a.5.5 0 0 0-.416.777l1.98 2.97h-.193a.5.5 0 0 0-.424.765l1.98 2.97H2.827l1.98-2.97a.5.5 0 0 0-.424-.765h-.193l1.98-2.97a.5.5 0 0 0 .416-.777h-1L7.5 1.123V4.5z"/>
                  </svg>
                </div>
                <h2 className="fw-bold mb-2">Welcome Back</h2>
                <p className="text-muted">Initialize a new archive or continue your journey.</p>
              </div>
              
              <div className="d-grid gap-3">
                <button className="btn btn-primary btn-lg py-3 shadow-sm" onClick={handleStartNewTree}>
                  Start New Family Tree
                </button>
                
                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1" />
                  <span className="mx-3 text-muted small fw-bold">OR LOAD EXISTING</span>
                  <hr className="flex-grow-1" />
                </div>

                <div className="input-group input-group-lg mb-3">
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Enter 6-digit key" 
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                  />
                  <button className="btn btn-secondary px-4" onClick={handleLoadByKey}>Load</button>
                </div>
                <p className="small text-muted">
                  Forgotten your key? Check your exported PDF archives.
                </p>
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
        onExportClick={handleExportClick}
      />
      <main className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm border">
          <div>
            <div className="small text-muted text-uppercase" style={{letterSpacing: '1px'}}>Family Access Key</div>
            <div className="fw-bold fs-4 text-success">{memoryTree.protocolKey}</div>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setAppState('SELECTION')}>
            Exit Tree
          </button>
        </div>
        
        {showAddMemoryForm && (
          <AddMemoryForm 
            people={memoryTree.people}
            onAddMemory={handleAddMemory}
            onAddPerson={handleAddPerson}
            onCancel={() => setShowAddMemoryForm(false)}
          />
        )}
        
        <div id="tree-container" className="mb-5">
          <TreeDisplay tree={memoryTree} />
        </div>
        
        <MemoryList memories={memoryTree.memories} people={memoryTree.people} />
      </main>
    </div>
  )
}

export default App;