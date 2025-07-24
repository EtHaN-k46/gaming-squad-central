import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecordingScreen = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(prevDuration => prevDuration + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  async function startRecording() {
    try {
      if (permissionResponse && permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setIsRecording(false);
    setDuration(0);
    if (recording) {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      if (uri) {
        uploadAudio(uri);
      }
    }
  }

  async function uploadAudio(uri: string) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      const fileName = `recording-${Date.now()}.m4a`;
      formData.append('file', {
        uri,
        name: fileName,
        type: 'audio/m4a',
      } as any);

      const response = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (response.ok) {
        const newSession = {
          id: Date.now().toString(),
          title: fileName,
          date: new Date().toISOString(),
          transcript: data.transcript,
          summary: data.summary,
          audioUri: uri,
        };
        const existingHistory = await AsyncStorage.getItem('@history');
        const history = existingHistory ? JSON.parse(existingHistory) : [];
        const newHistory = [...history, newSession];
        await AsyncStorage.setItem('@history', JSON.stringify(newHistory));

        navigation.navigate('Transcript', { transcript: data.transcript });
        navigation.navigate('Summary', { summary: data.summary });
      } else {
        console.error('Error uploading audio:', data.error);
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Talk Session</Text>
      <View>
        <Text style={styles.duration}>{new Date(duration * 1000).toISOString().substr(11, 8)}</Text>
        {isLoading && <ActivityIndicator size="large" color="#fff" />}
      </View>
      <View style={styles.buttonContainer}>
        <Button title={isRecording ? 'Stop' : 'Record'} onPress={handleRecord} disabled={isLoading} color={isRecording ? '#FF3B30' : '#4CD964'} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#87CEEB',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  duration: {
    fontSize: 64,
    color: '#fff',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  resultsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 20,
    width: '100%',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default RecordingScreen;
