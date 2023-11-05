import React from 'react';
import styles from '../../styles/tab.module.scss';

interface TabPanelProps {
  label: string;
  children: React.ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ label, children }) => {
  return (
    <div className={styles['tab-panel']} aria-label={label}>
      {children}
    </div>
  );
};

export default TabPanel;
