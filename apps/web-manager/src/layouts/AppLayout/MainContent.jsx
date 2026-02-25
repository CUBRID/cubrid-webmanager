import React, { useMemo, useCallback } from 'react';
import { Tabs } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { TAB_SCREEN } from '@/shared/variables';
import { removeTab, setActiveTabKey } from '@/shared/slice/tabSlice';
import styles from './AppLayout.module.css';

const MainContent = () => {
  const { activeTabKey, tabs, unsavedTabs } = useSelector((state) => state.tab);
  const dispatch = useDispatch();

  // 1. Memoize filtered items to prevent re-mapping on every render
  const tabItems = useMemo(() => {
    return tabs
      .map(({ key, title, icon, type }) => {
        const Component = TAB_SCREEN[type];
        return {
          key,
          label: (
            <span>
              {icon} {title}
            </span>
          ),
          // Clean icon handling
          closeIcon: <i className="fa-solid fa-xmark" style={{ fontSize: 13 }} />,
          children: <Component uniqueKey={key} />,
        };
      });
  }, [tabs]);

  const onChange = useCallback(
    (key) => {
      dispatch(setActiveTabKey(key));
    },
    [dispatch]
  );

  const handleRemove = (targetKey) => {
    let newActiveKey = activeTabKey;

    // 2. Intelligent tab switching: only change active key if we closed the current tab
    if (activeTabKey === targetKey) {
      const targetIndex = tabs.findIndex((tab) => tab.key === targetKey);

      // Look for the neighbor (previous if exists, otherwise next)
      const nextTab = tabs[targetIndex + 1] || tabs[targetIndex - 1];
      newActiveKey = nextTab ? nextTab.key : '';

      dispatch(setActiveTabKey(newActiveKey));
    }

    dispatch(removeTab(targetKey));
  };

  const onEdit = (targetKey, action) => {
    if (action === 'remove') {
      // 3. Handle unsaved changes check
      if (unsavedTabs.includes(targetKey)) {
        // You can trigger your "Save Changes?" modal here
        console.warn('Tab has unsaved changes');
        return;
      }
      handleRemove(targetKey);
    }
  };

  return (
    <Tabs
      className={styles.main__container}
      hideAdd
      onChange={onChange}
      activeKey={activeTabKey}
      type="editable-card"
      onEdit={onEdit}
      items={tabItems}
      size="large"
      tabBarStyle={{ borderRadius: 12 }}
    />
  );
};

export default MainContent;
