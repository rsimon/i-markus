import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ImageAnnotation, createBody } from '@annotorious/react';
import { useAnnotoriousManifold, useSelection } from '@annotorious/react-manifold';
import { EntityType } from '@/model';
import { Button } from '@/ui/Button';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { EntityTypeBrowserDialog } from '@/components/EntityTypeBrowser';
import { PropertiesForm } from './PropertiesForm';
import { useStore } from '@/store';
import { isW3CRelationLinkAnnotation } from '@annotorious/plugin-connectors-react';

export const CurrentSelection = () => {

  const store = useStore();

  const anno = useAnnotoriousManifold();

  const selection = useSelection<ImageAnnotation>();

  const selected: ImageAnnotation | undefined = 
    selection.selected?.length > 0 ? selection.selected[0].annotation : undefined;

  const ref = useRef<HTMLButtonElement>();

  const [showSearchDialog, setShowSearchDialog] = useState(false);

  const [showAsEmpty, setShowAsEmpty] = useState(!selected?.bodies || selected.bodies.length === 0);

  useEffect(() => {
    if (selected) { 
      ref.current?.focus();

      const hasRelations = store.hasRelatedAnnotations(selected.id);
      const hasBodies = selected.bodies && selected.bodies.length > 0;

      store.findAnnotation(selected.id).then(result => {
        if (result) {
          const [_, source] = result;

          const id = 'uri' in source ? `iiif:${source.manifestId}:${source.id}` : source.id;
          store.getAnnotations(id).then(all => {
            const links = all.filter(a => isW3CRelationLinkAnnotation(a));
            const hasLinks = links.find(link => link.body === selected.id || link.target === selected.id);
            setShowAsEmpty(!(hasRelations || hasBodies || hasLinks));
          });
        }
      });
    } else {
      setShowAsEmpty(true);
    }
  }, [selected, store]);

  const onDelete = () => 
    anno.deleteAnnotation(selected.id);

  const onKeyDown = (evt: React.KeyboardEvent) => {
    if (evt.key !== 'Tab')
      !showSearchDialog && setShowSearchDialog(true)
  }

  const onAddEntityType = (entity: EntityType) => {
    const body = createBody(selected, {
      type: 'Dataset',
      purpose: 'classifying',
      source: entity.id
    }, new Date());

    anno.addBody(body);

    setShowSearchDialog(false);
  }

  return !selected ? (
    <div className="flex rounded text-sm justify-center items-center w-full text-muted-foreground">
      No annotation selected
    </div> 
  ) : (
    <div key={selected.id} className="flex flex-col grow h-full max-w-full">
      {showAsEmpty ? (
        <div className="flex grow justify-center items-center">
          <div>
            <Button
              ref={ref}
              onClick={() => setShowSearchDialog(true)}
              onKeyDown={onKeyDown}
              className="px-3 mr-2 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2">Add Tag</Button>

            <Button
              onClick={() => setShowAsEmpty(false)}
              variant="outline">Add Note</Button>
          </div>
        </div>
      ) : (
        <PropertiesForm 
          annotation={selected} 
          onAddTag={() => setShowSearchDialog(true)} />
      )}

      <EntityTypeBrowserDialog 
        open={showSearchDialog} 
        onAddEntityType={onAddEntityType}
        onCancel={() => setShowSearchDialog(false)} />
  
      <footer>
        <ConfirmedDelete
          variant="destructive" 
          className="w-full mt-2 mb-2"
          title="Delete Annotation"
          message="Are you sure you want to delete this annotation?"
          onConfirm={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete Annotation
        </ConfirmedDelete>
      </footer>
    </div>
  )

}