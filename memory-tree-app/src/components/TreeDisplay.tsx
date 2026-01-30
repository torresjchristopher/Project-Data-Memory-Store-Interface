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

      const width = 1000;
      const height = 600;
      
      const mainSvg = svg
         .attr('viewBox', `0 0 ${width} ${height}`)
         .attr('width', '100%')
         .attr('height', 'auto')
         .style('cursor', 'default');

      const g = mainSvg.append("g").attr("transform", "translate(100,50)");

      try {
        const root = d3.stratify()
          .id((d: any) => d.id)
          .parentId((d: any) => d.parentId)
          (tree.people);
        
        const treeLayout = d3.tree().size([height - 100, width - 300]);
        const treeData = treeLayout(root);

        // Adjust placement based on memory age
        treeData.descendants().forEach((d: any) => {
          const personMemories = tree.memories.filter(m => m.personIds.includes(d.id));
          if (personMemories.length > 0) {
            const timestamps = personMemories.map(m => new Date(m.timestamp).getTime());
            const medianTimestamp = d3.median(timestamps) || Date.now();
            const year = new Date(medianTimestamp).getFullYear();
            const currentYear = new Date().getFullYear();
            const ageFactor = Math.max(0, currentYear - year);
            d.y = d.depth * 180 + (ageFactor * 2);
          } else {
            d.y = d.depth * 180;
          }
        });

        // Links
        const link = g.selectAll('.link')
          .data(treeData.links());

        link.enter()
          .append('path')
          .attr('class', 'link')
          .merge(link as any)
          .transition().duration(750)
          .attr('d', d3.linkHorizontal()
            .x((d: any) => d.y)
            .y((d: any) => d.x) as any
          )
          .style('fill', 'none')
          .style('stroke', '#008f11')
          .style('stroke-opacity', 0.4)
          .style('stroke-width', '1.5px');

        // Nodes
        const node = g.selectAll('.node')
          .data(treeData.descendants());

        const nodeEnter = node.enter()
          .append('g')
          .attr('class', 'node')
          .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
          .style('cursor', 'pointer');

        nodeEnter.append('circle')
          .attr('r', 12)
          .style('fill', '#000')
          .style('stroke', '#00ff41')
          .style('stroke-width', '2px');

        node.merge(nodeEnter as any)
          .transition().duration(750)
          .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

        nodeEnter.append('text')
          .attr('dy', '.35em')
          .attr('x', (d: any) => d.children ? -18 : 18)
          .style('text-anchor', (d: any) => d.children ? 'end' : 'start')
          .style('fill', '#00ff41')
          .style('font-family', 'Courier New')
          .style('font-size', '14px')
          .text((d: any) => d.data.name);

        // Memory Bubbles
        node.merge(nodeEnter as any).each(function(d: any) {
          const nodeG = d3.select(this);
          nodeG.selectAll('.memory-bubble').remove();
          
          const personMemories = tree.memories.filter(m => m.personIds.includes(d.id));
          if (personMemories.length > 0) {
            const bubble = nodeG.append('g').attr('class', 'memory-bubble');
            bubble.append('circle')
              .attr('cy', -22)
              .attr('r', 8)
              .style('fill', '#00ff41');
            bubble.append('text')
              .attr('y', -22)
              .attr('dy', '.35em')
              .style('text-anchor', 'middle')
              .style('font-size', '10px')
              .style('fill', '#000')
              .text(personMemories.length);
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