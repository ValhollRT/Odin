export type IconType = 'group' | 'geometry' | 'text' | 'image' | 'video' | 'audio';

export type SceneObject = {
  id: string;
  name: string;
  icons: IconType[];
  children: SceneObject[];
  visible: boolean;
  locked: boolean;
};

export const initialMockObjects: SceneObject[] = [
  { 
    id: '1', 
    name: 'Scene Root', 
    icons: ['group'],
    visible: true,
    locked: false,
    children: [
      { 
        id: '2', 
        name: 'Environment', 
        icons: ['group'],
        visible: true,
        locked: false,
        children: [
          { id: '3', name: 'Skybox', icons: ['image'], visible: true, locked: false, children: [] },
          { id: '4', name: 'Terrain', icons: ['geometry'], visible: true, locked: false, children: [] },
          { id: '5', name: 'Water', icons: ['geometry'], visible: true, locked: false, children: [] },
        ]
      },
      { 
        id: '6', 
        name: 'Characters', 
        icons: ['group'],
        visible: true,
        locked: false,
        children: [
          { 
            id: '7', 
            name: 'Player', 
            icons: ['group'],
            visible: true,
            locked: false,
            children: [
              { id: '8', name: 'Body', icons: ['geometry'], visible: true, locked: false, children: [] },
              { id: '9', name: 'Head', icons: ['geometry'], visible: true, locked: false, children: [] },
              { id: '10', name: 'Arms', icons: ['geometry'], visible: true, locked: false, children: [] },
              { id: '11', name: 'Legs', icons: ['geometry'], visible: true, locked: false, children: [] },
            ]
          },
          { 
            id: '12', 
            name: 'NPCs', 
            icons: ['group'],
            visible: true,
            locked: false,
            children: [
              { id: '13', name: 'Villager 1', icons: ['geometry'], visible: true, locked: false, children: [] },
              { id: '14', name: 'Villager 2', icons: ['geometry'], visible: true, locked: false, children: [] },
              { id: '15', name: 'Merchant', icons: ['geometry'], visible: true, locked: false, children: [] },
            ]
          },
        ]
      },
      { 
        id: '16', 
        name: 'Props', 
        icons: ['group'],
        visible: true,
        locked: false,
        children: [
          { id: '17', name: 'Trees', icons: ['group'], visible: true, locked: false, children: [
            { id: '18', name: 'Oak Tree', icons: ['geometry'], visible: true, locked: false, children: [] },
            { id: '19', name: 'Pine Tree', icons: ['geometry'], visible: true, locked: false, children: [] },
          ]},
          { id: '20', name: 'Rocks', icons: ['group'], visible: true, locked: false, children: [
            { id: '21', name: 'Boulder', icons: ['geometry'], visible: true, locked: false, children: [] },
            { id: '22', name: 'Pebbles', icons: ['geometry'], visible: true, locked: false, children: [] },
          ]},
          { id: '23', name: 'Buildings', icons: ['group'], visible: true, locked: false, children: [
            { id: '24', name: 'House', icons: ['geometry'], visible: true, locked: false, children: [] },
            { id: '25', name: 'Shop', icons: ['geometry'], visible: true, locked: false, children: [] },
          ]},
        ]
      },
      { 
        id: '26', 
        name: 'Lighting', 
        icons: ['group'],
        visible: true,
        locked: false,
        children: [
          { id: '27', name: 'Sun', icons: ['geometry'], visible: true, locked: false, children: [] },
          { id: '28', name: 'Ambient Light', icons: ['geometry'], visible: true, locked: false, children: [] },
          { id: '29', name: 'Spot Lights', icons: ['group'], visible: true, locked: false, children: [
            { id: '30', name: 'Street Lamp 1', icons: ['geometry'], visible: true, locked: false, children: [] },
            { id: '31', name: 'Street Lamp 2', icons: ['geometry'], visible: true, locked: false, children: [] },
          ]},
        ]
      },
      { 
        id: '32', 
        name: 'UI', 
        icons: ['group'],
        visible: true,
        locked: false,
        children: [
          { id: '33', name: 'HUD', icons: ['group'], visible: true, locked: false, children: [
            { id: '34', name: 'Health Bar', icons: ['geometry', 'text'], visible: true, locked: false, children: [] },
            { id: '35', name: 'Inventory', icons: ['geometry', 'text'], visible: true, locked: false, children: [] },
          ]},
          { id: '36', name: 'Main Menu', icons: ['group'], visible: false, locked: true, children: [
            { id: '37', name: 'Play Button', icons: ['geometry', 'text'], visible: false, locked: true, children: [] },
            { id: '38', name: 'Settings Button', icons: ['geometry', 'text'], visible: false, locked: true, children: [] },
          ]},
        ]
      },
      { 
        id: '39', 
        name: 'Audio', 
        icons: ['group'],
        visible: true,
        locked: false,
        children: [
          { id: '40', name: 'Background Music', icons: ['audio'], visible: true, locked: false, children: [] },
          { id: '41', name: 'Sound Effects', icons: ['group'], visible: true, locked: false, children: [
            { id: '42', name: 'Footsteps', icons: ['audio'], visible: true, locked: false, children: [] },
            { id: '43', name: 'Ambient Sounds', icons: ['audio'], visible: true, locked: false, children: [] },
          ]},
        ]
      },
      { 
        id: '44', 
        name: 'Particles', 
        icons: ['group'],
        visible: true,
        locked: false,
        children: [
          { id: '45', name: 'Dust', icons: ['geometry'], visible: true, locked: false, children: [] },
          { id: '46', name: 'Rain', icons: ['geometry'], visible: false, locked: false, children: [] },
          { id: '47', name: 'Snow', icons: ['geometry'], visible: false, locked: false, children: [] },
        ]
      },
    ]
  },
];

export const styles = {
  sceneTree: {
    width: '40rem',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  sceneTreeHeader: {
    padding: '0.5rem',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
  },
  headerInput: {
    flexGrow: 1,
    marginLeft: '0.5rem',
    padding: '0.25rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
  },
  sceneTreeContent: {
    height: '600px',
    overflowY: 'auto',
    padding: '0.5rem',
  },
  sceneTreeItem: {
    padding: '0.25rem 0',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  sceneTreeItemContent: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '0.25rem',
    height: '3rem',
    width: '100%',
  },
  sceneTreeItemDragging: {
    opacity: 0.5,
  },
  sceneTreeItemOver: {
    backgroundColor: '#e5e7eb',
  },
  sceneTreeItemOverBefore: {
    borderTop: '2px solid #3b82f6',
  },
  sceneTreeItemOverAfter: {
    borderBottom: '2px solid #3b82f6',
  },
  sceneTreeItemOverInside: {
    border: '2px solid #3b82f6',
  },
  expandButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    marginRight: '0.25rem',
  },
  objectIcon: {
    marginRight: '0.25rem',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: '4px',
  },
  selectedIcon: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  sceneTreeItemChildren: {
    paddingLeft: '1rem',
  },
  visibilityIcon: {
    cursor: 'pointer',
    marginBottom: '0.25rem',
  },
  lockIcon: {
    cursor: 'pointer',
  },
  nameInput: {
    border: 'none',
    background: 'transparent',
    fontSize: 'inherit',
    padding: '0',
    margin: '0',
    width: '100%',
  },
};