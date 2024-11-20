import { IconType, SceneObject } from "./initialMockObjects";

export const findObjectById = (items: SceneObject[], id: string): SceneObject | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children.length > 0) {
        const found = findObjectById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  
  export const updateObjectIcons = (items: SceneObject[], id: string, newIcons: IconType[]): SceneObject[] => {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, icons: newIcons };
      }
      if (item.children.length > 0) {
        return { ...item, children: updateObjectIcons(item.children, id, newIcons) };
      }
      return item;
    });
  };
  
  export const updateObjectProperty = (items: SceneObject[], id: string, property: keyof SceneObject, value: any): SceneObject[] => {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, [property]: value };
      }
      if (item.children.length > 0) {
        return { ...item, children: updateObjectProperty(item.children, id, property, value) };
      }
      return item;
    });
  };
  
  
  export const findAndRemoveItemById = (items: SceneObject[], id: string): [SceneObject | null, SceneObject[]] => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        const [removedItem] = items.splice(i, 1);
        return [removedItem, items];
      }
      if (items[i].children.length > 0) {
        const [found, updatedChildren] = findAndRemoveItemById(items[i].children, id);
        if (found) {
          items[i].children = updatedChildren;
          return [found, items];
        }
      }
    }
    return [null, items];
  };
  
  export const insertItem = (items: SceneObject[], item: SceneObject, targetId: string, position: 'before' | 'inside' | 'after'): SceneObject[] => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === targetId) {
        if (position === 'before') {
          items.splice(i, 0, item);
        } else if (position === 'after') {
          items.splice(i + 1, 0, item);
        } else if (position === 'inside') {
          items[i].children.push(item);
        }
        return items;
      }
      if (items[i].children.length > 0) {
        const updatedChildren = insertItem(items[i].children, item, targetId, position);
        if (updatedChildren !== items[i].children) {
          items[i].children = updatedChildren;
          return items;
        }
      }
    }
    return items;
  };