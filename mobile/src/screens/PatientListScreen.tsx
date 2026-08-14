import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import type { Patient } from '../types';
import { savePatientToSupabase, deletePatientFromSupabase } from '../lib/supabase';

interface PatientListScreenProps {
  patients: Patient[];
  activePatientId: string | null;
  onSelectPatient: (id: string) => void;
  onNavigateNew: () => void;
  onRefreshData?: () => Promise<void>;
  userEmail?: string;
  userId?: string;
}

export function PatientListScreen({
  patients,
  activePatientId,
  onSelectPatient,
  onNavigateNew,
  onRefreshData,
  userEmail,
  userId
}: PatientListScreenProps) {
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    patientId: '',
    age: '',
    gender: 'Male',
    contact: '',
    defectLocation: '',
    indication: '',
    notes: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const handleRefresh = async () => {
    if (onRefreshData) {
      setRefreshing(true);
      try {
        await onRefreshData();
      } finally {
        setRefreshing(false);
      }
    }
  };

  const openEditModal = (p: Patient) => {
    setEditingPatient(p);
    setEditForm({
      name: p.name,
      patientId: p.patientId || '',
      age: p.age || '',
      gender: p.gender || 'Male',
      contact: p.contact || '',
      defectLocation: p.defectLocation || p.anatomy || '',
      indication: p.indication || '',
      notes: p.notes || ''
    });
  };

  const saveEdit = async () => {
    if (!editingPatient) return;
    setSavingEdit(true);

    const updatedPatient: Patient = {
      ...editingPatient,
      name: editForm.name,
      patientId: editForm.patientId,
      age: editForm.age,
      gender: editForm.gender,
      contact: editForm.contact,
      defectLocation: editForm.defectLocation,
      anatomy: editForm.defectLocation,
      indication: editForm.indication,
      notes: editForm.notes
    };

    try {
      const success = await savePatientToSupabase(updatedPatient, userEmail, userId);
      if (success) {
        if (onRefreshData) await onRefreshData();
        setEditingPatient(null);
      } else {
        Alert.alert('Save Failed', 'Unable to update patient record in database.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update patient.');
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = (p: Patient) => {
    Alert.alert(
      'Delete Patient Record',
      `Are you sure you want to delete patient "${p.name}" (${p.caseId})? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deletePatientFromSupabase(p.id);
            if (success) {
              if (onRefreshData) await onRefreshData();
            } else {
              Alert.alert('Delete Failed', 'You are not authorized to delete this patient or database error occurred.');
            }
          }
        }
      ]
    );
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.caseId.toLowerCase().includes(search.toLowerCase()) ||
    (p.patientId && p.patientId.toLowerCase().includes(search.toLowerCase())) ||
    (p.defectLocation && p.defectLocation.toLowerCase().includes(search.toLowerCase())) ||
    (p.anatomy && p.anatomy.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.title}>PATIENT RECORDS</Text>
          <Text style={styles.subtitle}>{patients.length} Surgical Reconstruction Cases</Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={onNavigateNew}>
          <Text style={styles.newBtnText}>+ Register New Patient</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name, Case ID (e.g. RECON-10240), anatomy…"
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
      />

      {/* Patients List with Pull to Refresh */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563eb']} />
        }
        renderItem={({ item }) => {
          const isSelected = item.id === activePatientId;
          return (
            <View style={[styles.patientCard, isSelected && styles.patientCardSelected]}>
              
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.patientName}>{item.name}</Text>
                  <Text style={styles.caseBadge}>Case ID: {item.caseId}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.metaText}>
                  <Text style={styles.metaLabel}>PID: </Text>{item.patientId || 'N/A'} • <Text style={styles.metaLabel}>Age/Gender: </Text>{item.age || 'N/A'} / {item.gender || 'N/A'}
                </Text>
                <Text style={styles.metaText}>
                  <Text style={styles.metaLabel}>Defect Site: </Text>{item.defectLocation || item.anatomy || 'Unspecified'}
                </Text>
                {item.indication ? (
                  <Text style={styles.indicationText}>
                    <Text style={styles.metaLabel}>Indication: </Text>{item.indication}
                  </Text>
                ) : null}
                {item.assignedDoctorEmail ? (
                  <Text style={styles.doctorText}>
                    <Text style={styles.metaLabel}>Assigned Doctor: </Text>{item.assignedDoctorEmail}
                  </Text>
                ) : null}
              </View>

              {/* Action Buttons Row */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
                  onPress={() => onSelectPatient(item.id)}
                >
                  <Text style={[styles.selectBtnText, isSelected && styles.selectBtnTextActive]}>
                    {isSelected ? '✓ Active Case' : 'Select Case →'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.rightActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                    <Text style={styles.editBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item)}>
                    <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Matching Records Found</Text>
            <Text style={styles.emptySub}>
              {search ? 'Try adjusting your search criteria.' : 'Pull down to refresh or register a new patient.'}
            </Text>
          </View>
        }
      />

      {/* Edit Patient Modal */}
      <Modal
        visible={Boolean(editingPatient)}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditingPatient(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Patient Record</Text>
              <TouchableOpacity onPress={() => setEditingPatient(null)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.fieldLabel}>FULL PATIENT NAME</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.name}
                onChangeText={(val) => setEditForm({ ...editForm, name: val })}
              />

              <Text style={styles.fieldLabel}>PATIENT ID (MRN)</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.patientId}
                onChangeText={(val) => setEditForm({ ...editForm, patientId: val })}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>AGE</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    value={editForm.age}
                    onChangeText={(val) => setEditForm({ ...editForm, age: val })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>GENDER</Text>
                  <TextInput
                    style={styles.formInput}
                    value={editForm.gender}
                    onChangeText={(val) => setEditForm({ ...editForm, gender: val })}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>CONTACT PHONE</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.contact}
                onChangeText={(val) => setEditForm({ ...editForm, contact: val })}
              />

              <Text style={styles.fieldLabel}>DEFECT LOCATION / ANATOMY</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.defectLocation}
                onChangeText={(val) => setEditForm({ ...editForm, defectLocation: val })}
              />

              <Text style={styles.fieldLabel}>PRIMARY CLINICAL INDICATION</Text>
              <TextInput
                style={styles.formInput}
                value={editForm.indication}
                onChangeText={(val) => setEditForm({ ...editForm, indication: val })}
              />

              <Text style={styles.fieldLabel}>CLINICAL NOTES</Text>
              <TextInput
                style={[styles.formInput, { minHeight: 70 }]}
                multiline={true}
                value={editForm.notes}
                onChangeText={(val) => setEditForm({ ...editForm, notes: val })}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditingPatient(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={saveEdit}
                disabled={savingEdit}
              >
                <Text style={styles.saveBtnText}>
                  {savingEdit ? 'Saving…' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  newBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  newBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800'
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 14
  },
  patientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  patientCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#f0f9ff'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  patientName: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '900'
  },
  caseBadge: {
    color: '#2563eb',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2
  },
  statusPill: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  statusPillText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '800'
  },
  cardBody: {
    gap: 3,
    marginBottom: 12
  },
  metaText: {
    color: '#334155',
    fontSize: 12
  },
  metaLabel: {
    color: '#94a3b8',
    fontWeight: '600'
  },
  indicationText: {
    color: '#475569',
    fontSize: 11
  },
  doctorText: {
    color: '#4f46e5',
    fontSize: 11
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  selectBtn: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  selectBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  selectBtnText: {
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: '800'
  },
  selectBtnTextActive: {
    color: '#ffffff'
  },
  rightActions: {
    flexDirection: 'row',
    gap: 6
  },
  editBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  editBtnText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700'
  },
  deleteBtn: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  deleteBtnText: {
    color: '#e11d48',
    fontSize: 11,
    fontWeight: '700'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '800'
  },
  emptySub: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4
  },
  /* Edit Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a'
  },
  modalCloseIcon: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '700'
  },
  modalScroll: {
    gap: 8,
    paddingBottom: 12
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginTop: 4
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    color: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9'
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700'
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#2563eb'
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  }
});
