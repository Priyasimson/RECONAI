import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { getSupabaseConfig, updateSupabaseConfig } from '../lib/supabase';

interface SupabaseConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export function SupabaseConfigModal({ visible, onClose, onConfigSaved }: SupabaseConfigModalProps) {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [key, setKey] = useState(currentConfig.key);

  const handleSave = () => {
    updateSupabaseConfig(url, key);
    onConfigSaved();
    onClose();
    Alert.alert('Configuration Saved', 'Supabase mobile settings updated successfully.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>CLOUD DATABASE CONFIG</Text>
          <Text style={styles.sub}>Configure PostgreSQL Cloud API URL & Publishable Key for mobile database syncing.</Text>

          <Text style={styles.label}>Supabase Project URL</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://xyz.supabase.co"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Supabase Publishable / Anon Key</Text>
          <TextInput
            style={styles.input}
            value={key}
            onChangeText={setKey}
            placeholder="sb_publishable_..."
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            secureTextEntry
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1
  },
  sub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16
  },
  label: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
    marginBottom: 12
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  cancelText: {
    color: '#94a3b8',
    fontSize: 13
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  saveText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  }
});
