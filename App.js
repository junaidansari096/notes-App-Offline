import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  StatusBar,
  Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types and Storage Key
const STORAGE_KEY = '@notes_app_data';

// Navigation setup
const Stack = createNativeStackNavigator();

// Colors & Theme
const theme = {
  primary: '#2563eb', // Blue 600
  background: '#f8fafc', // Slate 50
  card: '#ffffff',
  text: '#0f172a', // Slate 900
  textSecondary: '#64748b', // Slate 500
  border: '#e2e8f0', // Slate 200
  danger: '#ef4444', // Red 500
};

// =======================
// SCREENS
// =======================

function NotesListScreen({ navigation }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotes();
    });
    return unsubscribe;
  }, [navigation]);

  const loadNotes = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        setNotes(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Failed to load notes', e);
    }
  };

  const deleteNote = async (id) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          const updatedNotes = notes.filter(note => note.id !== id);
          setNotes(updatedNotes);
          try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
          } catch (e) {
            console.error('Failed to save notes', e);
          }
        }
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.noteCard}
      onPress={() => navigation.navigate('CreateEditNote', { note: item })}
      activeOpacity={0.7}
    >
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title || 'Untitled Note'}
        </Text>
        <Text style={styles.noteBodyPreview} numberOfLines={2}>
          {item.body || 'No additional text'}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => deleteNote(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notes yet. Create one!</Text>
          </View>
        }
      />
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CreateEditNote')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function CreateEditNoteScreen({ route, navigation }) {
  const isEditing = !!route.params?.note;
  const initialNote = route.params?.note || { title: '', body: '' };

  const [title, setTitle] = useState(initialNote.title);
  const [body, setBody] = useState(initialNote.body);

  const saveNote = async () => {
    if (!title.trim() && !body.trim()) {
      Alert.alert('Empty Note', 'Please enter a title or content.');
      return;
    }

    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      let existingNotes = jsonValue != null ? JSON.parse(jsonValue) : [];

      if (isEditing) {
        existingNotes = existingNotes.map(n => 
          n.id === initialNote.id 
            ? { ...n, title: title.trim(), body: body.trim(), updatedAt: Date.now() } 
            : n
        );
      } else {
        const newNote = {
          id: Date.now().toString(),
          title: title.trim(),
          body: body.trim(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        // Add new note to the top
        existingNotes = [newNote, ...existingNotes];
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingNotes));
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save note', e);
      Alert.alert('Error', 'Failed to save note.');
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Note' : 'New Note',
      headerRight: () => (
        <TouchableOpacity onPress={saveNote} style={styles.headerSaveBtn}>
          <Text style={styles.headerSaveText}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, body]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.inputTitle}
          placeholder="Note Title"
          placeholderTextColor={theme.textSecondary}
          value={title}
          onChangeText={setTitle}
          autoFocus={!isEditing}
        />
        <View style={styles.separator} />
        <TextInput
          style={styles.inputBody}
          placeholder="Start typing..."
          placeholderTextColor={theme.textSecondary}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />
      </View>
    </SafeAreaView>
  );
}

// =======================
// APP ENTRY
// =======================

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.primary,
          headerTitleStyle: { fontWeight: '600', color: theme.text },
          headerShadowVisible: false, // Removes bottom border on iOS/Android
        }}
      >
        <Stack.Screen 
          name="NotesList" 
          component={NotesListScreen} 
          options={{ title: 'My Notes' }}
        />
        <Stack.Screen 
          name="CreateEditNote" 
          component={CreateEditNoteScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// =======================
// STYLES
// =======================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: theme.textSecondary,
    fontSize: 16,
  },
  noteCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.border,
  },
  noteContent: {
    flex: 1,
    paddingRight: 12,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  noteBodyPreview: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 22,
  },
  deleteButton: {
    padding: 6,
    backgroundColor: theme.background,
    borderRadius: 16,
  },
  deleteButtonText: {
    color: theme.danger,
    fontSize: 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '400',
    marginTop: -2,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: theme.background,
  },
  inputTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    paddingVertical: 12,
  },
  separator: {
    height: 1,
    backgroundColor: theme.border,
    marginBottom: 16,
  },
  inputBody: {
    flex: 1,
    fontSize: 17,
    color: theme.text,
    lineHeight: 24,
  },
  headerSaveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerSaveText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.primary,
  }
});
