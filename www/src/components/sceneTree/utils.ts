import { Container } from "../../context/AppContext";
import { IconType } from "./initialMockObjects";

export const findObjectById = (items: Container[], id: string): Container | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children.length > 0) {
        const found = findObjectById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  
  export const updateObjectIcons = (items: Container[], id: string, newIcons: IconType[]): Container[] => {
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
  
  export const updateObjectProperty = (items: Container[], id: string, property: keyof Container, value: any): Container[] => {
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
  
  
  export const findAndRemoveItemById = (items: Container[], id: string): [Container | null, Container[]] => {
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
  
  export const insertItem = (items: Container[], item: Container, targetId: string, position: 'before' | 'inside' | 'after'): Container[] => {
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