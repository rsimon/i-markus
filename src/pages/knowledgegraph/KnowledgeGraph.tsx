import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { GraphView } from './GraphView/GraphView';
import { GraphNode } from './Graph';

export const KnowledgeGraph = () => {

  const onSelect = (node: GraphNode) => {
    // TODO
    console.log('selected node', node.id);
  }

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page graph relative">
       {/* 
        <h1 className="text-xl font-semibold tracking-tight mb-4">Nothing to see here. (Yet.)</h1>
        <p className="text-sm text-muted-foreground max-w-lg leading-6">
          This page is just a placeholder. In the future, this might offer an 
          overview of the entire graph - i.e. not the ontology as such, but the annotations and
          their connections with the ontology terms.
        </p>
        */}

        <GraphView 
          onSelect={onSelect} />
      </main>
    </div>
  )
}