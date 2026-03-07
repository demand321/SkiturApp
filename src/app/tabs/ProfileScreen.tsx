import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Alert } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuthStore } from '../../stores/authStore';
import { signOut } from '../../services/auth';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore, ThemePreference } from '../../stores/themeStore';
import { useTranslation, useLocaleStore } from '../../i18n';

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Lys', value: 'light' },
  { label: 'Mork', value: 'dark' },
];

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const { colors } = useTheme();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const [phone, setPhone] = useState('');
  const [phoneSaved, setPhoneSaved] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists()) {
        setPhone(snap.data().phone ?? '');
      }
    });
  }, [user?.uid]);

  const savePhone = async () => {
    if (!user?.uid) return;
    await updateDoc(doc(db, 'users', user.uid), { phone: phone.trim() });
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('profile.profile')}</Text>
      <Text style={[styles.email, { color: colors.textSecondary }]}>
        {user?.displayName || user?.email}
      </Text>
      <Text style={[styles.emailSub, { color: colors.textSecondary }]}>
        {user?.email}
      </Text>

      <View style={[styles.phoneSection, { borderColor: colors.border }]}>
        <Text style={[styles.phoneLabel, { color: colors.text }]}>Mobilnummer</Text>
        <View style={styles.phoneRow}>
          <TextInput
            style={[styles.phoneInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Ditt mobilnummer"
            keyboardType="phone-pad"
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity
            style={[styles.phoneSaveBtn, { backgroundColor: colors.primary }]}
            onPress={savePhone}
          >
            <Text style={styles.phoneSaveText}>{phoneSaved ? 'Lagret!' : 'Lagre'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.themeSection, { borderColor: colors.border }]}>
        <Text style={[styles.themeLabel, { color: colors.text }]}>
          {locale === 'nb' ? 'Tema' : 'Theme'}
        </Text>
        <View style={styles.themeOptions}>
          {THEME_OPTIONS.map((option) => {
            const isActive = preference === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: isActive
                      ? colors.primary
                      : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setPreference(option.value)}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: isActive ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.languageSection, { borderColor: colors.border }]}>
        <Text style={[styles.languageLabel, { color: colors.text }]}>
          {t('profile.language')}
        </Text>
        <View style={styles.languageOptions}>
          <TouchableOpacity
            style={[
              styles.languageOption,
              {
                backgroundColor: locale === 'nb' ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setLocale('nb')}
          >
            <Text
              style={[
                styles.languageOptionText,
                { color: locale === 'nb' ? '#FFFFFF' : colors.text },
              ]}
            >
              {t('profile.languageNorwegian')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageOption,
              {
                backgroundColor: locale === 'en' ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setLocale('en')}
          >
            <Text
              style={[
                styles.languageOptionText,
                { color: locale === 'en' ? '#FFFFFF' : colors.text },
              ]}
            >
              {t('profile.languageEnglish')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.error }]}
        onPress={signOut}
      >
        <Text style={styles.buttonText}>{t('auth.signOut')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    marginTop: 8,
  },
  emailSub: {
    fontSize: 13,
    marginTop: 2,
  },
  phoneSection: {
    marginTop: 20,
    width: '80%',
    paddingVertical: 12,
  },
  phoneLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  phoneSaveBtn: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  phoneSaveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  themeSection: {
    marginTop: 32,
    width: '80%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  languageSection: {
    marginTop: 16,
    width: '80%',
    borderBottomWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  languageOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  languageOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
