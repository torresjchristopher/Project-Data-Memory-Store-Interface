import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { MemoryTree, Person } from '../types';

interface TreeDisplayProps {
  tree: MemoryTree;
  onSelectPerson: (personId: string | null) => void; // null = Family View
}

const TreeDisplay: React.FC<TreeDisplayProps> = ({ tree, onSelectPerson }) => {
  const d3Container = useRef(null);
  const [selectedId, setSelectedId] = useState<string | 'FAMILY'>('FAMILY');

  useEffect(() => {
    if (tree && d3Container.current && tree.people.length > 0) {
      const svg = d3.select(d3Container.current);
      svg.selectAll("*").remove();

      const width = 800;
      const height = 800;
      const center = { x: width / 2, y: height / 2 };
      
      const mainSvg = svg
         .attr('viewBox', `0 0 ${width} ${height}`)
         .style('background-color', '#fdfbf7')
         .style('border-radius', '50%')
         .style('box-shadow', 'inset 0 0 50px rgba(85, 107, 47, 0.1)');

      // --- LOGIC: GENERATION BANDS ---
      // 1. Sort by age (oldest first)
      const sortedPeople = [...tree.people].sort((a, b) => a.birthYear - b.birthYear);
      
      if (sortedPeople.length === 0) return;

      const oldestYear = sortedPeople[0].birthYear;
      const youngestYear = sortedPeople[sortedPeople.length - 1].birthYear;
      
      // Create bands of ~25 years (Generations)
      const generationSpan = 25;
      const bands: Person[][] = [];
      
      sortedPeople.forEach(p => {
        // older people have smaller diff, so smaller index -> inner ring
        const diff = p.birthYear - oldestYear; 
        const bandIndex = Math.floor(diff / generationSpan);
        if (!bands[bandIndex]) bands[bandIndex] = [];
        bands[bandIndex].push(p);
      });

      // Filter out empty bands in case of gaps
      const activeBands = bands.filter(b => b && b.length > 0);
      const ringSpacing = 120; // Distance between rings

      // --- DRAWING ---
      const g = mainSvg.append("g");

      // 1. Draw Rings (Wood Grain Effect)
      activeBands.forEach((_, index) => {
        const radius = (index + 1) * ringSpacing;
        g.append("circle")
          .attr("cx", center.x)
          .attr("cy", center.y)
          .attr("r", radius)
          .style("fill", "none")
          .style("stroke", "#d2b48c") // Tan wood color
          .style("stroke-width", "2px")
          .style("stroke-dasharray", "10,5")
          .style("opacity", 0.6);
          
        // Label the Ring (Generation Year Range)
        const startYear = oldestYear + (index * generationSpan);
        g.append("text")
           .attr("x", center.x)
           .attr("y", center.y - radius + 15)
           .style("text-anchor", "middle")
           .style("font-size", "10px")
           .style("fill", "#8fbc8f")
           .text(`Gen ${startYear}s`);
      });

      // 2. Center "Heart" (The Family Bank)
      const familyNode = g.append("g")
        .style("cursor", "pointer")
        .on("click", () => {
          setSelectedId('FAMILY');
          onSelectPerson(null);
        });

      familyNode.append("circle")
        .attr("cx", center.x)
        .attr("cy", center.y)
        .attr("r", 50)
        .style("fill", selectedId === 'FAMILY' ? "#556b2f" : "#8fbc8f")
        .style("stroke", "#2c3e50")
        .style("stroke-width", "4px");

      familyNode.append("text")
        .attr("x", center.x)
        .attr("y", center.y + 5)
        .style("text-anchor", "middle")
        .style("font-family", "serif")
        .style("font-weight", "bold")
        .style("fill", "#fff")
        .text(tree.familyName || "FAMILY");

      // 3. Place People on Rings
      activeBands.forEach((bandMembers, bandIndex) => {
        const radius = (bandIndex + 1) * ringSpacing;
        const angleStep = (2 * Math.PI) / bandMembers.length;

        bandMembers.forEach((person, i) => {
          const angle = (i * angleStep) - (Math.PI / 2); // Start at top
          const x = center.x + radius * Math.cos(angle);
          const y = center.y + radius * Math.sin(angle);

          const personNode = g.append("g")
            .attr("transform", `translate(${x},${y})`)
            .style("cursor", "pointer")
            .on("click", (e) => {
              e.stopPropagation();
              setSelectedId(person.id);
              onSelectPerson(person.id);
            });

          // Check if selected
          const isSelected = selectedId === person.id;

          // Node Circle
          personNode.append("circle")
            .attr("r", isSelected ? 25 : 18)
            .style("fill", "#fff")
            .style("stroke", isSelected ? "#556b2f" : "#2c3e50")
            .style("stroke-width", isSelected ? "3px" : "2px")
            .transition().duration(300);

          // Name Label
          personNode.append("text")
            .attr("y", 35)
            .style("text-anchor", "middle")
            .style("font-size", isSelected ? "14px" : "12px")
            .style("font-weight", isSelected ? "bold" : "normal")
            .style("fill", "#2c3e50")
            .style("text-shadow", "0 1px 2px rgba(255,255,255,0.8)")
            .text(person.name);
            
           // Year Label
           personNode.append("text")
            .attr("y", 48)
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .style("fill", "#7f8c8d")
            .text(person.birthYear);

          // Memory Count Badge (if any)
          const memCount = tree.memories.filter(m => m.tags.personIds.includes(person.id)).length;
          if (memCount > 0) {
            personNode.append("circle")
              .attr("cx", 15)
              .attr("cy", -15)
              .attr("r", 8)
              .style("fill", "#d2b48c");
            
            personNode.append("text")
              .attr("x", 15)
              .attr("y", -13)
              .style("text-anchor", "middle")
              .style("font-size", "9px")
              .style("fill", "#fff")
              .text(memCount);
          }
        });
      });

    }
  }, [tree, selectedId]);

  return (
    <div className="d-flex justify-content-center py-4 bg-white rounded shadow-sm">
      <div style={{ width: '100%', maxWidth: '800px', aspectRatio: '1/1' }}>
        <svg ref={d3Container} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default TreeDisplay;