import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import type { Patient, UserSession } from '../types';
import { getSupabaseConfig } from '../lib/supabase';

interface DashboardScreenProps {
  session: UserSession;
  patient: Patient | null;
  onNavigate: (screen: 'dashboard' | 'patients' | 'new_patient' | 'workflow', workflowStep?: number) => void;
  onOpenConfig: () => void;
  onLogout: () => void;
}

export function DashboardScreen({ session, patient, onNavigate, onOpenConfig, onLogout }: DashboardScreenProps) {
  const config = getSupabaseConfig();
  const isConnected = Boolean(config.url && config.key);

  const workflowSteps = [
    { step: 1, title: 'Patient Registration', desc: 'Case ID & defect location' },
    { step: 2, title: 'Upload Imaging & DICOM', desc: 'CT, CBCT & slice thickness' },
    { step: 3, title: 'AI Volumetric Analysis', desc: 'Missing bone & soft tissue volume' },
    { step: 4, title: 'Anatomical Classification', desc: 'Defect severity rating' },
    { step: 5, title: 'Graft Planning', desc: 'Autogenous / Custom graft' },
    { step: 6, title: 'Fixation Plate Design', desc: 'Biomechanical load analysis' },
    { step: 7, title: 'Reconstruction Simulation', desc: '3D Mesh & surgical report' }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Clinician Header Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appTitle}>RECONAI HUB</Text>
          <Text style={styles.userEmail}>{session.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>



      {/* Overview Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>ACTIVE CASE</Text>
          <Text style={styles.statVal}>{patient ? '1' : '0'}</Text>
          <Text style={styles.statSub} numberOfLines={1}>{patient?.name || 'No case selected'}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>AI ACCURACY</Text>
          <Text style={styles.statVal}>{patient?.analysis ? `${patient.analysis.modelConfidence}%` : 'N/A'}</Text>
          <Text style={styles.statSub}>{patient?.analysis ? '3D Seg Complete' : 'Pending Upload'}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>GRAFT CHOICE</Text>
          <Text style={styles.statVal}>{patient?.graftPlan?.selectedGraft || 'None'}</Text>
          <Text style={styles.statSub}>{patient?.graftPlan ? 'Plan Formulated' : 'Step 5'}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>PROGRESS</Text>
          <Text style={styles.statVal}>{patient ? `${patient.workflowProgress}/7` : '0/7'}</Text>
          <Text style={styles.statSub}>{patient?.status || 'Unregistered'}</Text>
        </View>
      </View>

      {/* Active Case Banner */}
      <View style={styles.activeCaseCard}>
        <Text style={styles.sectionHeader}>CURRENT SURGICAL PATIENT</Text>
        {patient ? (
          <View style={styles.patientInfoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Patient Name:</Text>
              <Text style={styles.infoValBold}>{patient.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Case Identifier:</Text>
              <Text style={styles.caseIdText}>{patient.caseId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Defect Site:</Text>
              <Text style={styles.infoVal}>{patient.defectLocation || patient.anatomy}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Workflow Status:</Text>
              <Text style={styles.statusText}>{patient.status}</Text>
            </View>

            <TouchableOpacity style={styles.continueBtn} onPress={() => onNavigate('workflow')}>
              <Text style={styles.continueBtnText}>Open Reconstruction Workflow →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No surgical case selected.</Text>
            <TouchableOpacity style={styles.createCaseBtn} onPress={() => onNavigate('new_patient')}>
              <Text style={styles.createCaseBtnText}>+ Register New Patient Case</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Reconstruction Workflow Tracker */}
      <View style={styles.workflowCard}>
        <Text style={styles.sectionHeader}>RECONSTRUCTION WORKFLOW STEPS</Text>
        {workflowSteps.map((item) => {
          const completed = patient?.workflowProgress ? item.step <= patient.workflowProgress : item.step === 1;
          return (
            <TouchableOpacity
              key={item.step}
              style={[styles.stepItem, completed && styles.stepItemDone]}
              onPress={() => onNavigate('workflow', item.step)}
            >
              <View style={[styles.stepNumBox, completed && styles.stepNumBoxDone]}>
                <Text style={[styles.stepNumText, completed && styles.stepNumTextDone]}>
                  {completed ? '✓' : item.step}
                </Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Action Navigation Grid */}
      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate('new_patient')}>
          <Text style={styles.quickIcon}>➕</Text>
          <Text style={styles.quickTitle}>New Patient</Text>
          <Text style={styles.quickSub}>Register case</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate('patients')}>
          <Text style={styles.quickIcon}>📋</Text>
          <Text style={styles.quickTitle}>Patient Records</Text>
          <Text style={styles.quickSub}>View all cases</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate('workflow', 2)}>
          <Text style={styles.quickIcon}>📷</Text>
          <Text style={styles.quickTitle}>Upload Imaging</Text>
          <Text style={styles.quickSub}>DICOM & CT scans</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={() => onNavigate('workflow', 3)}>
          <Text style={styles.quickIcon}>🧠</Text>
          <Text style={styles.quickTitle}>AI Analysis</Text>
          <Text style={styles.quickSub}>Volume & 3D mesh</Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 12
  },
  logoutBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },
  logoutText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600'
  },
  dbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  dbDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  dbBadgeText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    flex: 1
  },
  dbConfigBtn: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '700'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155'
  },
  statLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  statVal: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginVertical: 4
  },
  statSub: {
    color: '#94a3b8',
    fontSize: 11
  },
  activeCaseCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  sectionHeader: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12
  },
  patientInfoBox: {
    gap: 8
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 12
  },
  infoValBold: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  caseIdText: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '800'
  },
  infoVal: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600'
  },
  statusText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '700'
  },
  continueBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8
  },
  continueBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800'
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 16
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 12
  },
  createCaseBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  createCaseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  workflowCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  stepItemDone: {
    borderColor: '#059669',
    backgroundColor: 'rgba(16, 185, 129, 0.08)'
  },
  stepNumBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  stepNumBoxDone: {
    backgroundColor: '#10b981'
  },
  stepNumText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800'
  },
  stepNumTextDone: {
    color: '#ffffff'
  },
  stepContent: {
    flex: 1
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  stepDesc: {
    color: '#64748b',
    fontSize: 11
  },
  chevron: {
    color: '#64748b',
    fontSize: 20,
    fontWeight: '600'
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24
  },
  quickCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: 6
  },
  quickTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  quickSub: {
    color: '#64748b',
    fontSize: 10
  }
});
