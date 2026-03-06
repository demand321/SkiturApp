import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { subscribeToMessages, sendMessage } from '../../services/chat';
import { Message } from '../../types';
import { formatTime } from '../../utils/dateUtils';
import { COLORS } from '../../constants';

interface Props {
  tripId: string;
}

export default function TripChatScreen({ tripId }: Props) {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(tripId, setMessages);
    return unsubscribe;
  }, [tripId]);

  const handleSend = async () => {
    if (!user || !text.trim()) return;
    const msg = text.trim();
    setText('');
    await sendMessage(tripId, user.uid, msg);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.userId === user?.uid;
    const time = item.createdAt?.toDate?.() ?? new Date();

    return (
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
          {item.text}
        </Text>
        <Text style={[styles.time, isMe && styles.timeMe]}>
          {formatTime(time)}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Skriv en melding..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
    paddingBottom: 8,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#fff',
  },
  time: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: COLORS.text,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
