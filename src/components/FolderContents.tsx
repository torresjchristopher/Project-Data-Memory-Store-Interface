import React from 'react';
import type { FolderItem } from '../utils/folderStructure';
import type { Memory } from '../types';

interface FolderContentsProps {
  folder: FolderItem;
  onNavigate: (path: string) => void;
  onOpenItem: (item: FolderItem) => void;
}

export const FolderContents: React.FC<FolderContentsProps> = ({
  folder,
  onNavigate,
  onOpenItem,
}) => {
  const items = folder.children || [];

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-full bg-white/50">
        <span className="text-4xl mb-4 opacity-50">📂</span>
        <p className="text-sm">This folder is empty</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full bg-white">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <FileGridItem
            key={item.path}
            item={item}
            onClick={() => {
              if (item.type === 'folder' || item.type === 'person') {
                onNavigate(item.path);
              } else {
                onOpenItem(item);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

const FileGridItem: React.FC<{ item: FolderItem; onClick: () => void }> = ({ item, onClick }) => {
  const isFolder = item.type === 'folder' || item.type === 'person';
  const memoryData = item.data as Memory | undefined;
  
  // Try to get thumbnail from content if it's an image memory
  let thumbnailUrl: string | undefined;
  if (memoryData?.type === 'image') {
      const parts = memoryData.content.split('|DELIM|');
      if (parts.length > 1 && parts[1].startsWith('http')) {
          thumbnailUrl = parts[1];
      }
  }

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col items-center p-4 rounded-xl border border-transparent hover:bg-blue-50 hover:border-blue-100 transition-all cursor-pointer text-center"
    >
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 flex items-center justify-center text-4xl sm:text-5xl transition-transform group-hover:scale-105">
        {thumbnailUrl ? (
            <img 
                src={thumbnailUrl} 
                alt={item.name} 
                className="w-full h-full object-cover rounded shadow-sm"
                loading="lazy"
            />
        ) : (
            <span className="drop-shadow-sm filter">{item.icon}</span>
        )}
        
        {/* Badge for item count in folders */}
        {isFolder && item.count !== undefined && item.count > 0 && (
            <span className="absolute -top-1 -right-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-gray-200 shadow-sm">
                {item.count}
            </span>
        )}
      </div>
      
      <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-700 line-clamp-2 break-words w-full px-1">
        {item.name}
      </span>
      
      {/* Tooltip on hover (simple title) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10">
        {item.name}
      </div>
    </div>
  );
};
