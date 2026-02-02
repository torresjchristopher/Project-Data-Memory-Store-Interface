import type { Memory, Person, MemoryTree } from '../types';

/**
 * TREE MODEL SERVICE
 * Single source of truth for the hierarchical data structure
 * All UI views derive from this model automatically
 * Data-first architecture: Database -> Model -> UI
 */

export interface TreeNode {
  id: string;
  type: 'family' | 'person' | 'memory';
  label: string;
  data: Person | Memory | { familyName: string };
  children: TreeNode[];
  metadata: {
    count: number;
    lastModified: Date;
  };
}

class TreeModelImpl {
  /**
   * Build complete tree structure from memories and people
   * This is the SINGLE SOURCE OF TRUTH for the entire app
   * All UI components read from this, never hardcode
   */
  buildTree(tree: MemoryTree): TreeNode {
    const rootNode: TreeNode = {
      id: 'root',
      type: 'family',
      label: tree.familyName,
      data: { familyName: tree.familyName },
      children: [],
      metadata: {
        count: tree.memories.length,
        lastModified: tree.memories.length > 0 
          ? new Date(Math.max(...tree.memories.map(m => new Date(m.timestamp).getTime())))
          : new Date()
      }
    };

    // Build person nodes
    const personNodes = tree.people.map(person => {
      const personMemories = tree.memories.filter(m => m.tags.personIds.includes(person.id));
      
      return {
        id: person.id,
        type: 'person' as const,
        label: person.name,
        data: person,
        children: personMemories.map(memory => ({
          id: memory.id,
          type: 'memory' as const,
          label: memory.content.split('|DELIM|')[0] || `${memory.type} from ${new Date(memory.timestamp).getFullYear()}`,
          data: memory,
          children: [],
          metadata: {
            count: 1,
            lastModified: new Date(memory.timestamp)
          }
        })),
        metadata: {
          count: personMemories.length,
          lastModified: personMemories.length > 0
            ? new Date(Math.max(...personMemories.map(m => new Date(m.timestamp).getTime())))
            : new Date()
        }
      };
    });

    rootNode.children = personNodes;
    return rootNode;
  }

  /**
   * Get flat list of all people (for dropdowns, filters)
   */
  getAllPeople(node: TreeNode): Person[] {
    return node.children
      .filter(n => n.type === 'person')
      .map(n => n.data as Person);
  }

  /**
   * Get all memories for a person
   */
  getPersonMemories(node: TreeNode, personId: string): Memory[] {
    const personNode = node.children.find(n => n.id === personId && n.type === 'person');
    if (!personNode) return [];
    return personNode.children.map(n => n.data as Memory);
  }

  /**
   * Get statistics about the tree
   */
  getStatistics(node: TreeNode): {
    totalPeople: number;
    totalMemories: number;
    memoryTypes: Record<string, number>;
    yearSpan: { min: number; max: number };
  } {
    const people = this.getAllPeople(node);
    let totalMemories = 0;
    const memoryTypes: Record<string, number> = {};
    const years: number[] = [];

    node.children.forEach(personNode => {
      if (personNode.type === 'person') {
        personNode.children.forEach(memNode => {
          if (memNode.type === 'memory') {
            const memory = memNode.data as Memory;
            totalMemories++;
            memoryTypes[memory.type] = (memoryTypes[memory.type] || 0) + 1;
            years.push(new Date(memory.timestamp).getFullYear());
          }
        });
      }
    });

    return {
      totalPeople: people.length,
      totalMemories,
      memoryTypes,
      yearSpan: years.length > 0 ? { min: Math.min(...years), max: Math.max(...years) } : { min: 0, max: 0 }
    };
  }

  /**
   * Search within the tree
   */
  search(node: TreeNode, query: string): TreeNode[] {
    const results: TreeNode[] = [];
    const lowerQuery = query.toLowerCase();

    const traverse = (n: TreeNode) => {
      if (n.label.toLowerCase().includes(lowerQuery) || 
          (n.type === 'memory' && (n.data as Memory).content.toLowerCase().includes(lowerQuery))) {
        results.push(n);
      }
      n.children.forEach(traverse);
    };

    traverse(node);
    return results;
  }

  /**
   * Export tree as JSON for backup
   */
  exportAsJSON(node: TreeNode): string {
    return JSON.stringify(node, null, 2);
  }

  /**
   * Convert tree to flat list for timeline view
   */
  toTimelineList(node: TreeNode): Array<{ memory: Memory; personName: string }> {
    const list: Array<{ memory: Memory; personName: string }> = [];

    node.children.forEach(personNode => {
      if (personNode.type === 'person') {
        const personName = (personNode.data as Person).name;
        personNode.children.forEach(memNode => {
          if (memNode.type === 'memory') {
            list.push({
              memory: memNode.data as Memory,
              personName
            });
          }
        });
      }
    });

    // Sort by date descending
    return list.sort((a, b) => 
      new Date(b.memory.timestamp).getTime() - new Date(a.memory.timestamp).getTime()
    );
  }

  /**
   * Get tree depth and breadth metrics
   */
  getMetrics(node: TreeNode): {
    depth: number;
    width: number;
    totalNodes: number;
  } {
    let maxDepth = 0;
    let totalNodes = 0;

    const traverse = (n: TreeNode, depth: number) => {
      totalNodes++;
      maxDepth = Math.max(maxDepth, depth);
      n.children.forEach(child => traverse(child, depth + 1));
    };

    traverse(node, 0);

    return {
      depth: maxDepth,
      width: node.children.length,
      totalNodes
    };
  }
}

// Singleton instance
let instance: TreeModelImpl | null = null;

export const TreeModel = {
  getInstance(): TreeModelImpl {
    if (!instance) {
      instance = new TreeModelImpl();
    }
    return instance;
  },
};
