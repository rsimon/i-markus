import type { EntityType, PropertyDefinition } from '@/model';
import { DataModel } from './DataModel';
import { readJSONFile, writeJSONFile } from '../utils';
import { EntityTypeTree, createEntityTypeTree } from './EntityTypeTree';
import { removeMissingParentIds, repairDataModel } from '../integrity';
import { ImageMetadataSchema } from '@/model/ImageMetadataSchema';
import { FolderMetadataSchema } from '@/model/FolderMetadataSchema';

export interface DataModelStore extends DataModel, EntityTypeTree {

  // Entity types
  getEntityType(id: string, inheritProps?: boolean): EntityType | undefined;

  addEntityType(type: EntityType): Promise<void>;

  removeEntityType(typeOrId: EntityType | string): Promise<void>;
  
  updateEntityType(type: EntityType): Promise<void>;

  // Folder metadata schemas
  getFolderSchema(name: string): FolderMetadataSchema | undefined;

  addFolderSchema(schema: FolderMetadataSchema): Promise<void>;

  removeFolderSchema(schemaOrName: FolderMetadataSchema | string): Promise<void>;

  updateFolderSchema(schema: FolderMetadataSchema): Promise<void>;

  // Image metadata schemas
  getImageSchema(name: string): ImageMetadataSchema | undefined;

  addImageSchema(schema: ImageMetadataSchema): Promise<void>;

  removeImageSchema(schemaOrName: ImageMetadataSchema | string): Promise<void>;

  updateImageSchema(schema: ImageMetadataSchema): Promise<void>;

}

export const loadDataModel = (
  handle: FileSystemDirectoryHandle
): Promise<DataModelStore> => new Promise(async resolve => {

  const fileHandle = await handle.getFileHandle('_immarkus.model.json', { create: true });

  const file = await fileHandle.getFile();

  let { entityTypes, imageSchemas, folderSchemas } = (await readJSONFile<DataModel>(file) || {

    entityTypes: [],

    folderSchemas: [],

    imageSchemas: []

  });

  entityTypes = repairDataModel(entityTypes);

  const tree = createEntityTypeTree(entityTypes);

  const rebuildEntityTypeTreeAndSave = () => {
    tree.rebuild(entityTypes);
    return writeJSONFile(fileHandle, { entityTypes, folderSchemas, imageSchemas });
  }

  const save = () =>
    writeJSONFile(fileHandle, { entityTypes, folderSchemas, imageSchemas });

  /** API **/

  const addEntityType = (type: EntityType) => {
    if (!entityTypes.find(e => e.id === type.id)) {
      entityTypes = [...entityTypes, type];
      return rebuildEntityTypeTreeAndSave();
    } else {
      return Promise.reject(`Entity with ID ${type.id} already exists`);
    }
  }

  const addFolderSchema = (schema: ImageMetadataSchema) => {
    if (!folderSchemas.find(s => s.name === schema.name)) {
      folderSchemas = [...folderSchemas, schema];
      return save();
    } else {
      return Promise.reject(`Folder schema "${schema.name}" already exists`);
    }
  }

  const addImageSchema = (schema: ImageMetadataSchema) => {
    if (!imageSchemas.find(s => s.name === schema.name)) {
      imageSchemas = [...imageSchemas, schema];
      return save();
    } else {
      return Promise.reject(`Image schema "${schema.name}" already exists`);
    }
  }

  const getEntityType = (id: string, inheritProps = false) => {
    const type = entityTypes.find(e => e.id === id);

    if (!inheritProps)
      return type;

    const buildPropsRecursive = (type: EntityType, properties?: PropertyDefinition[]) => {
      const parent = entityTypes.find(e => e.id === type.parentId);
      if (parent) {
        const parentProperties = (parent.properties || []).map(p => ({ ...p, inheritedFrom: parent.id }));
        return buildPropsRecursive(parent, [...parentProperties, ...(properties || [])]);
      } else {
        return properties;
      }
    }

    if (type) {
      // Inherit properties from parent hierarchy (if any)
      const properties = type.parentId ? buildPropsRecursive(type, type.properties) : type.properties;

      return {
        ...type,
        properties
      }
    }
  }

  const getFolderSchema = (name: string) =>
    folderSchemas.find(s => s.name === name);

  const getImageSchema = (name: string) =>
    imageSchemas.find(s => s.name === name);

  const removeEntityType = (typeOrId: EntityType | string) => {
    const id = typeof typeOrId === 'string' ? typeOrId : typeOrId.id;
    const next = entityTypes.filter(e => e.id !== id);

    // Repair the graph, in case the removed entity had children
    entityTypes = removeMissingParentIds(next);

    return rebuildEntityTypeTreeAndSave();
  }

  const removeFolderSchema = (schemaOrName: FolderMetadataSchema | string) => {
    const name = typeof schemaOrName === 'string' ? schemaOrName : schemaOrName.name;
    folderSchemas = folderSchemas.filter(s => s.name !== name);
    return save();
  }

  const removeImageSchema = (schemaOrName: ImageMetadataSchema | string) => {
    const name = typeof schemaOrName === 'string' ? schemaOrName : schemaOrName.name;
    imageSchemas = imageSchemas.filter(s => s.name !== name);
    return save();
  }

  const updateEntityType = (type: EntityType) => {
    if (entityTypes.find(e => e.id === type.id)) {
      entityTypes = entityTypes.map(e => e.id === type.id ? type : e);
      return rebuildEntityTypeTreeAndSave();
    } else {
      return Promise.reject(`Attempt to update entity ${type.id} but does not exist in store`);
    }
  }

  const updateFolderSchema = (schema: FolderMetadataSchema) => {
    if (folderSchemas.find(s => s.name === schema.name)) {
      folderSchemas = folderSchemas.map(s => s.name === schema.name ? schema : s);
      return save();
    } else {
      return Promise.reject(`Attempt to update folder scheam ${schema.name} but does not exist in store`);
    }
  }

  const updateImageSchema = (schema: ImageMetadataSchema) => {
    if (imageSchemas.find(s => s.name === schema.name)) {
      imageSchemas = imageSchemas.map(s => s.name === schema.name ? schema : s);
      return save();
    } else {
      return Promise.reject(`Attempt to update image scheam ${schema.name} but does not exist in store`);
    }
  }

  resolve({
    ...tree, 
    get entityTypes() { return entityTypes },
    get folderSchemas() { return folderSchemas },
    get imageSchemas() { return imageSchemas },
    addEntityType,
    addFolderSchema,
    addImageSchema,
    getEntityType,
    getFolderSchema,
    getImageSchema,
    removeEntityType,
    removeFolderSchema,
    removeImageSchema,
    updateEntityType,
    updateFolderSchema,
    updateImageSchema
  });

});