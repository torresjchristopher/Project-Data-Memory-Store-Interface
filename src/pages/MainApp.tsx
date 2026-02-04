import type { MemoryTree } from '../types';
import Dashboard from './Dashboard';

interface MainAppProps {
  tree: MemoryTree;
  onExport: (format: 'ZIP' | 'PDF') => void;
}

export default function MainApp({ tree, onExport }: MainAppProps) {
  return (
    <div className="min-h-screen bg-[#05080f]">
      <Dashboard tree={tree} onExport={onExport} />
    </div>
  );
}