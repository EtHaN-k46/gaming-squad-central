import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RecordingScreen from './RecordingScreen';
import TranscriptScreen from './TranscriptScreen';
import SummaryScreen from './SummaryScreen';
import ManualSummaryScreen from './ManualSummaryScreen';
import HistoryScreen from './HistoryScreen';
import { Button } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Recording">
      <Stack.Screen
        name="Recording"
        component={RecordingScreen}
        options={({ navigation }) => ({
          title: 'Live Talk Session',
          headerLeft: () => (
            <Button
              onPress={() => navigation.navigate('History')}
              title="History"
              color="#007BFF"
            />
          ),
          headerRight: () => (
            <Button
              onPress={() => navigation.navigate('ManualSummary')}
              title="Manual"
              color="#007BFF"
            />
          ),
        })}
      />
      <Stack.Screen name="Transcript" component={TranscriptScreen} />
      <Stack.Screen name="Summary" component={SummaryScreen} />
      <Stack.Screen name="ManualSummary" component={ManualSummaryScreen} options={{ title: 'Manual Summary' }} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
