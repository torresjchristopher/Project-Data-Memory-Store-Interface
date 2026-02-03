import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { PersistenceService } from './services/PersistenceService';
import type { MemoryTree } from './types';
import { ExportService } from './services/ExportService';
import { MemoryBookPdfService } from './services/MemoryBookPdfService';
import { subscribeToMemoryTree } from './services/TreeSubscriptionService';
import YukoraLanding from './components/YukoraLanding';
import GalleryPage from './pages/GalleryPage';
import PeoplePage from './pages/PeoplePage';
import SearchPage from './pages/SearchPage';
import ExportPage from './pages/ExportPage';
import DownloadsPage from './pages/DownloadsPage';
import ArtifactCliPage from './pages/ArtifactCliPage';

const MURRAY_PROTOCOL_KEY = "MURRAY_LEGACY_2026";

function App() {
  const [memoryTree, setMemoryTree] = useState<MemoryTree>({
    protocolKey: MURRAY_PROTOCOL_KEY,
    familyName: 'The Murray Family',
    people: [],
    memories: [],
  });

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<YukoraLanding />} />
        <Route path="/gallery" element={<GalleryPage tree={memoryTree} onExport={handleExport} />} />
        <Route path="/people" element={<PeoplePage tree={memoryTree} />} />
        <Route path="/search" element={<SearchPage tree={memoryTree} />} />
        <Route path="/export" element={<ExportPage tree={memoryTree} onExport={handleExport} />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/artifact-cli" element={<ArtifactCliPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
