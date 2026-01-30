import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { MemoryTree, Person } from '../types';

interface TreeDisplayProps {
  tree: MemoryTree;
}

const TreeDisplay: React.FC<TreeDisplayProps> = ({ tree }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (tree && d3Container.current && tree.people.length > 0) {
      const svg = d3.select(d3Container.current);
      svg.selectAll("*").remove();

      const width = 1200;
      const height = 800;
      
      const mainSvg = svg
         .attr('viewBox', `0 0 ${width} ${height}`)
         .attr('width', '100%')
         .attr('height', 'auto')
         .style('background-color', '#fff');

      const g = mainSvg.append("g").attr("transform", "translate(50,50)");

      try {
        // 1. Prepare data - handle multiple roots by adding a virtual super-root
        const dataWithVirtualRoot = [
          { id: 'VIRTUAL_ROOT', name: '', parentId: undefined },
          ...tree.people.map(p => ({
            ...p,
            parentId: p.parentId || 'VIRTUAL_ROOT'
          }))
        ];

        const root = d3.stratify()
          .id((d: any) => d.id)
          .parentId((d: any) => d.parentId)
          (dataWithVirtualRoot);
        
        const treeLayout = d3.tree().size([height - 150, width - 250]);
        const treeData = treeLayout(root);

        // Filter out virtual root links and nodes for rendering
        const descendants = treeData.descendants().filter(d => d.id !== 'VIRTUAL_ROOT');
        const links = treeData.links().filter(l => l.source.id !== 'VIRTUAL_ROOT');

        // Links - Step-like paths
        g.selectAll('.link')
          .data(links)
          .enter()
          .append('path')
          .attr('class', 'link')
          .attr('d', (d: any) => {
            // Horizontal step-like path
            return `M${d.source.y},${d.source.x}
                    H${(d.source.y + d.target.y) / 2}
                    V${d.target.x}
                    H${d.target.y}`;
          })
          .style('fill', 'none')
          .style('stroke', '#d2b48c')
          .style('stroke-width', '2px');

        // Nodes (People Cards)
        const node = g.selectAll('.node')
          .data(descendants)
          .enter()
          .append('g')
          .attr('class', 'node')
          .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

        const cardWidth = 160;
        const cardHeight = 50;

        // Card Rectangle
        node.append('rect')
          .attr('x', -10)
          .attr('y', -cardHeight / 2)
          .attr('width', cardWidth)
          .attr('height', cardHeight)
          .attr('rx', 6)
          .style('fill', '#fff')
          .style('stroke', '#556b2f')
          .style('stroke-width', '2px')
          .style('filter', 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))');

        // Name Text
        node.append('text')
          .attr('x', 15)
          .attr('y', 4)
          .style('fill', '#2c3e50')
          .style('font-family', 'var(--app-font-body)')
          .style('font-size', '13px')
          .style('font-weight', 'bold')
          .text((d: any) => d.data.name);

        // Memory Count Badge
        node.each(function(d: any) {
          const personMemories = tree.memories.filter(m => m.personIds.includes(d.id));
          if (personMemories.length > 0) {
            const badgeG = d3.select(this).append('g');
            
            badgeG.append('circle')
              .attr('cx', cardWidth - 10)
              .attr('cy', -cardHeight / 2)
              .attr('r', 10)
              .style('fill', '#8fbc8f');

            badgeG.append('text')
              .attr('x', cardWidth - 10)
              .attr('cy', -cardHeight / 2)
              .attr('dy', '4px')
              .style('text-anchor', 'middle')
              .style('fill', '#fff')
              .style('font-size', '10px')
              .style('font-weight', 'bold')
              .text(personMemories.length);
          }
        });

      } catch (e) {
        console.error("Tree construction failed", e);
        mainSvg.append('text')
          .attr('x', width/2)
          .attr('y', height/2)
          .style('text-anchor', 'middle')
          .style('fill', '#95a5a6')
          .text("Add family members to see your tree visualization.");
      }
    }
  }, [tree]);

  return (
    <div className="card shadow-sm border-0 p-3 bg-white" style={{ borderRadius: '12px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 px-2">
        <h5 className="mb-0 fw-bold" style={{ color: '#556b2f' }}>Visual Genealogy</h5>
        <small className="text-muted">Interactive Family Map</small>
      </div>
      <div className="overflow-auto border rounded bg-light" style={{ maxHeight: '600px' }}>
        <svg ref={d3Container} />
      </div>
    </div>
  );
};

export default TreeDisplay;