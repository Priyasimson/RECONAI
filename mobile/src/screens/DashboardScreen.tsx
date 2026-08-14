import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList
} from 'react-native';
import type { Patient, UserSession } from '../types';
import { getSupabaseConfig } from '../lib/supabase';

interface DashboardScreenProps {
  session: UserSession;
  patient: Patient | null;
  patients?: Patient[];
  onNavigate: (screen: 'dashboard' | 'patients' | 'new_patient' | 'workflow', workflowStep?: number) => void;
  onOpenConfig: () => void;
  onLogout: () => void;
}

export function DashboardScreen({
  session,
  patient,
  patients = [],
  onNavigate,
  onOpenConfig,
  onLogout
}: DashboardScreenProps) {
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [selectedClosedCase, setSelectedClosedCase] = useState<Patient | null>(null);

  const activeCasesCount = (patients || []).filter(
    (p) => p.status !== 'Closed' && p.status !== 'CLOSED' && p.status !== 'Completed'
  ).length;
  const totalPatientsCount = (patients || []).length;
  const closedPatients = (patients || []).filter(
    (p) => p.status === 'Closed' || p.status === 'CLOSED' || p.status === 'Completed'
  );
  const closedCasesCount = closedPatients.length;
  const graftPlansCount = (patients || []).filter((p) => p.graftPlan).length;

  const stats = [
    {
      id: 'active',
      label: 'ACTIVE RECONSTRUCTIONS',
      value: activeCasesCount.toString(),
      change: `${activeCasesCount} active case${activeCasesCount === 1 ? '' : 's'}`,
      dotColor: '#3b82f6',
      clickable: false
    },
    {
      id: 'total',
      label: 'TOTAL PATIENTS',
      value: totalPatientsCount.toString(),
      change: `${totalPatientsCount} registered patient${totalPatientsCount === 1 ? '' : 's'}`,
      dotColor: '#6366f1',
      clickable: false
    },
    {
      id: 'closed',
      label: 'CLOSED CASES',
      value: closedCasesCount.toString(),
      change: `${closedCasesCount} completed reconstruction case${closedCasesCount === 1 ? '' : 's'} (click to view)`,
      dotColor: '#64748b',
      clickable: true
    },
    {
      id: 'graft',
      label: 'GRAFT PLANS FORMULATED',
      value: graftPlansCount.toString(),
      change: `${graftPlansCount} formulated plan${graftPlansCount === 1 ? '' : 's'}`,
      dotColor: '#10b981',
      clickable: false
    }
  ];

  const workflowItems = [
    { label: 'Patient Registration', step: 1, path: 'new_patient' as const },
    { label: 'Upload Imaging & DICOM', step: 2, path: 'workflow' as const },
    { label: 'AI Volume Analysis & Result Summary', step: 3, path: 'workflow' as const },
    { label: 'Anatomical Classification', step: 4, path: 'workflow' as const },
    { label: 'Autogenous / Custom Graft Planning', step: 5, path: 'workflow' as const },
    { label: 'Fixation & Biomechanical Plate Design', step: 6, path: 'workflow' as const },
    { label: 'Reconstruction Simulation & Report', step: 7, path: 'workflow' as const }
  ];

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Navigation / Clinician Header Bar */}
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <View style={styles.brandIconBox}>
              <Text style={styles.brandIconText}>⚡</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>RECONAI</Text>
              <Text style={styles.brandSub}>Surgical Workspace</Text>
            </View>
          </View>
          <View style={styles.userSection}>
            <Text style={styles.userEmailText} numberOfLines={1}>
              {session.email}
            </Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dashboard Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.titleIconBox}>
            <Text style={styles.titleIconText}>📈</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mainTitle}>RECONAI Clinical Dashboard</Text>
            <Text style={styles.mainSub}>AI-driven 3D reconstruction & surgical planning workflow platform.</Text>
          </View>
        </View>

        {/* 4 Stat Metric Cards (Light Clean Theme) */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <TouchableOpacity
              key={stat.id}
              activeOpacity={stat.clickable ? 0.7 : 1}
              onPress={() => stat.clickable && setShowClosedModal(true)}
              style={[
                styles.statCard,
                stat.clickable && styles.statCardClickable
              ]}
            >
              <View style={styles.statCardHeader}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={[styles.dotIndicator, { backgroundColor: stat.dotColor }]} />
              </View>
              <Text style={styles.statVal}>{stat.value}</Text>
              <Text style={styles.statSub} numberOfLines={1}>{stat.change}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Workflow Progress Tracker */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.cardTitle}>Surgical Workflow Tracker</Text>
            <View style={styles.caseBadge}>
              <Text style={styles.caseBadgeText}>
                Case: {patient?.caseId || 'No active patient'}
              </Text>
            </View>
          </View>

          <View style={styles.workflowList}>
            {workflowItems.map((item) => {
              const completed = patient?.workflowProgress ? item.step <= patient.workflowProgress : item.step === 1;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.workflowRow, completed && styles.workflowRowDone]}
                  onPress={() => onNavigate(item.path, item.step)}
                >
                  <View style={styles.workflowLeft}>
                    <View style={[styles.checkCircle, completed && styles.checkCircleDone]}>
                      <Text style={[styles.checkText, completed && styles.checkTextDone]}>
                        {completed ? '✓' : item.step}
                      </Text>
                    </View>
                    <Text style={[styles.workflowLabel, completed && styles.workflowLabelDone]}>
                      {item.label}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActionsCol}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => onNavigate('new_patient')}
            >
              <View style={[styles.quickIconBadge, { backgroundColor: '#2563eb' }]}>
                <Text style={styles.quickIconText}>👤+</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quickTitle}>Register New Patient</Text>
                <Text style={styles.quickSub}>Add clinical history & defect location</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => onNavigate('workflow', 2)}
            >
              <View style={[styles.quickIconBadge, { backgroundColor: '#4f46e5' }]}>
                <Text style={styles.quickIconText}>🖼️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quickTitle}>Upload Medical Imaging</Text>
                <Text style={styles.quickSub}>DICOM, CT, CBCT & interactive filters</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => onNavigate('workflow', 3)}
            >
              <View style={[styles.quickIconBadge, { backgroundColor: '#059669' }]}>
                <Text style={styles.quickIconText}>🧠</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.quickTitle}>AI Volumetric Analysis</Text>
                <Text style={styles.quickSub}>Quantify missing volume & result summary</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Patient Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardSubHeader}>ACTIVE PATIENT SUMMARY</Text>
          {patient ? (
            <View style={styles.patientDetailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Patient Name:</Text>
                <Text style={styles.detailValBold}>{patient.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Case ID:</Text>
                <Text style={styles.caseIdBlue}>{patient.caseId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Defect Site:</Text>
                <Text style={styles.detailVal}>{patient.defectLocation || patient.anatomy}</Text>
              </View>
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.statusGreen}>{patient.status}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noActiveText}>No active case selected.</Text>
          )}
        </View>

      </ScrollView>

      {/* Closed Cases Historical View Modal */}
      <Modal
        visible={showClosedModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowClosedModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Closed Reconstruction Cases</Text>
                <Text style={styles.modalSub}>
                  {closedPatients.length} completed cases archived in database
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseIconBtn}
                onPress={() => {
                  setShowClosedModal(false);
                  setSelectedClosedCase(null);
                }}
              >
                <Text style={styles.modalCloseIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Closed Cases List */}
            {closedPatients.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>
                  No closed cases yet. Cases marked as closed will be listed here.
                </Text>
              </View>
            ) : (
              <FlatList
                data={closedPatients}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 380 }}
                renderItem={({ item: c }) => {
                  const isSelected = selectedClosedCase?.id === c.id;
                  return (
                    <View style={styles.closedCaseCard}>
                      <View style={styles.closedCardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.closedCaseName}>{c.name}</Text>
                          <Text style={styles.closedCaseId}>
                            {c.patientId ? `${c.patientId} • ` : ''}{c.caseId}
                          </Text>
                        </View>
                        <View style={styles.closedBadge}>
                          <Text style={styles.closedBadgeText}>CLOSED</Text>
                        </View>
                      </View>

                      <View style={styles.closedInfoGrid}>
                        <Text style={styles.closedInfoText}>
                          <Text style={styles.labelMuted}>Anatomy: </Text>
                          {c.anatomy || 'Mandible'}
                        </Text>
                        <Text style={styles.closedInfoText}>
                          <Text style={styles.labelMuted}>Indication: </Text>
                          {c.indication || 'Resection Defect'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.closedDetailsBtn}
                        onPress={() => setSelectedClosedCase(isSelected ? null : c)}
                      >
                        <Text style={styles.closedDetailsBtnText}>
                          {isSelected ? 'Hide Case Details' : '📄 View Archived Analysis & Report'}
                        </Text>
                      </TouchableOpacity>

                      {isSelected && (
                        <View style={styles.archivedDetailsBox}>
                          <Text style={styles.archivedSectionTitle}>ARCHIVED AI VOLUMETRIC RESULT</Text>
                          {c.analysis ? (
                            <View style={styles.archivedMetricsGrid}>
                              <Text style={styles.archivedMetricText}>Missing Bone: <Text style={styles.valBlue}>{c.analysis.boneVolumeMissing} cm³</Text></Text>
                              <Text style={styles.archivedMetricText}>Soft Tissue: <Text style={styles.valAmber}>{c.analysis.softTissueRequirement} cm³</Text></Text>
                              <Text style={styles.archivedMetricText}>Dimensions: {c.analysis.defectLength}x{c.analysis.defectWidth}x{c.analysis.defectDepth} mm</Text>
                              <Text style={styles.archivedMetricText}>Confidence: <Text style={styles.valGreen}>{c.analysis.modelConfidence}%</Text></Text>
                            </View>
                          ) : (
                            <Text style={styles.italicText}>No AI volumetric analysis saved for this case.</Text>
                          )}

                          {c.report?.content && (
                            <View style={{ marginTop: 8 }}>
                              <Text style={styles.archivedSectionTitle}>ARCHIVED SURGICAL REPORT</Text>
                              <View style={styles.reportCodeBox}>
                                <Text style={styles.reportCodeText}>{c.report.content}</Text>
                              </View>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                }}
              />
            )}

            {/* Modal Bottom Action */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  setShowClosedModal(false);
                  setSelectedClosedCase(null);
                }}
              >
                <Text style={styles.modalCloseBtnText}>Close View</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  brandIconBox: {
    backgroundColor: '#2563eb',
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandIconText: {
    color: '#ffffff',
    fontSize: 16
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.5
  },
  brandSub: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700'
  },
  userSection: {
    alignItems: 'flex-end'
  },
  userEmailText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    maxWidth: 140
  },
  logoutBtn: {
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#f1f5f9',
    borderRadius: 6
  },
  logoutBtnText: {
    fontSize: 10,
    color: '#e11d48',
    fontWeight: '700'
  },
  titleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    gap: 12
  },
  titleIconBox: {
    backgroundColor: '#2563eb',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleIconText: {
    fontSize: 20
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a'
  },
  mainSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  statCardClickable: {
    borderColor: '#93c5fd',
    backgroundColor: '#f8fafc'
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    flex: 1
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4
  },
  statVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginVertical: 4
  },
  statSub: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500'
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a'
  },
  cardSubHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 10
  },
  caseBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  caseBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8'
  },
  workflowList: {
    gap: 8
  },
  workflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  workflowRowDone: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0'
  },
  workflowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkCircleDone: {
    backgroundColor: '#10b981',
    borderColor: '#10b981'
  },
  checkText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b'
  },
  checkTextDone: {
    color: '#ffffff'
  },
  workflowLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155'
  },
  workflowLabelDone: {
    color: '#065f46'
  },
  chevron: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '700'
  },
  quickActionsCol: {
    gap: 8,
    marginTop: 10
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12
  },
  quickIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quickIconText: {
    fontSize: 16,
    color: '#ffffff'
  },
  quickTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a'
  },
  quickSub: {
    fontSize: 10,
    color: '#64748b'
  },
  patientDetailsBox: {
    gap: 6
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  detailLabel: {
    fontSize: 11,
    color: '#94a3b8'
  },
  detailValBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a'
  },
  caseIdBlue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563eb'
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155'
  },
  statusGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669'
  },
  noActiveText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 8
  },
  /* Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10,
    marginBottom: 10
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a'
  },
  modalSub: {
    fontSize: 10,
    color: '#64748b'
  },
  modalCloseIconBtn: {
    padding: 4
  },
  modalCloseIconText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '700'
  },
  modalEmpty: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  modalEmptyText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center'
  },
  closedCaseCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10
  },
  closedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  closedCaseName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a'
  },
  closedCaseId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb'
  },
  closedBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  closedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#334155'
  },
  closedInfoGrid: {
    gap: 2,
    marginVertical: 4
  },
  closedInfoText: {
    fontSize: 11,
    color: '#334155'
  },
  labelMuted: {
    color: '#94a3b8'
  },
  closedDetailsBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 6
  },
  closedDetailsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb'
  },
  archivedDetailsBox: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10
  },
  archivedSectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  archivedMetricsGrid: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    gap: 4
  },
  archivedMetricText: {
    fontSize: 10,
    color: '#334155'
  },
  valBlue: { color: '#1e3a8a', fontWeight: '800' },
  valAmber: { color: '#78350f', fontWeight: '800' },
  valGreen: { color: '#047857', fontWeight: '800' },
  italicText: { fontSize: 10, color: '#94a3b8', fontStyle: 'italic' },
  reportCodeBox: {
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 8
  },
  reportCodeText: {
    color: '#f8fafc',
    fontSize: 9,
    fontFamily: 'monospace'
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    alignItems: 'flex-end'
  },
  modalCloseBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12
  },
  modalCloseBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  }
});
