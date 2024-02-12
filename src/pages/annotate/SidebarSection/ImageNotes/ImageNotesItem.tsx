import { useEffect, useState } from 'react';
import { W3CAnnotationBody } from '@annotorious/react';
import { Image } from '@/model';
import { useImageMetadata } from '@/store';
import { Button } from '@/ui/Button';
import { ImageMetadataForm, hasChanges } from '@/components/ImageMetadataForm';
import { PropertyValidation } from '@/components/PropertyFields';

interface ImageNotesItemProps {

  image: Image;

}

export const ImageNotesItem = (props: ImageNotesItemProps) => {

  const { metadata, updateMetadata } = useImageMetadata(props.image?.id);

  const [formState, setFormState] = useState<W3CAnnotationBody | undefined>();

  useEffect(() => {
    setFormState(metadata);    
  }, [metadata]);

  const onSave = () => updateMetadata(formState);

  return (
    <PropertyValidation>
      <ImageMetadataForm
        metadata={formState}
        onChange={setFormState} />

      <Button 
        disabled={!hasChanges(metadata, formState)} 
        className="w-full mb-2"
        onClick={onSave}>
        Save Metadata
      </Button>
    </PropertyValidation>
  )

}