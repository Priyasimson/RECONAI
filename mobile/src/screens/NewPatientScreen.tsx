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
  userEmail?: string;
  userId?: string;
}

export function NewPatientScreen({ onPatientCreated, onCancel, userEmail, userId }: NewPatientScreenProps) {
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
      status: 'Registered',
      assignedDoctorId: userId || 'UNASSIGNED',
      assignedDoctorEmail: userEmail || 'UNASSIGNED',
      createdBy: userEmail || 'UNASSIGNED'
    };

    try {
      // Save directly to shared Supabase DB
      await savePatientToSupabase(newPatient, userEmail, userId);
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
        <View>
          <Text style={styles.title}>NEW PATIENT REGISTRATION</Text>
          <Text style={styles.subtitle}>Register new case to shared surgical database</Text>
        </View>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Patient Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Eleanor Vance"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Patient ID (MRN)</Text>
            <TextInput
              style={styles.input}
              placeholder="PID-8842"
              placeholderTextColor="#94a3b8"
              value={patientId}
              onChangeText={setPatientId}
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="44"
              placeholderTextColor="#94a3b8"
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
          placeholderTextColor="#94a3b8"
          value={indication}
          onChangeText={setIndication}
        />

        <Text style={styles.label}>Specific Defect Location & Extent</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Left mandibular angle extending to body"
          placeholderTextColor="#94a3b8"
          value={defectLocation}
          onChangeText={setDefectLocation}
        />

        <Text style={styles.label}>Surgical Notes & History</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Pre-op considerations, soft tissue status, radiation history…"
          placeholderTextColor="#94a3b8"
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
    backgroundColor: '#f8fafc'
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  title: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  subtitle: {
    color: '#64748b',
    fontSize: 11
  },
  cancelBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  cancelText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700'
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  label: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    color: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 6
  },
  textArea: {
    height: 70,
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
    marginBottom: 6
  },
  genderChip: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  genderChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  genderText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600'
  },
  genderTextActive: {
    color: '#ffffff',
    fontWeight: '800'
  },
  anatomyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6
  },
  anatomyChip: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  anatomyChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  anatomyText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600'
  },
  anatomyTextActive: {
    color: '#ffffff',
    fontWeight: '800'
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
  }
});
