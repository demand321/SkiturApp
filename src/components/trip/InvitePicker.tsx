import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { fetchAllUsers } from '../../services/users';
import { User } from '../../types';
import { COLORS } from '../../constants';

export interface SelectedUser {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  isNew?: boolean;
}

interface Props {
  currentUserId: string;
  selected: SelectedUser[];
  onSelectionChange: (users: SelectedUser[]) => void;
  tripTitle?: string;
}

export default function InvitePicker({ currentUserId, selected, onSelectionChange, tripTitle }: Props) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    fetchAllUsers()
      .then(setAllUsers)
      .catch(() => {});
  }, []);

  const filtered = allUsers.filter((u) => {
    if (u.uid === currentUserId) return false;
    if (selected.some((s) => s.uid === u.uid)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  // Check if search looks like a phone number not matching any user
  const searchIsPhone = /^\+?\d{8,}$/.test(search.trim().replace(/\s/g, ''));
  const phoneNotFound = searchIsPhone && filtered.length === 0;

  const toggleUser = (u: User) => {
    onSelectionChange([
      ...selected,
      { uid: u.uid, displayName: u.displayName, email: u.email, phone: u.phone ?? '' },
    ]);
    setSearch('');
  };

  const removeUser = (key: string) => {
    onSelectionChange(selected.filter((s) => {
      const id = s.uid || s.email || s.phone;
      return id !== key;
    }));
  };

  const handleAddNew = () => {
    if (!newName.trim()) {
      const msg = 'Navn er påkrevd';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Feil', msg);
      return;
    }
    if (!newEmail.trim() && !newPhone.trim()) {
      const msg = 'E-post eller mobilnummer er påkrevd';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Feil', msg);
      return;
    }
    const key = newEmail.trim() || newPhone.trim();
    if (selected.some((s) => (s.email && s.email === newEmail.trim()) || (s.phone && s.phone === newPhone.trim()))) {
      const msg = 'Denne personen er allerede lagt til';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Feil', msg);
      return;
    }
    onSelectionChange([
      ...selected,
      {
        uid: '',
        displayName: newName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        isNew: true,
      },
    ]);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setShowAddNew(false);
  };

  const sendSms = async (phone: string, name: string) => {
    const message = `Hei ${name}! Du er invitert til skitur${tripTitle ? `: ${tripTitle}` : ''}. Last ned appen her: https://skiturapp.pages.dev`;
    if (Platform.OS === 'web') {
      // Open sms: URI
      window.open(`sms:${phone}?body=${encodeURIComponent(message)}`, '_blank');
    } else {
      try {
        const SMS = await import('expo-sms');
        const available = await SMS.isAvailableAsync();
        if (available) {
          await SMS.sendSMSAsync([phone], message);
        } else {
          // Fallback to sms: URI
          await Linking.openURL(`sms:${phone}?body=${encodeURIComponent(message)}`);
        }
      } catch {
        await Linking.openURL(`sms:${phone}?body=${encodeURIComponent(message)}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Inviter deltakere</Text>

      {/* Selected chips */}
      {selected.length > 0 && (
        <View style={styles.chipList}>
          {selected.map((s) => {
            const key = s.uid || s.email || s.phone || s.displayName;
            return (
              <View key={key} style={styles.chipRow}>
                <View style={styles.chip}>
                  <Text style={styles.chipText} numberOfLines={1}>
                    {s.displayName}
                  </Text>
                  {s.phone ? (
                    <Text style={styles.chipPhone}>{s.phone}</Text>
                  ) : null}
                  <TouchableOpacity
                    onPress={() => removeUser(key)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.chipRemove}>x</Text>
                  </TouchableOpacity>
                </View>
                {s.phone ? (
                  <TouchableOpacity
                    style={styles.smsBtn}
                    onPress={() => sendSms(s.phone!, s.displayName)}
                  >
                    <Text style={styles.smsBtnText}>SMS</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      {/* Search existing users */}
      <TextInput
        style={styles.searchInput}
        placeholder="Sok etter navn, mobilnr eller e-post..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor={COLORS.textSecondary}
      />

      {search.trim().length > 0 && (
        <View style={styles.dropdown}>
          {filtered.slice(0, 8).map((u) => (
            <TouchableOpacity
              key={u.uid}
              style={styles.dropdownItem}
              onPress={() => toggleUser(u)}
            >
              <Text style={styles.dropdownName}>{u.displayName}</Text>
              <Text style={styles.dropdownEmail}>
                {u.phone ? `${u.phone}  ` : ''}{u.email}
              </Text>
            </TouchableOpacity>
          ))}
          {phoneNotFound && (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                const phoneNum = search.trim().replace(/\s/g, '');
                setSearch('');
                setNewPhone(phoneNum);
                setShowAddNew(true);
              }}
            >
              <Text style={styles.dropdownName}>Inviter {search.trim()}</Text>
              <Text style={styles.dropdownEmail}>Legg til som ny person</Text>
            </TouchableOpacity>
          )}
          {filtered.length === 0 && !phoneNotFound && (
            <Text style={styles.noResults}>Ingen treff</Text>
          )}
        </View>
      )}

      {/* Add new user */}
      {!showAddNew ? (
        <TouchableOpacity
          style={styles.addNewBtn}
          onPress={() => setShowAddNew(true)}
        >
          <Text style={styles.addNewText}>+ Legg til ny person</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.addNewForm}>
          <TextInput
            style={styles.newInput}
            placeholder="Navn *"
            value={newName}
            onChangeText={setNewName}
            placeholderTextColor={COLORS.textSecondary}
          />
          <TextInput
            style={styles.newInput}
            placeholder="Mobilnummer"
            value={newPhone}
            onChangeText={setNewPhone}
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.textSecondary}
          />
          <TextInput
            style={styles.newInput}
            placeholder="E-post"
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={COLORS.textSecondary}
          />
          <View style={styles.addNewActions}>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddNew}>
              <Text style={styles.addBtnText}>Legg til</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowAddNew(false);
                setNewName('');
                setNewEmail('');
                setNewPhone('');
              }}
            >
              <Text style={styles.cancelBtnText}>Avbryt</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  chipList: {
    gap: 6,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    maxWidth: 120,
  },
  chipPhone: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
  },
  chipRemove: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  smsBtn: {
    backgroundColor: '#25D366',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  smsBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  dropdown: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  dropdownEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  noResults: {
    padding: 12,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  addNewBtn: {
    marginTop: 8,
    paddingVertical: 10,
  },
  addNewText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  addNewForm: {
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  newInput: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  addNewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});
