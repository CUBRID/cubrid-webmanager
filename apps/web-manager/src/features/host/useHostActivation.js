import { useCallback, useRef } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { loginToHostWithSideEffects, fetchHostEnv, openEditHostModal, setSelectedHost } from './hostSlice';
import { resetDatabaseState, fetchDatabaseStartInfo } from '../database/databaseCoreSlice';
import { resetBrokerState, fetchBrokerList } from '../broker/brokerSlice';
import { setActiveMainTab } from '../layout/layoutSlice';

/**
 * Logs into a host (if not already authorized) then opens its dashboard tab.
 * For an already-authorized host this never logs in — it just switches the
 * active tab and refetches — so it's safe to call reactively on a plain
 * single-click focus change (ServerListItem does this) as well as an
 * explicit gesture (double-click, row-open). For a not-yet-authorized host,
 * only call this from an explicit gesture: it triggers login, which a mere
 * focus change should never do.
 */
export function useHostActivation() {
  const dispatch = useDispatch();
  const { authorizedHosts } = useSelector((state) => state.host, shallowEqual);
  const loginInProgressRef = useRef(false);

  const activateHost = useCallback((uid) => {
    if (!uid) return;
    if (loginInProgressRef.current) return;

    if (authorizedHosts.includes(uid)) {
      dispatch(setSelectedHost(uid));
      dispatch(resetDatabaseState());
      dispatch(resetBrokerState());
      dispatch(setActiveMainTab('host:' + uid));
      dispatch(fetchDatabaseStartInfo(uid));
      dispatch(fetchBrokerList(uid));
      dispatch(fetchHostEnv(uid));
      return;
    }

    loginInProgressRef.current = true;
    dispatch(loginToHostWithSideEffects(uid))
      .unwrap()
      .then(() => {
        dispatch(setSelectedHost(uid));
        dispatch(resetDatabaseState());
        dispatch(resetBrokerState());
        dispatch(setActiveMainTab('host:' + uid));
        dispatch(fetchDatabaseStartInfo(uid));
        dispatch(fetchBrokerList(uid));
        dispatch(fetchHostEnv(uid));
      })
      .catch((err) => {
        console.error('Failed to log into host:', err);
        // Likely a bad/missing password (or other stale connection detail) —
        // open the Edit Host modal so the user can fix it right away instead
        // of just seeing a dead-end error.
        dispatch(openEditHostModal(uid));
      })
      .finally(() => {
        loginInProgressRef.current = false;
      });
  }, [dispatch, authorizedHosts]);

  return activateHost;
}
