import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList
} from 'react-native';
import type { Patient } from '../types';

interface PatientListScreenProps {
  patients: Patient[];
  activePatientId: string | null;
  onSelectPatient: (id: string) => void;
  onNavigateNew: () => void;
}

export function PatientListScreen({ patients, activePatientId, onSelectPatient, onNavigateNew }: PatientListScreenProps) {
  const [search, setSearch] = useState('');

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.caseId.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId.toLowerCase().includes(search.toLowerCase()) ||
    p.anatomy.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.title}>PATIENT RECORDS</Text>
          <Text style={styles.subtitle}>{patients.length} Surgical Reconstruction Cases</Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={onNavigateNew}>
          <Text style={styles.newBtnText}>+ New Case</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search patient name, Case ID (e.g. RECON-10240), anatomy…"
        placeholderTextColor="#64748b"
        value={search}
        onChangeText={setSearch}
      />

      {/* Patient List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = item.id === activePatientId;
          return (
            <TouchableOpacity
              style={[styles.patientCard, isSelected && styles.patientCardSelected]}
              onPress={() => onSelectPatient(item.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.patientName}>{item.name}</Text>
                <Text style={styles.caseBadge}>{item.caseId}</Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.metaText}>PID: {item.patientId} • Age: {item.age || 'N/A'}</Text>
                <Text style={styles.metaText}>Defect Site: {item.defectLocation || item.anatomy || 'Unspecified'}</Text>
                {item.indication ? <Text style={styles.indicationText}>Indication: {item.indication}</Text> : null}
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{item.status}</Text>
                </View>
                <Text style={styles.progressText}>Step {item.workflowProgress}/7</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Matching Cases Found</Text>
            <Text style={styles.emptySub}>Try searching with a different case ID or register a new patient.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0f172a'
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1
  },
  subtitle: {
    color: '#64748b',
    fontSize: 12
  },
  newBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  newBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800'
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 14
  },
  patientCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  patientCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#1e293b'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  patientName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800'
  },
  caseBadge: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  cardBody: {
    gap: 2,
    marginBottom: 10
  },
  metaText: {
    color: '#cbd5e1',
    fontSize: 12
  },
  indicationText: {
    color: '#94a3b8',
    fontSize: 11,
    fontStyle: 'italic'
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155'
  },
  statusPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusPillText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700'
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyTitle: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700'
  },
  emptySub: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4
  }
});
