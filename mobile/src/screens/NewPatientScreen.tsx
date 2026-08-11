import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import type { Patient } from '../types';
import { savePatientToSupabase } from '../lib/supabase';

interface NewPatientScreenProps {
  onPatientCreated: (patient: Patient) => void;
  onCancel: () => void;
}

export function NewPatientScreen({ onPatientCreated, onCancel }: NewPatientScreenProps) {
  const [name, setName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [contact, setContact] = useState('');
  const [anatomy, setAnatomy] = useState('Mandible Body');
  const [indication, setIndication] = useState('Osteoradionecrosis');
  const [defectLocation, setDefectLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter patient full name.');
      return;
    }

    setLoading(true);
    const caseNum = Math.floor(10000 + Math.random() * 90000);
    const caseId = `RECON-${caseNum}`;
    const pid = patientId.trim() || `PID-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPatient: Patient = {
      id: String(Date.now()),
      caseId,
      name: name.trim(),
      patientId: pid,
      age: age.trim() || '45',
      gender,
      contact: contact.trim() || '+1 555-0100',
      anatomy,
      indication: indication.trim() || 'Surgical Resection Defect',
      defectLocation: defectLocation.trim() || `${anatomy} defect site`,
      notes: notes.trim() || 'Primary reconstruction planned.',
      workflowProgress: 1,
      status: 'Registered'
    };

    try {
      // Save directly to Supabase
      await savePatientToSupabase(newPatient);
      onPatientCreated(newPatient);
    } catch (e) {
      console.warn('Failed to save to Supabase directly:', e);
      onPatientCreated(newPatient);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerBar}>
        <Text style={styles.title}>NEW PATIENT REGISTRATION</Text>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Patient Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Eleanor Vance"
          placeholderTextColor="#64748b"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Patient ID</Text>
            <TextInput
              style={styles.input}
              placeholder="PID-8842"
              placeholderTextColor="#64748b"
              value={patientId}
              onChangeText={setPatientId}
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="44"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
            />
          </View>
        </View>

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          {['Male', 'Female', 'Other'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderChip, gender === g && styles.genderChipActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Anatomical Reconstruction Site</Text>
        <View style={styles.anatomyGrid}>
          {['Mandible Body', 'Mandible Ramus', 'Maxilla', 'Midface', 'Calvarium'].map((site) => (
            <TouchableOpacity
              key={site}
              style={[styles.anatomyChip, anatomy === site && styles.anatomyChipActive]}
              onPress={() => setAnatomy(site)}
            >
              <Text style={[styles.anatomyText, anatomy === site && styles.anatomyTextActive]}>{site}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Clinical Indication</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Osteoradionecrosis, Tumor Resection, Trauma"
          placeholderTextColor="#64748b"
          value={indication}
          onChangeText={setIndication}
        />

        <Text style={styles.label}>Specific Defect Location & Extent</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Left mandibular angle extending to body"
          placeholderTextColor="#64748b"
          value={defectLocation}
          onChangeText={setDefectLocation}
        />

        <Text style={styles.label}>Surgical Notes & History</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Pre-op considerations, soft tissue status, radiation history…"
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>Register & Begin Workflow →</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#0f172a'
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1
  },
  cancelText: {
    color: '#94a3b8',
    fontSize: 13
  },
  formCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155'
  },
  label: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 6
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 8
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  row: {
    flexDirection: 'row',
    gap: 10
  },
  halfCol: {
    flex: 1
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  genderChip: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  genderChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  genderText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  genderTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  anatomyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10
  },
  anatomyChip: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#334155'
  },
  anatomyChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  anatomyText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  anatomyTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  cancelBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  }
});
