import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useShopping } from '../../hooks/useShopping';
import {
  addShoppingItem,
  toggleShoppingItem,
  removeShoppingItem,
} from '../../services/shopping';
import { ShoppingItem } from '../../types';
import { COLORS } from '../../constants';

interface Props {
  tripId: string;
}

export default function ShoppingListScreen({ tripId }: Props) {
  const user = useAuthStore((s) => s.user);
  const { items, loading } = useShopping(tripId);
  const [newItem, setNewItem] = useState('');

  const handleAdd = async () => {
    if (!user || !newItem.trim()) return;
    const text = newItem.trim();
    setNewItem('');
    await addShoppingItem(tripId, text, user.uid);
  };

  const handleToggle = async (item: ShoppingItem) => {
    await toggleShoppingItem(tripId, item.id, !item.checked);
  };

  const handleRemove = (item: ShoppingItem) => {
    Alert.alert('Fjern', `Fjerne "${item.text}"?`, [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Fjern',
        style: 'destructive',
        onPress: () => removeShoppingItem(tripId, item.id),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  return (
    <View style={styles.container}>
      <FlatList
        data={[...unchecked, ...checked]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleToggle(item)}
            >
              <View
                style={[
                  styles.checkboxInner,
                  item.checked && styles.checkboxChecked,
                ]}
              >
                {item.checked && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
            <Text
              style={[styles.itemText, item.checked && styles.itemTextChecked]}
              numberOfLines={2}
            >
              {item.text}
            </Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(item)}
            >
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>Handlelisten er tom</Text>
            <Text style={styles.emptyText}>
              Legg til ting dere trenger til turen
            </Text>
          </View>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Legg til vare..."
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addBtn, !newItem.trim() && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!newItem.trim()}
        >
          <Text style={styles.addBtnText}>Legg til</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  itemTextChecked: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  removeBtn: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontSize: 22,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  addBtn: {
    marginLeft: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
