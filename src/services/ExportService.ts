import JSZip from 'jszip';
import { FolderTreeService } from './FolderTreeService';
import type { MemoryTree, Memory, Person } from '../types';

/**
 * ARCHIVE EXPORT SERVICE
 * Handles exporting the cascading folder structure as ZIP files
 * Supports multiple themes and offline preservation
 */

interface ExportOptions {
  includeMedia?: boolean;
  theme?: 'CLASSIC' | 'MODERN' | 'MINIMAL';
  compressionLevel?: number;
}

class ExportServiceImpl {
  /**
   * Export memory tree as ZIP archive with folder structure
   */
  async exportAsZip(
    tree: MemoryTree,
    familyBio: string,
    options: ExportOptions = {}
  ): Promise<Blob> {
    const {
      includeMedia = true,
      theme = 'CLASSIC',
      compressionLevel = 6,
    } = options;

    const folderService = FolderTreeService.getInstance();
    const archiveStructure = folderService.buildArchiveStructure(tree, familyBio);

    const zip = new JSZip();

    // Add all files to ZIP
    const files = folderService.flattenToFiles(archiveStructure.root);
    
    for (const file of files) {
      if (file.path.includes('media.') && !includeMedia) {
        continue; // Skip media files if not included
      }

      // Add README for easy navigation
      if (file.path.endsWith('family_bio.txt')) {
        this.addREADMEToZip(zip, theme);
      }

      // Handle different content types
      if (typeof file.content === 'string') {
        if (file.path.includes('http') || file.path.includes('data:')) {
          // URL - will be stored as reference
          zip.file(file.path.replace(/^.*\//, ''), file.content);
        } else {
          // Text content
          zip.file(file.path, file.content);
        }
      } else if (file.content instanceof Blob) {
        zip.file(file.path, file.content);
      }
    }

    // Add theme-specific styling
    this.addThemeStyling(zip, theme);

    // Generate ZIP
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: compressionLevel },
    });

