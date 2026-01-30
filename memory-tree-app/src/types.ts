export type MemoryType = 'text' | 'image' | 'audio' | 'video' | 'document' | 'pdf';

export interface Person {
  id: string;
  name: string;
  // generation and siblingIndex will be calculated for layout
  generation?: number;
  siblingIndex?: number;
  parentId?: string; // For building the tree structure
}

export interface Memory {
  id: string;
  type: MemoryType;
  content: string; // Text content or URL for media
  location: string;
  timestamp: Date;
  personIds: string[]; // IDs of people associated with this memory
}

export interface MemoryTree {
  protocolKey?: string;
  people: Person[];
  memories: Memory[];
}
