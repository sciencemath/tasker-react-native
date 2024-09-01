import { StyleSheet, Text, View, FlatList } from 'react-native';
import { COUNTDOWN_STORAGE_KEY, PersistedCountdownState } from '.';
import { useEffect, useState } from 'react';
import { getFromStorage } from '../../utils/storage';
import { theme } from '../../theme';
import { format } from 'date-fns';

const fullDateFormat = 'LLL d yyyy, h:mm aaa';

const HistoryScreen = () => {
  const [countdownState, setCountdownState] =
    useState<PersistedCountdownState>();

  useEffect(() => {
    (async () => {
      const value = await getFromStorage(COUNTDOWN_STORAGE_KEY);
      setCountdownState(value);
    })();
  }, []);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.contentContainer}
      data={countdownState?.completedAtTimestamps}
      ListEmptyComponent={
        <View style={styles.listEmptyContainer}>
          <Text>No History</Text>
        </View>
      }
      render={({ item }) => (
        <View style={styles.listItem}>
          <Text style={styles.listItemText}>
            {format(item, fullDateFormat)}
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: theme.colorWhite,
  },
  contentContainer: {
    marginTop: 8,
  },
  listItem: {
    backgroundColor: theme.colorLightGrey,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colorWhite,
  },
  text: {
    fontSize: 24,
  },
  listItemText: {
    fontSize: 18,
  },
  listEmptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 18,
  },
});

export default HistoryScreen;
