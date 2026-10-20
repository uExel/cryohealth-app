import React from 'react';
import { RefreshControl } from 'react-native';
import { useApp } from '../state/app';
import { runSync } from './sync';

/** Pull-to-refresh for a ScrollView: `refreshControl={useSyncRefresh()}`. Runs the same
 *  single-flight sync as the connectivity/foreground triggers. */
export function useSyncRefresh() {
  const { setNet } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await runSync(setNet);
    } finally {
      setRefreshing(false);
    }
  }, [setNet]);
  return <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />;
}
