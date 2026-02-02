/**
 * DATABASE SERVICE - COMPLETELY INDEPENDENT
 * This file has ZERO React/UI imports
 * It can be tested, run, and used completely separately from the UI
 * The database will work even if the entire UI is deleted
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  type Firestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
  type Timestamp
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

// Types (no UI types imported)
export interface Person {
  id: string;
  name: string;
  birthDate?: string;
  birthYear?: number;
  bio?: string;
  familyGroup?: string;
  lastModified?: Timestamp;
}

export interface Memory {
  id: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'pdf';
  content: string;
  location: string;
  timestamp: Timestamp | Date;
  tags: {
    personIds: string[];
    isFamilyMemory: boolean;
  };
  anchoredAt?: Timestamp;
}

export interface ArchiveMetadata {
  protocolKey: string;
  familyName: string;
  familyBio?: string;
  createdAt?: Timestamp;
  lastModified?: Timestamp;
}

/**
 * DATABASE SERVICE - Completely independent of UI
 * Can be tested in isolation, used without React, deployed separately
 */
export class DatabaseService {
  private db: Firestore;
  private storage: FirebaseStorage;
  private app: FirebaseApp;
  private protocolKey: string = 'MURRAY_LEGACY_2026';

  constructor(firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  }) {
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
  }

  /**
   * Set protocol key (vault identifier)
   */
  setProtocolKey(key: string): void {
    this.protocolKey = key;
  }

  /**
   * CRITICAL: Add a person to the database
   * Returns the person ID
   */
  async addPerson(person: Omit<Person, 'id'>): Promise<string> {
    const personId = Math.random().toString(36).substring(2, 11);
    const personRef = doc(this.db, 'trees', this.protocolKey, 'people', personId);

    const personData: Person = {
      ...person,
      id: personId,
      lastModified: serverTimestamp() as any
    };

    await setDoc(personRef, personData, { merge: true });
    console.log(`✅ Person added: ${person.name} (ID: ${personId})`);
    return personId;
  }

  /**
   * CRITICAL: Get a person from the database
   */
  async getPerson(personId: string): Promise<Person | null> {
    const personRef = doc(this.db, 'trees', this.protocolKey, 'people', personId);
    const docSnap = await getDoc(personRef);

    if (!docSnap.exists()) {
      console.log(`⚠️ Person not found: ${personId}`);
      return null;
    }

    return docSnap.data() as Person;
  }

  /**
   * CRITICAL: Get all people from the database
   */
  async getAllPeople(): Promise<Person[]> {
    const peopleRef = collection(this.db, 'trees', this.protocolKey, 'people');
    const snapshot = await getDocs(peopleRef);
    const people = snapshot.docs.map(doc => doc.data() as Person);
    console.log(`✅ Retrieved ${people.length} people from database`);
    return people;
  }

  /**
   * CRITICAL: Add a memory to the database
   * Returns the memory ID
   */
  async addMemory(memory: Omit<Memory, 'id' | 'anchoredAt'>): Promise<string> {
    const memoryId = Math.random().toString(36).substring(2, 11);
    let finalContent = memory.content;

    // Handle file uploads
    if (finalContent.includes('|DELIM|')) {
      const [text, base64] = finalContent.split('|DELIM|');
      if (base64.startsWith('data:')) {
        const storageRef = ref(this.storage, `artifacts/${this.protocolKey}/${memoryId}`);
        await uploadString(storageRef, base64, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);
        finalContent = `${text}|DELIM|${downloadURL}`;
      }
    }

    const memoryRef = doc(this.db, 'trees', this.protocolKey, 'memories', memoryId);
    const memoryData: Memory = {
      ...memory,
      id: memoryId,
      content: finalContent,
      anchoredAt: serverTimestamp() as any
    };

    await setDoc(memoryRef, memoryData, { merge: true });
    console.log(`✅ Memory added: ${memoryId}`);
    return memoryId;
  }

  /**
   * CRITICAL: Get a memory from the database
   */
  async getMemory(memoryId: string): Promise<Memory | null> {
    const memoryRef = doc(this.db, 'trees', this.protocolKey, 'memories', memoryId);
    const docSnap = await getDoc(memoryRef);

    if (!docSnap.exists()) {
      console.log(`⚠️ Memory not found: ${memoryId}`);
      return null;
    }

    return docSnap.data() as Memory;
  }

  /**
   * CRITICAL: Get all memories for a person
   */
  async getMemoriesForPerson(personId: string): Promise<Memory[]> {
    const memoriesRef = collection(this.db, 'trees', this.protocolKey, 'memories');
    const q = query(memoriesRef, where('tags.personIds', 'array-contains', personId));
    const snapshot = await getDocs(q);
    const memories = snapshot.docs.map(doc => doc.data() as Memory);
    console.log(`✅ Retrieved ${memories.length} memories for person ${personId}`);
    return memories;
  }

  /**
   * CRITICAL: Get all memories
   */
  async getAllMemories(): Promise<Memory[]> {
    const memoriesRef = collection(this.db, 'trees', this.protocolKey, 'memories');
    const snapshot = await getDocs(memoriesRef);
    const memories = snapshot.docs.map(doc => doc.data() as Memory);
    console.log(`✅ Retrieved ${memories.length} memories from database`);
    return memories;
  }

  /**
   * CRITICAL: Save family metadata
   */
  async saveFamilyMetadata(metadata: Omit<ArchiveMetadata, 'createdAt' | 'lastModified'>): Promise<void> {
    const treeRef = doc(this.db, 'trees', this.protocolKey);
    const data: ArchiveMetadata = {
      ...metadata,
      lastModified: serverTimestamp() as any
    };

    await setDoc(treeRef, data, { merge: true });
    console.log(`✅ Family metadata saved`);
  }

  /**
   * CRITICAL: Get complete archive (all people + memories)
   */
  async getCompleteArchive(): Promise<{
    metadata: ArchiveMetadata | null;
    people: Person[];
    memories: Memory[];
  }> {
    const treeRef = doc(this.db, 'trees', this.protocolKey);
    const treeSnap = await getDoc(treeRef);
    const metadata = treeSnap.exists() ? (treeSnap.data() as ArchiveMetadata) : null;

    const people = await this.getAllPeople();
    const memories = await this.getAllMemories();

    console.log(`✅ Complete archive retrieved: ${people.length} people, ${memories.length} memories`);
    return { metadata, people, memories };
  }

  /**
   * CRITICAL: Verify database integrity
   */
  async verifyIntegrity(): Promise<{
    status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
    peopleCount: number;
    memoriesCount: number;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      const people = await this.getAllPeople();
      const memories = await this.getAllMemories();

      // Check for orphaned memories (references non-existent people)
      const personIds = new Set(people.map(p => p.id));
      memories.forEach(memory => {
        memory.tags.personIds.forEach(pid => {
          if (!personIds.has(pid)) {
            errors.push(`Orphaned memory ${memory.id}: references non-existent person ${pid}`);
          }
        });
      });

      const status =
        errors.length === 0
          ? 'HEALTHY'
          : errors.length > 5
            ? 'CRITICAL'
            : 'DEGRADED';

      console.log(`🏛️ Database Integrity: ${status}`);
      if (errors.length > 0) {
        console.log(`⚠️ Issues found: ${errors.join(', ')}`);
      }

      return {
        status,
        peopleCount: people.length,
        memoriesCount: memories.length,
        errors
      };
    } catch (error) {
      console.error('❌ Integrity check failed:', error);
      return {
        status: 'CRITICAL',
        peopleCount: 0,
        memoriesCount: 0,
        errors: ['Integrity check failed: ' + (error as any).message]
      };
    }
  }

  /**
   * Export entire archive as JSON (for backup/migration)
   */
  async exportAsJSON(): Promise<string> {
    const archive = await this.getCompleteArchive();
    return JSON.stringify(archive, null, 2);
  }

  /**
   * Export entire archive as JSON Blob
   */
  async exportAsBlob(): Promise<Blob> {
    const json = await this.exportAsJSON();
    return new Blob([json], { type: 'application/json' });
  }
}

export default DatabaseService;
