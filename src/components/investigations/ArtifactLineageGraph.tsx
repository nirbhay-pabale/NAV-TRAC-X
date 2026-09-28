import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Handle,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import type { NodeProps, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import {
  Search,
  Maximize2,
  Minimize2,
  Workflow,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw
} from 'lucide-react';
import type { ForensicOutcome } from '../../types/forensic';

// Dagre layout configuration
const nodeWidth = 210;
const nodeHeight = 85;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: isHorizontal ? 75 : 50,
    nodesep: isHorizontal ? 35 : 50
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

export interface CustomNodeData {
  label: string;
  sublabel: string;
  nodeType: 'document' | 'broadcast' | 'recipient' | 'decryption' | 'ledger' | 'leaked';
  badge?: string;
  icon?: string;
  status?: 'verified' | 'failed' | 'pending' | 'active';
  selected?: boolean;
  metadata?: Record<string, string>;
  [key: string]: unknown;
}

// Custom Node Renderer matching Screenshot 3 style
const LineageCustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const d = data as CustomNodeData;

  const getColorTheme = () => {
    if (d.status === 'failed') {
      return {
        border: 'border-red-500',
        bg: 'bg-red-50/90',
        badgeBg: 'bg-red-100 text-red-700 border-red-200',
        textColor: 'text-red-950',
        dot: 'bg-red-500'
      };
    }

    if (d.status === 'pending') {
      return {
        border: 'border-dashed border-slate-300',
        bg: 'bg-slate-50/70 opacity-60',
        badgeBg: 'bg-slate-100 text-slate-500 border-slate-200',
        textColor: 'text-slate-600',
        dot: 'bg-slate-400'
      };
    }

    switch (d.nodeType) {
      case 'leaked':
        return {
          border: 'border-red-400',
          bg: 'bg-red-50/90',
          badgeBg: 'bg-red-100 text-red-700 border-red-200',
          textColor: 'text-slate-900',
          dot: 'bg-red-500'
        };
      case 'recipient':
        return {
          border: 'border-amber-400',
          bg: 'bg-amber-50/80',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          textColor: 'text-slate-900',
          dot: 'bg-amber-500'
        };
      case 'decryption':
        return {
          border: 'border-emerald-400',
          bg: 'bg-emerald-50/90',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          textColor: 'text-slate-900',
          dot: 'bg-emerald-500'
        };
      case 'broadcast':
        return {
          border: 'border-purple-400',
          bg: 'bg-purple-50/80',
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
          textColor: 'text-slate-900',
          dot: 'bg-purple-500'
        };
      case 'ledger':
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-50/70',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
          textColor: 'text-slate-900',
          dot: 'bg-blue-500'
        };
      case 'document':
      default:
        return {
          border: 'border-sky-400',
          bg: 'bg-sky-50/80',
          badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
          textColor: 'text-slate-900',
          dot: 'bg-sky-500'
        };
    }
  };

  const theme = getColorTheme();

  return (
    <div
      tabIndex={0}
      className={`relative w-[210px] min-h-[78px] rounded-xl border-2 p-2.5 transition-all shadow-sm flex flex-col justify-between ${theme.bg} ${theme.border} ${
        selected ? 'ring-2 ring-blue-600 ring-offset-1 shadow-md' : 'hover:shadow-md'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-slate-400 !border-white"
      />

      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className={`w-2 h-2 rounded-full shrink-0 ${theme.dot}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
            {d.nodeType}
          </span>
        </div>
        {d.badge && (
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${theme.badgeBg}`}>
            {d.badge}
          </span>
        )}
      </div>

      <div className="font-semibold text-xs text-[#0F172A] leading-tight truncate">
        {d.label}
      </div>

      <div className="text-[10.5px] font-mono text-slate-500 truncate mt-0.5">
        {d.sublabel}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-slate-400 !border-white"
      />
    </div>
  );
};

const nodeTypes = {
  lineageNode: LineageCustomNode
};

interface ArtifactLineageGraphProps {
  outcome?: ForensicOutcome;
  caseId?: string;
  onSelectNode?: (nodeData: CustomNodeData, nodeId: string) => void;
  selectedNodeId?: string;
}

// Inner canvas component that can use ReactFlow hooks
const GraphCanvas: React.FC<ArtifactLineageGraphProps> = ({
  outcome = 'verified',
  onSelectNode,
  selectedNodeId
}) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [direction, setDirection] = useState<'LR' | 'TB'>('LR');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate node data based on outcome
  const initialNodesData = useMemo<Node[]>(() => {
    const isContradictory = outcome === 'contradictory';
    const isUnresolved = outcome === 'unresolved';

    return [
      {
        id: 'node-leaked',
        type: 'lineageNode',
        position: { x: 0, y: 0 },
        data: {
          label: 'Leaked Artifact',
          sublabel: '0x71a2...1192 (SHA3)',
          nodeType: 'leaked',
          badge: 'Hop 1',
          status: 'verified',
          metadata: {
            'Artifact Name': 'leaked_mission_plan.jpg',
            'File Hash': 'a9e4f291bb8a4e10c78912d7c00192ea7732b',
            'Resolution': '2400 x 3200 (DPI: 300)',
            'Domain': 'Spatial & Wavelet 2D'
          }
        }
      },
      {
        id: 'node-recipient',
        type: 'lineageNode',
        position: { x: 0, y: 0 },
        data: {
          label: isUnresolved ? 'Unknown Carrier' : 'INS Visakhapatnam',
          sublabel: isUnresolved ? 'Signal Inconclusive' : 'D66 (Western Fleet)',
          nodeType: 'recipient',
          badge: isUnresolved ? 'Unresolved' : 'Hop 2',
          status: isUnresolved ? 'pending' : 'verified',
          metadata: {
            'Officer': 'Cdr. A. Mehta, IN',
            'PNO': '04821-K',
            'Security Clearance': 'TOP SECRET (CODEWORD)',
            'Terminal Key': 'ML-KEM-768 v2.4'
          }
        }
      },
      {
        id: 'node-decryption',
        type: 'lineageNode',
        position: { x: 0, y: 0 },
        data: {
          label: 'Decryption Event',
          sublabel: isContradictory ? 'Syndrome Tamper' : 'EVT-88420 • Block #4,192',
          nodeType: 'decryption',
          badge: isContradictory ? 'Failed' : 'Hop 3',
          status: isContradictory ? 'failed' : isUnresolved ? 'pending' : 'verified',
          metadata: {
            'Event ID': 'EVT-88420',
            'Ledger Block': '#4,192',
            'Decryption Time': '27 Sep 2026 04:54:12Z',
            'Access Type': 'In-Memory View Only',
            'Signature Status': isContradictory ? 'TAMPERED / MISMATCH' : 'VALID ML-DSA-65'
          }
        }
      },
      {
        id: 'node-broadcast',
        type: 'lineageNode',
        position: { x: 0, y: 0 },
        data: {
          label: 'Fleet Broadcast Hub',
          sublabel: 'WNC-DISPATCH-991',
          nodeType: 'broadcast',
          badge: 'Hop 2',
          status: 'verified',
          metadata: {
            'Dispatch ID': 'DISP-2026-0926-01',
            'Target Recipients': '12 Sovereign Warships',
            'Watermark Method': 'DWT-DCT SVD Dual-Domain',
            'Channel Mode': 'EMCON Alpha Encrypted'
          }
        }
      },
      {
        id: 'node-document',
        type: 'lineageNode',
        position: { x: 0, y: 0 },
        data: {
          label: 'Canonical Document',
          sublabel: 'Mission_Plan_Bravo.pdf (v2.1)',
          nodeType: 'document',
          badge: 'Root',
          status: 'verified',
          metadata: {
            'Document ID': 'DOC-2026-BRAVO-21',
            'Classification': 'TOP SECRET (CODEWORD)',
            'Authorizing Officer': 'Rear Adm. K. R. Sharma',
            'Creation Date': '25 Sep 2026'
          }
        }
      },
      {
        id: 'node-ledger',
        type: 'lineageNode',
        position: { x: 0, y: 0 },
        data: {
          label: 'Sovereign Ledger',
          sublabel: 'Block #4,192 (ZK Proof)',
          nodeType: 'ledger',
          badge: 'Consensus',
          status: isContradictory ? 'failed' : isUnresolved ? 'pending' : 'verified',
          metadata: {
            'Block Height': '#4,192',
            'Merkle Root': '0x88f21ac04910e1a49910dca28102',
            'ZK Snark Verified': 'True (Groth16)',
            'Anchored At': '27 Sep 2026 04:55:00Z'
          }
        }
      }
    ];
  }, [outcome]);

  const initialEdgesData = useMemo<Edge[]>(() => {
    const isContradictory = outcome === 'contradictory';
    const isUnresolved = outcome === 'unresolved';

    return [
      {
        id: 'e-leaked-recipient',
        source: 'node-leaked',
        target: 'node-recipient',
        label: isUnresolved ? 'Low Signal' : 'Fingerprint Match',
        animated: outcome === 'verified',
        style: {
          stroke: isUnresolved ? '#94A3B8' : '#F59E0B',
          strokeWidth: 2,
          strokeDasharray: isUnresolved ? '4 4' : undefined
        },
        labelStyle: { fill: '#64748B', fontSize: 10, fontWeight: 600 },
        markerEnd: { type: MarkerType.ArrowClosed, color: isUnresolved ? '#94A3B8' : '#F59E0B' }
      },
      {
        id: 'e-broadcast-recipient',
        source: 'node-broadcast',
        target: 'node-recipient',
        label: 'ML-KEM wrap',
        style: { stroke: '#8B5CF6', strokeWidth: 2 },
        labelStyle: { fill: '#64748B', fontSize: 10, fontWeight: 600 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#8B5CF6' }
      },
      {
        id: 'e-recipient-decryption',
        source: 'node-recipient',
        target: 'node-decryption',
        label: isContradictory ? 'Hash Mismatch ✕' : 'Signed ML-DSA-65',
        animated: !isContradictory && !isUnresolved,
        style: {
          stroke: isContradictory ? '#EF4444' : isUnresolved ? '#94A3B8' : '#10B981',
          strokeWidth: 2,
          strokeDasharray: isContradictory || isUnresolved ? '4 4' : undefined
        },
        labelStyle: { fill: isContradictory ? '#EF4444' : '#64748B', fontSize: 10, fontWeight: 600 },
        markerEnd: { type: MarkerType.ArrowClosed, color: isContradictory ? '#EF4444' : isUnresolved ? '#94A3B8' : '#10B981' }
      },
      {
        id: 'e-document-broadcast',
        source: 'node-document',
        target: 'node-broadcast',
        label: 'Watermarked Distribution',
        style: { stroke: '#2563EB', strokeWidth: 2 },
        labelStyle: { fill: '#64748B', fontSize: 10, fontWeight: 600 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2563EB' }
      },
      {
        id: 'e-decryption-ledger',
        source: 'node-decryption',
        target: 'node-ledger',
        label: isContradictory ? 'ZK Root Invalid ✕' : 'ZK Proof Verified',
        style: {
          stroke: isContradictory ? '#EF4444' : isUnresolved ? '#94A3B8' : '#2563EB',
          strokeWidth: 2,
          strokeDasharray: isContradictory || isUnresolved ? '4 4' : undefined
        },
        labelStyle: { fill: isContradictory ? '#EF4444' : '#64748B', fontSize: 10, fontWeight: 600 },
        markerEnd: { type: MarkerType.ArrowClosed, color: isContradictory ? '#EF4444' : isUnresolved ? '#94A3B8' : '#2563EB' }
      }
    ];
  }, [outcome]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodesData, initialEdgesData, direction),
    [initialNodesData, initialEdgesData, direction]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Re-layout when direction or outcome changes
  useEffect(() => {
    const layout = getLayoutedElements(initialNodesData, initialEdgesData, direction);
    setNodes(layout.nodes);
    setEdges(layout.edges);
    setTimeout(() => fitView({ padding: 0.2 }), 50);
  }, [direction, outcome, initialNodesData, initialEdgesData, fitView, setNodes, setEdges]);

  // Handle Search Filter Highlight
  useEffect(() => {
    if (!searchTerm.trim()) {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, selected: n.id === selectedNodeId }
        }))
      );
      return;
    }

    const term = searchTerm.toLowerCase();
    setNodes((nds) =>
      nds.map((n) => {
        const d = n.data as CustomNodeData;
        const matches =
          d.label.toLowerCase().includes(term) ||
          d.sublabel.toLowerCase().includes(term) ||
          d.nodeType.toLowerCase().includes(term);
        return {
          ...n,
          data: {
            ...n.data,
            status: matches ? d.status : 'pending'
          }
        };
      })
    );
  }, [searchTerm, selectedNodeId, setNodes]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onSelectNode) {
        onSelectNode(node.data as CustomNodeData, node.id);
      }
    },
    [onSelectNode]
  );

  const toggleDirection = () => {
    setDirection((prev) => (prev === 'LR' ? 'TB' : 'LR'));
  };

  return (
    <div className={`relative bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[530px]'}`}>
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
              Artifact Lineage Graph
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
              Autonomous CF-DBS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time interactive provenance graph with quantum-resistant signature & ledger verification.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search node / hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 text-slate-800"
            />
          </div>

          {/* Dagre Layout Toggle */}
          <button
            type="button"
            onClick={toggleDirection}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            title="Toggle Dagre Layout Direction (LR / TB)"
          >
            <Workflow className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Dagre ({direction})</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Legend Row */}
      <div className="px-4 py-2 border-b border-slate-100 bg-[#F8FAFC] flex items-center gap-4 text-xs font-medium text-slate-600 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span className="text-[11.5px]">Document</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-[11.5px]">Broadcast</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-[11.5px]">Recipient</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-[11.5px]">Decryption Event</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span className="text-[11.5px]">Ledger Block</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-[11.5px]">Leaked Artifact</span>
        </div>
        <span className="text-[10.5px] text-slate-400 ml-auto italic">
          Click any node to inspect provenance metadata
        </span>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 bg-[#FBFDFF]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={1.5}
        >
          {/* Zoom controls in bottom left matching screenshot */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-1 shadow-sm">
            <button
              type="button"
              onClick={() => zoomIn()}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => zoomOut()}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fitView({ padding: 0.2 })}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              title="Fit View"
              aria-label="Fit View"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                const layout = getLayoutedElements(initialNodesData, initialEdgesData, direction);
                setNodes(layout.nodes);
                setEdges(layout.edges);
                setTimeout(() => fitView({ padding: 0.2 }), 50);
              }}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              title="Reset Layout"
              aria-label="Reset Layout"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Right Pill matching Screenshot 3 */}
          <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-full px-3 py-1 shadow-sm flex items-center gap-2 text-xs font-mono text-slate-600">
            <span>Nodes: <strong className="text-slate-900">{nodes.length}</strong></span>
            <span>•</span>
            <span>Edges: <strong className="text-slate-900">{edges.length}</strong></span>
            <span>•</span>
            <span className="text-blue-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              CF-DBS Pathfinder
            </span>
          </div>
        </ReactFlow>
      </div>
    </div>
  );
};

export const ArtifactLineageGraph: React.FC<ArtifactLineageGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <GraphCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default ArtifactLineageGraph;
