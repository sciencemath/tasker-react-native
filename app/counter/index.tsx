import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { theme } from '../../theme';
import { registerForPushNoticationsAsync } from '../../utils/registerForPushNotificationsAsync';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Duration, isBefore, intervalToDuration } from 'date-fns';
import { TimeSegment } from '../../components/TimeSegment';
import { getFromStorage, saveToStorage } from '../../utils/storage';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';

// hardcode 10sec
// @TODO make it dynamic later
const frequency = 10 * 1000;
// const frequency = 14 * 24 * 60 * 60 * 1000

export const COUNTDOWN_STORAGE_KEY = 'tasker-countdown';

export type PersistedCountdownState = {
  currentNotificationId: string | undefined;
  completedAtTimestamps: number[];
};

type CountdownStatus = {
  isOverdue: boolean;
  distance: Duration;
};

/**
 *
 * @returns {React.FC}
 */
const CounterScreen = () => {
  /**
   * also can use Dimensions.get() the difference
   * is Dimensions.get wont recalculate on screen rotation.
   */
  const { width } = useWindowDimensions();
  const confettiRef = useRef<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [countdownState, setCountdownState] =
    useState<PersistedCountdownState>();
  const [status, setStatus] = useState<CountdownStatus>({
    isOverdue: false,
    distance: {},
  });
  const isWhiteText = status.isOverdue ? styles.whiteText : undefined;
  const lastCompletedTimestamp = countdownState?.completedAtTimestamps[0];

  useEffect(() => {
    (async () => {
      const value = await getFromStorage(COUNTDOWN_STORAGE_KEY);
      setCountdownState(value);
    })();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timestamp = lastCompletedTimestamp
        ? lastCompletedTimestamp + frequency
        : Date.now();

      if (lastCompletedTimestamp) {
        setIsLoading(false);
      }

      const isOverdue = isBefore(timestamp, Date.now());
      const distance = intervalToDuration(
        isOverdue
          ? { start: timestamp, end: Date.now() }
          : { start: Date.now(), end: timestamp },
      );
      setStatus({ isOverdue, distance });
    });

    return () => {
      clearInterval(intervalId);
    };
  }, [lastCompletedTimestamp]);

  const onScheduleNotification = async () => {
    confettiRef?.current?.start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let pushNotificationId;
    const result = await registerForPushNoticationsAsync();
    if (result !== 'granted') {
      if (Device.isDevice) {
        Alert.alert(
          'Unable to schedule notification',
          'Enable the notification permission for Expo Go in settings',
        );
        return;
      }
    }
    pushNotificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to do Laundry 👕',
      },
      trigger: {
        seconds: frequency / 1000,
      },
    });

    if (countdownState?.currentNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        countdownState?.currentNotificationId,
      );
    }

    const newCountdownState: PersistedCountdownState = {
      currentNotificationId: pushNotificationId,
      completedAtTimestamps: countdownState
        ? [Date.now(), ...countdownState.completedAtTimestamps]
        : [Date.now()],
    };

    setCountdownState(newCountdownState);
    await saveToStorage(COUNTDOWN_STORAGE_KEY, newCountdownState);
  };

  if (isLoading) {
    return (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        status.isOverdue ? styles.containerLate : undefined,
      ]}
    >
      {status.isOverdue ? (
        <Text style={[styles.heading, isWhiteText]}>Laundry overdue by</Text>
      ) : (
        <Text style={[styles.heading, isWhiteText]}>Laundry due in...</Text>
      )}
      <View style={styles.row}>
        <TimeSegment
          unit="Days"
          number={status.distance.days ?? 0}
          textStyle={isWhiteText}
        />
        <TimeSegment
          unit="Hours"
          number={status.distance.hours ?? 0}
          textStyle={isWhiteText}
        />
        <TimeSegment
          unit="Minutes"
          number={status.distance.minutes ?? 0}
          textStyle={isWhiteText}
        />
        <TimeSegment
          unit="Seconds"
          number={status.distance.seconds ?? 0}
          textStyle={isWhiteText}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={onScheduleNotification}
      >
        <Text style={styles.buttonText}>I've done my laundry!</Text>
      </TouchableOpacity>
      <ConfettiCannon
        ref={confettiRef}
        count={50}
        origin={{
          x: width / 2,
          y: -20,
        }}
        fadeOut
        autoStart={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colorWhite,
  },
  containerLate: {
    backgroundColor: theme.colorRed,
  },
  buttonText: {
    color: theme.colorWhite,
    letterSpacing: 1,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 12,
    borderRadius: 6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  whiteText: {
    color: theme.colorWhite,
  },
  activityIndicatorContainer: {
    backgroundColor: theme.colorWhite,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default CounterScreen;
