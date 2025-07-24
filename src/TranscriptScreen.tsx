import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const TranscriptScreen = ({ route }: any) => {
  const { transcript } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transcript</Text>
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.content}>{transcript}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: 20,
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default TranscriptScreen;
