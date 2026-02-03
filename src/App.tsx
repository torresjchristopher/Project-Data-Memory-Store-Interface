import { useState, useEffect } from 'react';
import './App.css';
import ModernGallery from './components/ModernGallery';
import { PersistenceService } from './services/PersistenceService';
import type { MemoryTree } from './types';
import { ExportService } from './services/ExportService';
import { MemoryBookPdfService } from './services/MemoryBookPdfService';
import { subscribeToMemoryTree } from './services/TreeSubscriptionService';

const MURRAY_PROTOCOL_KEY = "MURRAY_LEGACY_2026";

function App() {
  const [memoryTree, setMemoryTree] = useState<MemoryTree>({
    protocolKey: MURRAY_PROTOCOL_KEY,
    familyName: 'The Murray Family',
    people: [],
    memories: [],
  });

  // Initialize local persistence + project Firebase tree into UI state
  useEffect(() => {
    PersistenceService.getInstance();

    const unsub = subscribeToMemoryTree(MURRAY_PROTOCOL_KEY, (partial) => {
      setMemoryTree((prev) => ({
        ...prev,
        ...partial,
        protocolKey: MURRAY_PROTOCOL_KEY,
        familyName: 'The Murray Family',
      }));
    });

    return () => unsub();
  }, []);

  const handleExport = async (format: 'ZIP' | 'PDF') => {
    try {
      let blob: Blob;
      
      if (format === 'PDF') {
        blob = await MemoryBookPdfService.generateMemoryBook(memoryTree, memoryTree.familyName);
      } else {
        const exportService = ExportService.getInstance();
        blob = await exportService.exportAsZip(memoryTree, '', { includeMedia: true });
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Murray_Family_${format}_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <ModernGallery 
      tree={memoryTree}
      onExport={handleExport}
    />
  );
}

export default App;
