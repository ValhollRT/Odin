import React, { type ReactElement, useState, type ReactNode } from 'react';
import styles from '../../styles/tab.module.scss';

interface TabPanelProps {
  label: string;
  children: ReactNode;
}

interface TabsProps {
  children: Array<ReactElement<TabPanelProps>>;
}

const Tabs: React.FC<TabsProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState(children[0].props.label);

  const handleClick = (
    e: React.MouseEvent<HTMLLIElement>,
    newActiveTab: string
  ): void => {
    e.preventDefault();
    setActiveTab(newActiveTab);
  };

  return (
    <div>
      <ul className={styles.tabs}>
        {children.map(tab => (
          <li
            key={tab.props.label}
            className={tab.props.label === activeTab ? 'active' : ''}
            onClick={e => {
              handleClick(e, tab.props.label);
            }}
          >
            {tab.props.label}
          </li>
        ))}
      </ul>
      <div className={styles['tab-content']}>
        {children.map(content => {
          if (content.props.label !== activeTab) return undefined;
          return content.props.children;
        })}
      </div>
    </div>
  );
};

export default Tabs;
