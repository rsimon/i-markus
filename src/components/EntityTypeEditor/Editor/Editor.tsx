import { useEffect, useState } from 'react';
import { AlertCircle, Braces, CheckCircle2, RefreshCcw } from 'lucide-react';
import { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Textarea } from '@/ui/Textarea';
import { getRandomColor, getBrightness } from '@/utils/color';
import { EntityPreview } from './EntityPreview/EntityPreview';
import { PropertyDefinitions } from './PropertyDefinitions/PropertyDefinitions';
import { EntityTypeStub } from '../EntityTypeStub';

export interface EditorProps {

  entityType?: EntityType;

  onSaved(): void;

  onSaveError(error: Error): void;

}

const validate = (stub: EntityTypeStub): EntityType | undefined =>
  stub.id ? stub as EntityType : undefined;

export const Editor = (props: EditorProps) => {

  const { model, addEntityType, updateEntityType } = useDataModel();

  const { entityTypes } = model;

  const [entityType, setEntityType] = useState<EntityTypeStub>(props.entityType || {
    color: getRandomColor()
  });

  const isIdAvailable = props.entityType
    // Editing existing - check if entity with the ID is props.entity.id
    ? !entityTypes.find(e => e.id === entityType.id) 
      || entityTypes.find(e => e.id === entityType.id).id === props.entityType.id

    // Not editing an existing entity - check if any exists with same ID
    : !entityTypes.find(e => e.id === entityType.id);

  const [errors, setErrors] = useState<{ id: boolean } | undefined>();

  const brightness = getBrightness(entityType.color);

  useEffect(() => {
    if (errors)
      setErrors({ id: !entityType.id || !isIdAvailable });
  }, [entityType]);

  const onSave = () => {
    const valid = isIdAvailable && validate(entityType);

    if (valid) {
      if (props.entityType) { // Update existing
        updateEntityType(valid)
          .then(() => props.onSaved())
          .catch(props.onSaveError);
      } else { // Save new
        addEntityType(valid)
          .then(() => props.onSaved())
          .catch(props.onSaveError);
      }
    } else {
      setErrors({ id: !entityType.id || !isIdAvailable });
    }
  }

  return (
    <article className="grid grid-cols-2 rounded-lg overflow-hidden">
      <div className="px-6 py-3">
        <div className="grid grid-cols-2 gap-2 mt-2 mb-1">
          <div>
            <Label 
              htmlFor="identifier"
              className="inline-block text-xs mb-1.5 ml-0.5">Entity Class *
            </Label>
            
            {errors?.id && (<span className="text-xs text-red-600 ml-1">required</span>)}

            <Input 
              disabled={Boolean(props.entityType)}
              id="identifier"
              className={errors?.id ? "h-9 border-red-500" : "h-9"} 
              value={entityType.id || ''} 
              onChange={evt => setEntityType(e => ({...e, id: evt.target.value}))}/>

            {entityType.id && (!isIdAvailable ? (
              <span className="flex items-center text-xs mt-3 text-red-600 whitespace-nowrap">
                <AlertCircle className="flex-shrink-0 h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> ID already exists
              </span>
            ) : (props.entityType && !(props.entityType.id === entityType.id)) || !props.entityType && (
              <span className="flex items-center text-xs mt-2 text-green-600 whitespace-nowrap">
                <CheckCircle2 className="flex-shrink-0 h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> {entityType.id} is available
              </span>
            ))}
          </div>

          <div>
            <Label 
              htmlFor="color"
              className="inline-block text-xs mb-1.5 ml-0.5">Color</Label>

            <div className="grid gap-2 grid-cols-4">
              <Button 
                size="icon" 
                className={brightness < 0.9 ? 'h-9 w-9' : 'h-9 w-9 border shadow-sm'}
                style={{ 
                  backgroundColor: entityType.color,
                  color: brightness > 0.5 ? '#000' : '#fff' 
                }}
                onClick={() => setEntityType(e => ({...e, color: getRandomColor() }))}>
                <RefreshCcw className="h-4 w-4" />
              </Button>

              <Input 
                id="color"
                className="col-span-3 h-9" 
                value={entityType.color} 
                onChange={evt => setEntityType(e => ({...e, color: evt.target.value }))}/>
            </div>
          </div>
        </div>

        <div className="mt-2">
          <Label 
            htmlFor="parent"
            className="inline-block text-xs mb-1.5 ml-0.5">Parent Class
          </Label>

          <Input
            id="parent"
            value={entityType.parentId || ''}
            onChange={evt => setEntityType(e => ({ ...e, p: evt.target.value }))}
            className="h-9" />
        </div>
        
        <div className="mt-2">
          <Label 
            htmlFor="label"
            className="inline-block text-xs mb-1.5 ml-0.5">Display Name
          </Label>

          <Input
            id="label"
            value={entityType.label || ''}
            onChange={evt => setEntityType(e => ({ ...e, label: evt.target.value }))}
            className="h-9" />
        </div>

        <div className="mt-2">
          <Label 
            htmlFor="description"
            className="inline-block text-xs mb-1.5 ml-0.5">Description</Label>

          <Textarea 
            id="description"
            rows={3} 
            value={entityType.description || ''} 
            onChange={evt => setEntityType(e => ({ ...e, description: evt.target.value }))} />
        </div>

        <div className="mt-3">
          <PropertyDefinitions 
            properties={entityType.properties || []}
            onChange={properties => setEntityType(e => ({...e, properties }))} />
        </div>

        <Button className="w-full mt-5 mb-3" onClick={onSave}>
          <Braces className="w-5 h-5 mr-2" /> Save Entity
        </Button>
      </div>

      <EntityPreview 
        entityType={entityType} />
    </article>
  )

}