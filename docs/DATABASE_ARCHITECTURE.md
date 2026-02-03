# Schnitzel Bank Database Architecture

## Critical Design: THREE-LAYER SEPARATION

The database, service logic, and UI are **completely decoupled**. This means:

- **If the UI breaks**, the database continues working
- **If the database is down**, the UI gracefully handles offline mode
- **Testing is independent** - database can be tested without any React code

```
┌─────────────────────────────────────────────────────────────┐
│                     React UI Layer                           │
│  (Can be deleted entirely without affecting the database)   │
│  - Components (App.tsx, MemoryList, AddPersonForm, etc)     │
│  - Page views (Dashboard, Memories, Timeline)               │
│  - Presentation logic only                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  (PURE DATA LOGIC - NO UI IMPORTS)                           │
│  - DatabaseService (Firebase Firestore)                     │
│  - PersistenceService (IndexedDB)                           │
│  - TreeModel (Data transformation)                          │
│  - ArchiveService (Sync coordination)                       │
│  - ExportService (ZIP/HTML generation)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               Database Layer                                 │
│  (IMMUTABLE VAULT - NO SERVICE LOGIC)                        │
│  - Firebase Firestore (Cloud source of truth)               │
│  - Firebase Storage (Media storage)                         │
│  - Firebase Auth (User authentication)                      │
└─────────────────────────────────────────────────────────────┘
```

## Core Principle

**A corrupted UI cannot corrupt the database.**

The entire `src/components/` directory could be deleted and the database would continue functioning perfectly. The database has no dependencies on React, TypeScript types from components, or any UI code.

---

## Service Layer - Complete Independence

### DatabaseService (`src/services/DatabaseService.ts`)

**Status**: ✅ INDEPENDENT - ZERO UI IMPORTS

**Purpose**: Lowest-level database access. Direct Firestore interface.

**Key Methods**:
```typescript
// People Management
addPerson(person: Omit<Person, 'id'>): Promise<string>
getPerson(id: string): Promise<Person | null>
getAllPeople(): Promise<Person[]>

// Memory Management
addMemory(memory: Omit<Memory, 'id' | 'anchoredAt'>): Promise<string>
getMemory(id: string): Promise<Memory | null>
getAllMemories(): Promise<Memory[]>
getMemoriesForPerson(personId: string): Promise<Memory[]>

// Family Metadata
saveFamilyMetadata(metadata: Partial<ArchiveMetadata>): Promise<void>
getFamilyMetadata(): Promise<ArchiveMetadata | null>

// Data Integrity
verifyIntegrity(): Promise<IntegrityCheck>
exportAsJSON(): Promise<string>
exportAsBlob(): Promise<Blob>

// Protocol Security
setProtocolKey(key: string): void
```

**Testing**: See `src/services/__tests__/DatabaseService.test.ts`

**Important**: This service imports:
- ✅ Firebase modules (`firebase/firestore`, `firebase/storage`, `firebase/app`)
- ✅ Type definitions (`src/types.ts`)
- ✅ Config service (`FirebaseConfigService.ts`)
- ❌ ZERO React code
- ❌ ZERO component imports

### PersistenceService (`src/services/PersistenceService.ts`)

**Status**: ✅ INDEPENDENT - ZERO UI IMPORTS

**Purpose**: Offline-first IndexedDB cache with automatic Firebase sync

**Key Methods**:
```typescript
// Local Storage
savePerson(person: Person): Promise<void>
getPerson(id: string): Promise<Person | null>
saveMemory(memory: Memory): Promise<void>
getMemory(id: string): Promise<Memory | null>

// Sync Queue
queueOperation(op: SyncOperation): Promise<void>
getPendingOperations(): Promise<SyncOperation[]>
clearSyncQueue(): Promise<void>

// Data Integrity
verifyDataIntegrity(): Promise<IntegrityResult>
backupAllData(): Promise<Archive>
restoreFromBackup(backup: Archive): Promise<void>
```

**Capacity**: 50GB+ offline storage (browser dependent)

**Sync Strategy**: 
- When offline: Operations queue locally
- When online: Queue syncs to Firebase automatically
- Conflict resolution: Firebase wins (last-write-wins)
- Network detection: Automatic via `navigator.onLine`

**Testing**: See `src/services/__tests__/PersistenceService.test.ts`

### TreeModel (`src/services/TreeModel.ts`)

**Status**: ✅ DATA-DRIVEN - Pure transformation logic

**Purpose**: Convert flat database records into hierarchical tree structure