    return blob;
  }

  /**
   * Export as interactive HTML archive (self-contained)
   */
  async exportAsHTML(
    tree: MemoryTree
  ): Promise<Blob> {
    const html = this.generateHTMLArchive(tree);
    return new Blob([html], { type: 'text/html' });
  }

  /**
   * Generate self-contained HTML archive
   */
  private generateHTMLArchive(tree: MemoryTree): string {
    const memorysByType = this.groupMemoriesByType(tree.memories);
    const memorysByPerson = this.groupMemoriesByPerson(tree.memories, tree.people);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tree.familyName} Memory Archive</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #f9fafb;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }
    header {
      background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
      color: white;
      padding: 4rem 2rem;
      border-radius: 16px;
      margin-bottom: 3rem;
      box-shadow: 0 20px 40px rgba(30, 27, 75, 0.15);
      text-align: center;
    }
    h1 {
      font-size: 2.8em;
      margin-bottom: 0.5rem;
      font-weight: 300;
      letter-spacing: -0.01em;
    }
    .subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
    }
    .timestamp {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
    }
    .stat-number {
      font-size: 2em;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .stat-label {
      font-size: 0.875rem;
      opacity: 0.9;
    }
    h2 {
      color: #1e1b4b;
      font-size: 2em;
      margin-bottom: 2rem;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 1rem;
    }
    .person-section {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(30, 27, 75, 0.08);
      border-left: 4px solid #1e1b4b;
    }
    .person-section h3 {
      color: #1e1b4b;
      border-bottom: 2px solid #d4a574;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
      font-size: 1.5em;
    }
    .memories-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .memory-item {
      padding: 1.5rem;
      background: #f9fafb;
      border-left: 3px solid #d4a574;
      border-radius: 6px;
      transition: background 200ms ease;
    }
    .memory-item:hover {
      background: #f3f4f6;
    }
    .memory-date {
      color: #1e1b4b;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      font-size: 0.875rem;
      letter-spacing: 0.05em;
    }
    .memory-text {
      color: #4b5563;
      line-height: 1.7;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    footer {
      text-align: center;
      padding: 2rem;
      color: #9ca3af;
      font-size: 0.875rem;
      border-top: 1px solid #e5e7eb;
      margin-top: 3rem;
    }
    @media (max-width: 768px) {
      .container { padding: 1.5rem; }
      h1 { font-size: 2em; }
      h2 { font-size: 1.5em; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${tree.familyName}</h1>
      <div class="subtitle">Family Heritage Archive</div>
      <div class="timestamp">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${tree.memories.length}</div>
          <div class="stat-label">Memories</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${tree.people.length}</div>
          <div class="stat-label">Members</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${Object.keys(memorysByType).length}</div>
          <div class="stat-label">Types</div>
        </div>
      </div>
    </header>

    ${Object.entries(memorysByPerson)
      .map(
        ([personId, memories]) => {
          const person = tree.people.find((p) => p.id === personId);
          if (!person) return '';
          return `
            <div class="person-section">
              <h3>👤 ${this.escapeHtml(person.name)} (b. ${person.birthYear || '?'})</h3>
              ${person.bio ? `<p style="margin-bottom: 1.5rem; color: #6b7280;">${this.escapeHtml(person.bio)}</p>` : ''}
              <div class="memories-list">
                ${memories
                  .slice(0, 50)
                  .map(
                    (m) =>
                      `<div class="memory-item">
                    <div class="memory-date">${new Date(m.timestamp || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    <div class="memory-text">${this.escapeHtml(m.content.split('|DELIM|')[0])}</div>
                  </div>`
                  )
                  .join('')}
              </div>
            </div>
          `;
        }
      )
      .join('')}

    <footer>
      <p>🏛️ <strong>${tree.familyName}</strong> Heritage Archive</p>
      <p style="margin-top: 0.5rem;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • Preserved for future generations</p>
    </footer>
  </div>
</body>
</html>`;
  }

  /**
   * Add README to ZIP for navigation
   */
  private addREADMEToZip(zip: JSZip, theme: string): void {
    const readme = `# Family Memory Archive

This is a cascading folder archive of family memories and heritage.

## Structure

- **Family_Info/**: Family biography and metadata
- **Members/**: Individual family member folders with their memories
  - Each member folder contains:
    - profile.json: Personal information
    - memories/: Organized memory folders with metadata and media
- **Collections/**: Thematic groupings (Photos, Videos, Milestones, etc.)
- **ARCHIVE_INDEX.json**: Comprehensive index of all contents

## Opening This Archive

### On Windows/Mac/Linux
Simply extract the ZIP file using your file manager.

### Viewing Metadata
All metadata is stored in JSON files for easy integration with:
- Document management systems
- Genealogy software
- Digital asset management platforms

### Accessing as Database
Convert the folder structure to:
- CSV for spreadsheet applications
- JSON for web applications
- SQLite for database applications

## Format
Theme: ${theme}
Version: 1.0.0
Generated: ${new Date().toISOString()}

## Preservation
This archive is designed for long-term preservation with:
- Human-readable folder structure
- Self-documenting JSON metadata
- No proprietary formats
- Cross-platform compatibility`;

    zip.file('README.md', readme);
  }

  /**
   * Add theme styling guide
   */
  private addThemeStyling(zip: JSZip, theme: string): void {
    const themes: Record<string, Record<string, string>> = {
      CLASSIC: {
        primary: '#1e1b4b',
        accent: '#b45309',
        description: 'Traditional navy and gold institutional styling',
      },
      MODERN: {
        primary: '#0f172a',
        accent: '#4f46e5',
        description: 'Contemporary indigo with modern accents',
      },
      MINIMAL: {
        primary: '#1a1a1a',
        accent: '#666666',
        description: 'Clean minimal grayscale',
      },
    };

    const themeData = themes[theme] || themes.CLASSIC;

    const styleGuide = `# Archive Style Guide

## Theme: ${theme}

${themeData.description}

Primary Color: ${themeData.primary}
Accent Color: ${themeData.accent}

## CSS Variables

:root {
  --primary: ${themeData.primary};
  --accent: ${themeData.accent};
  --bg: #ffffff;
  --text: #1a1a1a;
  --text-muted: #666666;
}

## Typography

Font Family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
Line Height: 1.6
Letter Spacing: 0.02em (headings)

## Layout

Max Width: 1200px
Padding: 2rem (desktop), 1rem (mobile)
Gap: 2rem
Border Radius: 12px (major), 4px (minor)`;

    zip.file('STYLE_GUIDE.md', styleGuide);
  }

  /**
   * Group memories by type
   */
  private groupMemoriesByType(memories: Memory[]): Record<string, number> {
    const groups: Record<string, number> = {};
    memories.forEach((m) => {
      groups[m.type] = (groups[m.type] || 0) + 1;
    });
    return groups;
  }

  /**
   * Group memories by person
   */
  private groupMemoriesByPerson(memories: Memory[], people: Person[]): Record<string, Memory[]> {
    const groups: Record<string, Memory[]> = {};
    people.forEach((p) => {
      groups[p.id] = memories.filter((m) => m.tags.personIds.includes(p.id));
    });
    return groups;
  }

  /**
   * Escape HTML for safe display
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

// Singleton instance
let instance: ExportServiceImpl | null = null;

export const ExportService = {
  getInstance(): ExportServiceImpl {
    if (!instance) {
      instance = new ExportServiceImpl();
    }
    return instance;
  },
};
