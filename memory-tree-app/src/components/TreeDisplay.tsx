import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { MemoryTree } from '../types';

interface TreeDisplayProps {
  tree: MemoryTree;
}

const TreeDisplay: React.FC<TreeDisplayProps> = ({ tree }) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if (tree && d3Container.current && tree.people.length > 0) {
      const svg = d3.select(d3Container.current);
      svg.selectAll("*").remove();

      const width = 800;
      const height = 500;
      
      svg.attr('viewBox', `0 0 ${width} ${height}`)
         .attr('width', '100%')
         .attr('height', 'auto');

      try {
        const root = d3.stratify()
          .id((d: any) => d.id)
          .parentId((d: any) => d.parentId)
          (tree.people);
        
        const treeLayout = d3.tree().size([height - 100, width - 200]);
        const treeData = treeLayout(root);

        const g = svg.append("g").attr("transform", "translate(100,50)");

        // Links
        g.selectAll('.link')
          .data(treeData.links())
          .enter()
          .append('path')
          .attr('d', d3.linkHorizontal()
            .x((d: any) => d.y)
            .y((d: any) => d.x) as any
          )
          .style('fill', 'none')
          .style('stroke', '#008f11')
          .style('stroke-width', '1px');

        // Nodes
        const node = g.selectAll('.node')
          .data(treeData.descendants())
          .enter()
          .append('g')
          .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

        node.append('circle')
          .attr('r', 10)
          .style('fill', '#000')
          .style('stroke', '#00ff41')
          .style('stroke-width', '2px');

        node.append('text')
          .attr('dy', '.35em')
          .attr('x', (d: any) => d.children ? -15 : 15)
          .style('text-anchor', (d: any) => d.children ? 'end' : 'start')
          .style('fill', '#00ff41')
          .style('font-family', 'Courier New')
          .text((d: any) => d.data.name);

        // Memory count indicator
        node.each(function(d: any) {
          const memoryCount = tree.memories.filter(m => m.personIds.includes(d.id)).length;
          if (memoryCount > 0) {
            const nodeG = d3.select(this);
            nodeG.append('circle')
              .attr('cx', 0)
              .attr('cy', -18)
              .attr('r', 7)
              .style('fill', '#00ff41')
              .style('stroke', '#000');
            
            nodeG.append('text')
              .attr('x', 0)
              .attr('y', -18)
              .attr('dy', '.35em')
              .style('text-anchor', 'middle')
              .style('font-size', '9px')
              .style('fill', '#000')
              .text(memoryCount);
          }
        });
      } catch (e) {
        console.error("Tree stratification failed", e);
        svg.append('text')
          .attr('x', width/2)
          .attr('y', height/2)
          .style('text-anchor', 'middle')
          .style('fill', '#ff0000')
          .style('font-family', 'Courier New')
          .text("PROTOCOL ERROR: DISCONNECTED NODES DETECTED.");
      }
    }
  }, [tree]);

  return (
    <div style={{ backgroundColor: '#000', padding: '10px', border: '1px solid #008f11' }}>
      <svg ref={d3Container} />
    </div>
  );
};

export default TreeDisplay;