**Key Methods**:
```typescript
buildTree(people: Person[], memories: Memory[]): TreeNode
getStatistics(): TreeStatistics
search(query: string): Person[]
toTimelineList(): TimelineEntry[]
```

**Important**: This service transforms data but doesn't fetch it. It receives people and memories as parameters, ensuring complete separation from database logic.

### ArchiveService (`src/services/ArchiveService.ts`)

**Status**: ✅ INDEPENDENT - Contains only Firebase calls

**Purpose**: Higher-level operations coordinating multiple database tables

**Key Methods**:
```typescript
savePerson(person: Omit<Person, 'id'>): Promise<string>
depositMemory(memory: Omit<Memory, 'id' | 'anchoredAt'>): Promise<string>
depositBatch(people: Person[], memories: Memory[]): Promise<void>
updateFamilyBio(bio: string): Promise<void>
exportArchive(): Promise<Archive>
```

**Note**: This uses DatabaseService internally. It's a convenience layer.

---

## UI Layer - React Components

All React components ONLY call service methods. They NEVER:
- Import Firestore directly
- Create Firestore queries
- Access localStorage directly
- Make HTTP calls to Firebase

**Example Correct Pattern**:
```typescript
// ✅ CORRECT - Component calls service
const memory = await ArchiveService.depositMemory(newMemory);

// ❌ WRONG - Component imports Firebase directly
import { doc, setDoc } from 'firebase/firestore';
const docRef = doc(db, 'memories', id);
await setDoc(docRef, newMemory);
```

---

## Data Model

### Person
```typescript
interface Person {
  id: string;                    // Auto-generated
  name: string;                  // Required: Full name
  birthDate?: string;            // ISO format: YYYY-MM-DD
  birthYear?: number;            // Legacy support
  deathDate?: string;            // ISO format: YYYY-MM-DD
  bio?: string;                  // Biography/notes
  profileImage?: string;         // Base64 or URL
  email?: string;                // Contact info
  relationships?: {              // Family tree connections
    parents?: string[];          // Parent IDs
    siblings?: string[];         // Sibling IDs
    children?: string[];         // Child IDs
    spouse?: string;             // Spouse ID
  };
}
```

### Memory
```typescript
interface Memory {
  id: string;                    // Auto-generated
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'pdf';
  content: string;               // Text or base64 (files use |DELIM| separator)
  location?: string;             // Where memory occurred
  timestamp: Date;               // When memory occurred
  tags: {
    personIds: string[];         // Which people are in this memory
    isFamilyMemory: boolean;     // Involves whole family vs individual
    themes?: string[];           // Categories (Holiday, Milestone, etc)
  };
  anchoredAt: Date;              // When it was recorded
}
```

### ArchiveMetadata
```typescript
interface ArchiveMetadata {
  familyName: string;            // "The Murrays"
  protocolKey: string;           // Security key: "MURRAY_LEGACY_2026"
  createdAt: Date;               // Archive creation date
  lastModified: Date;            // Last update
  totalMemories: number;         // Count for performance
  totalPeople: number;           // Count for performance
}
```

---

## Firebase Structure

### Firestore Collections

```
/families/{familyId}/
├── metadata
│   └── {archive metadata}
├── people/
│   ├── {personId}
│   │   ├── name: string
│   │   ├── birthDate: string (ISO)
│   │   ├── bio: string
│   │   └── ...
├── memories/
│   ├── {memoryId}
│   │   ├── type: string
│   │   ├── content: string (base64 for files)
│   │   ├── timestamp: timestamp
│   │   ├── tags: { personIds: [], isFamilyMemory: bool, themes: [] }
│   │   └── ...
```

### Firebase Storage

```
/families/{familyId}/
├── people/
│   ├── {personId}/
│   │   └── profile.jpg
├── memories/
│   ├── {memoryId}/
│   │   ├── original.jpg
│   │   └── thumbnail.jpg
```

---

## Testing Strategy

### Unit Tests (Service Layer)

**Database Service Tests**: `src/services/__tests__/DatabaseService.test.ts`
- Tests CRUD operations in isolation
- Mocks Firebase (or uses emulator)
- Zero React code
- Run with: `npm run test:db`

**Persistence Service Tests**: `src/services/__tests__/PersistenceService.test.ts`
- Tests IndexedDB operations
- Tests offline mode
- Tests sync queue
- Run with: `npm run test:persistence`

### Integration Tests (Firebase Emulator)

