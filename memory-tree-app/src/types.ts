export type MemoryType = 'text' | 'image' | 'audio' | 'video' | 'document' | 'pdf';

export interface Person {
  id: string;
  name: string;
  birthYear: number; // Critical for Ring Logic (Oldest = Inner Ring)
  parentId?: string;
  avatarUrl?: string;
}

export interface Memory {
  id: string;
  type: MemoryType;
  content: string; // Text content or URL for media
  location: string;
  timestamp: Date;
  // Tags system: Can be tagged to specific people OR the whole family
  tags: {
    personIds: string[]; // Specific people
    isFamilyMemory: boolean; // "The Murrays" general memory
  };
}

export interface MemoryTree {
  protocolKey?: string;
  familyName: string; // e.g., "The Murrays"
  people: Person[];
  memories: Memory[];
}
