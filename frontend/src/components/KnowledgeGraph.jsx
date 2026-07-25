import React from 'react'

export default function KnowledgeGraph({ graphNodes, graphConnections, hoveredNode, setHoveredNode }) {
  return (
    <section id="graph" className="max-w-8xl mx-auto px-4 py-24 border-t border-slate-200 space-y-12 text-center relative">
      <div className="space-y-3">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F]">Connected Story Universe</h2>
        <p className="text-slate-600 max-w-md mx-auto text-sm">Understand the big picture rather than isolated titles. Hover over nodes to see relationships.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 h-96 relative overflow-hidden shadow-sm backdrop-blur-md">
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {graphConnections.map((conn, idx) => {
            const fromNode = graphNodes.find(n => n.id === conn.from)
            const toNode = graphNodes.find(n => n.id === conn.to)
            if (!fromNode || !toNode) return null
            return (
              <line
                key={idx}
                x1={`${fromNode.x}%`}
                y1={fromNode.y}
                x2={`${toNode.x}%`}
                y2={toNode.y}
                className="stroke-[#7C3AED]/20 stroke-[2] transition-colors duration-300"
                style={{
                  stroke: hoveredNode === conn.from || hoveredNode === conn.to ? '#7C3AED' : 'rgba(124, 58, 237, 0.1)'
                }}
              />
            )
          })}
        </svg>

        {graphNodes.map((node) => (
          <div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{ left: `${node.x}%`, top: node.y }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <div 
              className="w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center shadow shadow-violet-500/10"
              style={{
                backgroundColor: node.color,
                transform: hoveredNode === node.id ? 'scale(1.4)' : 'scale(1)'
              }}
            />
            <span className="block mt-2 text-xs font-bold text-slate-700 group-hover:text-[#7C3AED] transition-colors">
              {node.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
