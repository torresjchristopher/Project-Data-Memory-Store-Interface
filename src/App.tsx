import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { PersistenceService } from './services/PersistenceService';
import type { MemoryTree } from './types';
import { ExportService } from './services/ExportService';
import { MemoryBookPdfService } from './services/MemoryBookPdfService';
import { subscribeToMemoryTree } from './services/TreeSubscriptionService';
import LandingPage from './pages/LandingPage';
import ImmersiveGallery from './pages/ImmersiveGallery';

const MURRAY_PROTOCOL_KEY = "MURRAY_LEGACY_2026";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [memoryTree, setMemoryTree] = useState<MemoryTree>(() => {
    try {
      const cached = localStorage.getItem('schnitzel_snapshot');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          protocolKey: MURRAY_PROTOCOL_KEY,
          familyName: 'The Murray Family',
          people: Array.isArray(parsed.people) ? parsed.people : [],
          memories: Array.isArray(parsed.memories) ? parsed.memories : [],
        };
      }
    } catch (e) {
      console.error("Snapshot corruption detected, resetting...", e);
      localStorage.removeItem('schnitzel_snapshot');
    }
    
    return {
      protocolKey: MURRAY_PROTOCOL_KEY,
      familyName: 'The Murray Family',
      people: [],
      memories: [],
    };
  });

  useEffect(() => {
    try {
      PersistenceService.getInstance();
    } catch (e) {
      console.error('Persistence Init Failed:', e);
      setInitError('Vault Access Failed');
    }

    const unsub = subscribeToMemoryTree(MURRAY_PROTOCOL_KEY, (partial) => {
      console.log('[FIREBASE] Sync Update received:', Object.keys(partial));
      setMemoryTree((prev) => {
        const next = {
          ...prev,
          ...partial,
          protocolKey: MURRAY_PROTOCOL_KEY,
          familyName: 'The Murray Family',
        };
        localStorage.setItem('schnitzel_snapshot', JSON.stringify(next));
        return next;
      });
      setConnectionError(null); // Clear error on success
    }, (error) => {
      console.error('Firebase Sync Error:', error);
      setConnectionError(error.message || 'Access Restricted');
    });

    return () => unsub();
  }, []);

  const handleExport = async (format: 'ZIP' | 'PDF', updatedTree?: MemoryTree) => {
    try {
      let blob: Blob;
      const treeToExport = updatedTree || memoryTree;
      
      if (format === 'PDF') {
        blob = await MemoryBookPdfService.generateMemoryBook(treeToExport, treeToExport.familyName);
      } else {
        const exportService = ExportService.getInstance();
        blob = await exportService.exportAsZip(treeToExport, '');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Murray_Archive_${format}_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Emergency Recovery UI
  if (initError) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-12 text-center">
        <div className="w-12 h-12 rounded-full border border-red-500/50 flex items-center justify-center mb-8">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </div>
        <h1 className="text-white font-serif italic text-2xl mb-4">Vault Communication Failure</h1>
        <p className="text-white/40 text-sm max-w-xs mb-8">The archive encountered a fatal initialization error. This usually happens when the browser's local database is restricted.</p>
        <button 
          onClick={() => { localStorage.clear(); window.location.reload(); }}
          className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          Reset Local Node
        </button>
      </div>
    );
  }

  return (
    <HashRouter>
      {!isAuthenticated ? (
        <LandingPage 
          onUnlock={() => setIsAuthenticated(true)} 
          itemCount={memoryTree.memories.length} 
          error={connectionError}
        />
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/archive" replace />} />
          <Route path="/archive" element={<ImmersiveGallery tree={memoryTree} onExport={handleExport} />} />
          <Route path="*" element={<Navigate to="/archive" replace />} />
        </Routes>
      )}
    </HashRouter>
  );
}

export default App;