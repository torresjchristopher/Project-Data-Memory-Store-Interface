import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/DesignSystem.css';
import './styles/Magazine.css';
import './styles/Dashboard.css';
import './styles/Fluid.css';
import './styles/Auth.css';
import './App.css';
import MemoryBrowser from './components/MemoryBrowser';
import TimelineView from './components/TimelineView';
import ArtifactDeepView from './components/ArtifactDeepView';
import WelcomeDashboard from './components/WelcomeDashboard';
import LandingPage from './components/LandingPage';
import { PersistenceService, type SyncStatus } from './services/PersistenceService';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import type { MemoryTree, Memory, Person } from './types';
// Firebase Imports
import { db } from './firebase';
import { doc, collection, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { ExportService } from './services/ExportService';
import { MemoryBookPdfService } from './services/MemoryBookPdfService';

type AppState = 'AUTH' | 'ACTIVE';
type ViewMode = 'DASHBOARD' | 'MEMORIES' | 'TIMELINE';
type DisplayStyle = 'GALLERY' | 'LEDGER';

const MURRAY_PROTOCOL_KEY = "MURRAY_LEGACY_2026";

function App() {
  const [appState, setAppState] = useState<AppState>('AUTH');
  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>('GALLERY');
  const [selectedArtifact, setSelectedArtifact] = useState<Memory | null>(null);
  const [familyBio, setFamilyBio] = useState<string>('');
  const [, setSyncStatus] = useState('Initiating...');
  const [, setSyncStatusObj] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSyncTime: null,
    pendingOperations: 0,
    syncInProgress: false,
    status: 'IDLE',
  });

  const [selectedPersonId, setSelectedPersonId] = useState<string>('');

  const [memoryTree, setMemoryTree] = useState<MemoryTree>({
    protocolKey: MURRAY_PROTOCOL_KEY,
    familyName: 'The Murray Family',
    people: [],
    memories: [],
  });

  // --- OFFLINE PERSISTENCE INITIALIZATION ---
  useEffect(() => {
    const persistence = PersistenceService.getInstance();
    
    // Listen to sync status changes
    const unsubscribeSyncStatus = persistence.onSyncStatusChange((status) => {
      setSyncStatusObj(status);
      // Update user-friendly message
      if (!status.isOnline) {
        setSyncStatus('Offline Mode');
      } else if (status.status === 'SYNCING') {
        setSyncStatus('Syncing...');
      } else if (status.pendingOperations > 0) {
        setSyncStatus(`${status.pendingOperations} Pending`);
      } else {
        setSyncStatus('Vault Online');
      }
    });

    // Load cached data on startup (before Firebase sync)
    const loadCachedData = async () => {
      try {
        const [cachedPeople, cachedMemories, cachedBio] = await Promise.all([
          persistence.loadPeople(MURRAY_PROTOCOL_KEY),
          persistence.loadMemories(MURRAY_PROTOCOL_KEY),
          persistence.loadFamilyBio(MURRAY_PROTOCOL_KEY),
        ]);

        if (cachedPeople.length > 0 || cachedMemories.length > 0) {
          setMemoryTree(prev => ({
            ...prev,
            people: cachedPeople,
            memories: cachedMemories,
          }));
          if (cachedBio) {
            setFamilyBio(cachedBio);
          }
          setSyncStatus('Loaded from Cache');
        }
      } catch (e) {
        console.error('Failed to load cached data:', e);
      }
    };

    loadCachedData();

    return () => {
      unsubscribeSyncStatus();
    };
  }, []);

  // --- SECURE CONNECTION & REAL-TIME SYNC ---
  useEffect(() => {
    const auth = getAuth();
    let unsubs: (() => void)[] = [];

    const setupSync = () => {
      const treeRef = doc(db, "trees", MURRAY_PROTOCOL_KEY);
      
      // Sync root info (Family Bio)
      unsubs.push(onSnapshot(treeRef, (docSnap) => {
        if (docSnap.exists()) {
          setFamilyBio(docSnap.data().familyBio || '');
        }
      }));

      // Sync people
      unsubs.push(onSnapshot(collection(treeRef, "people"), (snap) => {
        const peopleList = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Person));
        setMemoryTree(prev => ({ ...prev, people: peopleList }));
        setSyncStatus('Vault Online');
      }, (err) => {
        console.error("People sync error:", err);
        setSyncStatus('Sync Error');
      }));

      // Sync memories
      unsubs.push(onSnapshot(collection(treeRef, "memories"), (snap) => {
        const memoriesList = snap.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
            } as Memory;
        });
        setMemoryTree(prev => ({ ...prev, memories: memoriesList }));
      }));
    };

    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setupSync();
      } else {
        signInAnonymously(auth).catch(err => {
          console.error("Auth error:", err);
          setSyncStatus('Handshake Failed');
        });
      }
    });

    return () => {
      authUnsub();
      unsubs.forEach(u => u());
    };
  }, []);

  const handleMurrayAuth = () => {
    // Auth is now handled by LandingPage component
    setAppState('ACTIVE');
  };

  const filteredMemories = memoryTree.memories.filter(m => {
    const personMatch = !selectedPersonId || m.tags.personIds.includes(selectedPersonId);
    return personMatch;
  });

  const handleExportMemoryBook = async (exportFormat: 'ZIP' | 'HTML' | 'PDF' = 'ZIP', theme: 'CLASSIC' | 'MODERN' | 'MINIMAL' = 'CLASSIC') => {
    setSyncStatus('Exporting Archive...');
    try {
      let blob: Blob;
      
      if (exportFormat === 'PDF') {
        blob = await MemoryBookPdfService.generateMemoryBook(memoryTree, memoryTree.familyName);
      } else {
        const exportService = ExportService.getInstance();
        if (exportFormat === 'ZIP') {
          blob = await exportService.exportAsZip(memoryTree, familyBio, { 
            includeMedia: true, 
            theme 
          });
        } else {
          blob = await exportService.exportAsHTML(memoryTree);
        }
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = exportFormat === 'PDF' ? 'pdf' : (exportFormat === 'ZIP' ? 'zip' : 'html');
      link.download = `${memoryTree.familyName.replace(/\s+/g, '_')}_MemoryBook_${new Date().toISOString().split('T')[0]}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSyncStatus('Export Complete');
    } catch (e) {
      console.error("Export Error:", e);
      alert("Export failed: " + (e as any).message);
      setSyncStatus('Export Error');
    }
  };

  if (appState === 'AUTH') {
    return (
      <LandingPage 
        onAuthSuccess={() => {
          setAppState('ACTIVE');
          handleMurrayAuth();
        }}
      />
    );
  }

  return (
    <div className="app-layout">
      <aside className="sidebar-rail shadow-sm">
        <div className="d-flex align-items-center justify-content-between gap-3 mb-5 px-3">
            <span className="fw-bold tracking-tight h5 mb-0" style={{ color: 'var(--navy-primary)', fontSize: '1.1rem' }}>Schnitzel Bank</span>
            <button className="btn btn-link text-muted p-0" style={{ fontSize: '0.8rem' }} onClick={() => setViewMode('DASHBOARD')} title="Home">◆</button>
        </div>

        <nav className="flex-grow-1">
            <div className={`nav-item-modern ${viewMode === 'MEMORIES' ? 'active' : ''}`} onClick={() => setViewMode('MEMORIES')} style={{ cursor: 'pointer', padding: '0.75rem 1rem', marginBottom: '0.5rem', borderLeft: viewMode === 'MEMORIES' ? '3px solid var(--gold-accent)' : '3px solid transparent', color: viewMode === 'MEMORIES' ? 'var(--navy-primary)' : 'var(--text-secondary)', fontWeight: viewMode === 'MEMORIES' ? '600' : '500' }}>
                Memories
            </div>
            <div className={`nav-item-modern ${viewMode === 'TIMELINE' ? 'active' : ''}`} onClick={() => setViewMode('TIMELINE')} style={{ cursor: 'pointer', padding: '0.75rem 1rem', marginBottom: '0.5rem', borderLeft: viewMode === 'TIMELINE' ? '3px solid var(--gold-accent)' : '3px solid transparent', color: viewMode === 'TIMELINE' ? 'var(--navy-primary)' : 'var(--text-secondary)', fontWeight: viewMode === 'TIMELINE' ? '600' : '500' }}>
                Timeline
            </div>

            <div className="mt-5 px-3">
                <h6 className="small text-uppercase tracking-widest opacity-30 fw-bold mb-3" style={{ fontSize: '0.55rem' }}>Recent Artifacts</h6>
                {memoryTree.memories.slice(0, 3).map(m => (
                    <div key={m.id} className="small mb-2 text-truncate cursor-pointer opacity-60 hover:opacity-100 transition-all" style={{ fontSize: '0.7rem' }} onClick={() => setSelectedArtifact(m)}>
                        {new Date(m.timestamp).getFullYear()} • {m.content.split('|DELIM|')[0] || 'Artifact'}
                    </div>
                ))}
            </div>
        </nav>

        <div className="mt-auto border-top pt-4">
            <div className="mb-4">
              <SyncStatusIndicator compact />
            </div>
            <div className="d-flex gap-2 mb-2">
              <button className="btn btn-secondary flex-grow-1" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.5rem' }} onClick={() => handleExportMemoryBook('ZIP', 'CLASSIC')}>ZIP</button>
              <button className="btn btn-secondary flex-grow-1" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.5rem' }} onClick={() => handleExportMemoryBook('PDF', 'CLASSIC')}>PDF</button>
            </div>
            <button className="btn btn-secondary w-100" style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.5rem' }} onClick={() => handleExportMemoryBook('PDF', 'CLASSIC')}>📖 Memory Book (PDF)</button>
        </div>
      </aside>

      <main className="main-content-area">
        <header className="d-flex justify-content-between align-items-end mb-5">
            <div>
                <h1 className="display-6 mb-1" style={{ color: 'var(--royal-indigo)' }}>{viewMode === 'MEMORIES' ? 'Memory Collection' : 'Timeline'}</h1>
                <p className="text-muted small text-uppercase tracking-widest mb-0" style={{ fontSize: '0.65rem' }}>Sovereign Infrastructure • Encrypted</p>
            </div>
            
            {viewMode === 'MEMORIES' && (
                <div className="d-flex gap-2">
                    <button className={`view-toggle-btn ${displayStyle === 'GALLERY' ? 'active' : ''}`} onClick={() => setDisplayStyle('GALLERY')}>Gallery</button>
                    <button className={`view-toggle-btn ${displayStyle === 'LEDGER' ? 'active' : ''}`} onClick={() => setDisplayStyle('LEDGER')}>Ledger</button>
                </div>
            )}
        </header>

        {viewMode === 'DASHBOARD' && (
            <WelcomeDashboard 
              familyName={memoryTree.familyName}
              totalMemories={memoryTree.memories.length}
              totalPeople={memoryTree.people.length}
              lastUpdated={memoryTree.memories.length > 0 ? new Date(memoryTree.memories[0].timestamp) : undefined}
              onBrowseMemories={() => setViewMode('MEMORIES')}
              onBrowseTimeline={() => setViewMode('TIMELINE')}
              onBrowsePeople={() => setViewMode('MEMORIES')}
              onExport={() => handleExportMemoryBook('ZIP', 'CLASSIC')}
            />
        )}

        {viewMode === 'MEMORIES' && (
            <div className="animate-slide-up">
                <MemoryBrowser tree={memoryTree} onArtifactClick={setSelectedArtifact} />
            </div>
        )}

        {viewMode === 'TIMELINE' && (
            <div className="animate-slide-up">
                <TimelineView memories={filteredMemories} people={memoryTree.people} onSelectPerson={(id) => { setSelectedPersonId(id); setViewMode('MEMORIES'); }} />
            </div>
        )}

        {selectedArtifact && (
            <ArtifactDeepView 
                artifact={selectedArtifact} 
                people={memoryTree.people} 
                onClose={() => setSelectedArtifact(null)} 
            />
        )}
      </main>
    </div>
  );
}

export default App;