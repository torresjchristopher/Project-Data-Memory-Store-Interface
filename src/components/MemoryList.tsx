import React, { useState, useMemo } from 'react';
import type { Memory, Person, MemoryTree } from '../types';
import { TreeModel, type TreeNode } from '../services/TreeModel';

interface MemoryListProps {
  tree: MemoryTree;
  onArtifactClick: (artifact: Memory) => void;
}

/**
 * TREE-DRIVEN UI
 * This component is 100% derived from TreeModel
 * No hardcoded UI logic - everything comes from the data tree
 */
const MemoryList: React.FC<MemoryListProps> = ({ tree, onArtifactClick }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const treeModel = TreeModel.getInstance();
  const dataTree = useMemo(() => treeModel.buildTree(tree), [tree, treeModel]);

  const toggleExpanded = (nodeId: string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(nodeId)) {
      newSet.delete(nodeId);
    } else {
      newSet.add(nodeId);
    }
    setExpandedNodes(newSet);
  };

  const renderNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;

    if (node.type === 'family') {
      // Root node - render as header
      return (
        <div key={node.id} style={{ padding: '20px' }}>
          <div
            onClick={() => toggleExpanded(node.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
              color: 'white',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              marginBottom: '12px'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 16px rgba(30, 27, 75, 0.2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>🏛️ {node.label}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Family Heritage Archive</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {node.metadata.count} memories
            </div>
          </div>
          {isExpanded && (
            <div style={{ paddingLeft: '0' }}>
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    if (node.type === 'person') {
      // Person node - clickable header with count
      const person = node.data as Person;
      const birthDisplay = person.birthDate 
        ? new Date(person.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : person.birthYear?.toString() || 'Unknown';

      return (
        <div key={node.id} style={{ marginBottom: '8px' }}>
          <div
            onClick={() => toggleExpanded(node.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: isExpanded ? '#f3f4f6' : '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 150ms ease-out'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = '#f3f4f6';
              (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = isExpanded ? '#f3f4f6' : '#f9fafb';
              (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
            }}
          >
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e1b4b',
                marginBottom: '2px'
              }}>
                👤 {person.name}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#9ca3af'
              }}>
                b. {birthDisplay}
              </div>
            </div>
            <div style={{
              background: '#1e1b4b',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              minWidth: '32px',
              textAlign: 'center'
            }}>
              {node.metadata.count}
            </div>
          </div>

          {/* Memories list */}
          {isExpanded && hasChildren && (
            <div style={{ marginLeft: '16px', marginTop: '8px', borderLeft: '2px solid #d4a574', paddingLeft: '12px' }}>
              {node.children.map(memNode => renderNode(memNode, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    if (node.type === 'memory') {
      // Memory node - clickable item
      const memory = node.data as Memory;
      const memDate = new Date(memory.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return (
        <div
          key={node.id}
          onClick={() => onArtifactClick(memory)}
          style={{
            padding: '10px 12px',
            background: '#f9fafb',
            border: '1px solid #f3f4f6',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '6px',
            transition: 'all 150ms ease-out'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#f0fdf4';
            (e.currentTarget as HTMLElement).style.borderColor = '#d4a574';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#f9fafb';
            (e.currentTarget as HTMLElement).style.borderColor = '#f3f4f6';
          }}
        >
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: '#1e1b4b',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            marginBottom: '3px'
          }}>
            {memDate}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#4b5563',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: '3px'
          }}>
            {node.label}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.2px'
          }}>
            📎 {memory.type}
          </div>
        </div>
      );
    }

    return null;
  };

  if (tree.memories.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(30, 27, 75, 0.08)'
      }}>
        <h3 style={{ color: '#1e1b4b', marginBottom: '8px' }}>No Memories Yet</h3>
        <p style={{ color: '#9ca3af' }}>Add your first memory to get started</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(30, 27, 75, 0.08)',
      overflow: 'hidden'
    }}>
      {renderNode(dataTree)}
    </div>
  );
};

export default MemoryList;
