import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const HistoryScreen = () => {
  const [history, setHistory] = useState<any[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@history');
        if (jsonValue != null) {
          setHistory(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error('Failed to load history.', e);
      }
    };
    loadHistory();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        navigation.navigate('Transcript', { transcript: item.transcript });
        navigation.navigate('Summary', { summary: item.summary });
      }}
    >
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text>{new Date(item.date).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session History</Text>
      <FlatList data={history} renderItem={renderItem} keyExtractor={(item) => item.id} />
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
  item: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default HistoryScreen;
