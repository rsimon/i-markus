import { useState } from 'react';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { GraphView } from './GraphView';
import { Legend } from './Legend';
import { GraphNode, GraphSettings, GraphViewportTransform } from './Types';
import { SettingsPanel } from './SettingsPanel';
import { useGraph } from './useGraph';
import { NodeObject } from 'react-force-graph-2d';
import { DetailsPopup } from './DetailsPopup';

export const KnowledgeGraph = () => {

  const graph = useGraph();

  const [selectedNodes, setSelectedNodes] = useState<NodeObject<GraphNode>[]>([]);

  const [settings, setSettings] = useState<GraphSettings>({});

  const [transform, setTransform] = useState<GraphViewportTransform | undefined>();

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page graph relative">
        <div className="absolute top-4 left-6 z-10">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            <span className="bg-white/80 backdrop-blur-sm rounded px-1 py-0.5">
              Knowledge Graph
            </span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg leading-6">
            <span className="bg-white/80 backdrop-blur-sm box-decoration-clone px-1 py-0.5 rounded">
              Explore connections between images and entities. Zoom and pan the graph with your mouse.
              Grab and pull a node to re-arrange the graph. Click a node to see more information.
            </span>
          </p>
        </div>

        <GraphView 
          graph={graph}
          settings={settings}
          selected={selectedNodes}
          onSelect={node => node ? setSelectedNodes([node]) : setSelectedNodes([])}
          onUpdateViewport={transform => setTransform(() => transform)} />

        <SettingsPanel 
          settings={settings}
          onChangeSettings={setSettings} />

        <Legend />

        {selectedNodes.length > 0 && (
          <DetailsPopup
            anchor={selectedNodes[0]}
            transform={transform} />
        )}
      </main>
    </div>
  )
}