```bash
# Install emulator
npm install -D @firebase/rules-unit-testing firebase-admin

# Run with emulator
npm run test:firebase-emulator
```

---

## Data Integrity Verification

### verifyIntegrity() Method

Checks for:
1. **Orphaned References**: Memories referencing non-existent people
2. **Missing Required Fields**: Incomplete person or memory records
3. **Duplicate IDs**: Same person/memory appearing twice
4. **Invalid Dates**: Malformed date strings
5. **Broken File References**: Files without content

```typescript
const integrity = await DatabaseService.verifyIntegrity();
console.log(integrity.isValid);      // true/false
console.log(integrity.issues);       // Array of problems
console.log(integrity.statistics);   // Counts and ratios
```

### backupAllData() Method

Creates timestamped backup of entire archive:

```typescript
const backup = await PersistenceService.backupAllData();
// {
//   exportedAt: Date,
//   people: Person[],
//   memories: Memory[],
//   metadata: ArchiveMetadata,
//   asJSON: string
// }
```

---

## Offline-to-Online Sync

### Flow

1. **User performs action** (add person, memory, etc)
2. **Immediately saved to IndexedDB** (offline-first)
3. **Operation queued** in sync queue
4. **User sees success immediately** (no waiting)
5. **When online**: Background sync pushes to Firebase
6. **Automatic retry** if sync fails
7. **User sees sync status** in indicator

### Sync Queue Structure

```typescript
interface SyncOperation {
  id: string;                    // Generated
  type: 'add_person' | 'add_memory' | 'update_person' | 'delete_memory';
  data: any;                     // The actual data to sync
  timestamp: Date;               // When queued
  retries: number;               // Retry count
  lastError?: string;            // Last error message
}
```

### Retry Strategy

- Max 5 retry attempts
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Failed syncs queued for next online period

---

## Production Checklist

- [x] Database service completely independent
- [x] Firebase configuration secure (env vars)
- [x] Offline persistence working
- [x] Sync queue implemented
- [x] Data integrity verification
- [x] Error handling comprehensive
- [ ] End-to-end tests passing
- [ ] Firebase emulator tests passing
- [ ] Performance tested with 1000+ memories
- [ ] Backup/restore tested
- [ ] Deployed to production

---

## Adding New Features

### Pattern: Adding a New Data Field

1. **Update Type Definition** (`src/types.ts`)
```typescript
interface Person {
  // ... existing fields
  middleName?: string;  // NEW
}
```

2. **Update Database Service** (`src/services/DatabaseService.ts`)
- No changes needed if using Firestore's flexible schema

3. **Update UI Component** (e.g., `src/components/AddPersonForm.tsx`)
```typescript
<input 
  type="text" 
  placeholder="Middle Name"
  value={formData.middleName}
  onChange={(e) => setFormData({...formData, middleName: e.target.value})}
/>
```

4. **Test Service Layer** (not UI)
```typescript
const person = { name: 'John', middleName: 'Robert' };
await DatabaseService.addPerson(person);
```

### Pattern: Adding a New Service

1. Create `src/services/NewService.ts`
2. **ZERO imports** from `src/components/`
3. Import only other services and types
4. Create test file `src/services/__tests__/NewService.test.ts`
5. Export as singleton or factory

---

## Critical Warnings

⚠️ **NEVER do this**:
```typescript
// ❌ Component importing Firebase directly
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';

// ❌ Service importing components
import AddMemoryForm from '../components/AddMemoryForm';

// ❌ Mixing business logic in components
async function handleSave() {
  const docRef = doc(db, 'memories', id);
  await setDoc(docRef, { /* data */ });
}
```

✅ **DO this instead**:
```typescript
// Service handles all logic
await ArchiveService.depositMemory(memory);

// Component just calls service
const id = await ArchiveService.depositMemory(newMemory);
setMemories([...memories, { id, ...newMemory }]);
```

---

## Contact & Emergency Recovery

If the UI is completely corrupted:

1. **Database is safe** - no code changes to database layer
2. **Recovery steps**:
   - Delete `src/components/` entirely
   - Rebuild UI from scratch using existing services
   - Data untouched in Firebase and IndexedDB

If IndexedDB is corrupted:

1. **Firebase data is safe** - source of truth
2. **Recovery steps**:
   - IndexedDB cache will rebuild on next sync
   - User performs action → triggers sync
   - Data repopulates from Firebase

If Firebase is down:

1. **Local data is safe** - IndexedDB persists
2. **User can continue** - offline mode active
3. **Auto-sync when** Firebase returns
