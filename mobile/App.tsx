import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity
} from 'react-native';
import type { Patient, UserSession } from './src/types';
import { fetchPatientsFromSupabase, signOutUser } from './src/lib/supabase';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { PatientListScreen } from './src/screens/PatientListScreen';
import { NewPatientScreen } from './src/screens/NewPatientScreen';
import { WorkflowScreen } from './src/screens/WorkflowScreen';
import { SupabaseConfigModal } from './src/screens/SupabaseConfigModal';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Screen routing
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'patients' | 'new_patient' | 'workflow'>('dashboard');
  const [workflowInitialStep, setWorkflowInitialStep] = useState<number>(2);

  // Config Modal
  const [configModalVisible, setConfigModalVisible] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPatientsFromSupabase();
      if (data && data.length > 0) {
        setPatients(data);
        if (!activePatientId) setActivePatientId(data[0].id);
      } else {
        // Fallback default sample patient
        const sample: Patient = {
          id: '10240',
          caseId: 'RECON-10240',
          name: 'Eleanor Vance',
          patientId: 'PID-8842',
          age: '44',
          gender: 'Female',
          contact: '+1 555-0192',
          anatomy: 'Mandible Body',
          indication: 'Osteoradionecrosis post-radiotherapy',
          defectLocation: 'Left mandibular angle & body',
          notes: 'Surgical resection planned. Microvascular reconstruction required.',
          workflowProgress: 1,
          status: 'Registered'
        };
        setPatients([sample]);
        setActivePatientId(sample.id);
      }
    } catch (e) {
      console.warn('Mobile load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0] || null;

  const handlePatientCreated = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setActivePatientId(newPatient.id);
    setCurrentScreen('workflow');
    setWorkflowInitialStep(2);
  };

  const handleRefreshPatient = (updated: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleNavigate = (screen: 'dashboard' | 'patients' | 'new_patient' | 'workflow', step?: number) => {
    if (step) setWorkflowInitialStep(step);
    setCurrentScreen(screen);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Initializing RECONAI Surgical Workspace…</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <LoginScreen
          onLoginSuccess={(s) => setSession(s)}
          onOpenConfig={() => setConfigModalVisible(true)}
        />
        <SupabaseConfigModal
          visible={configModalVisible}
          onClose={() => setConfigModalVisible(false)}
          onConfigSaved={loadData}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Main Screen Router */}
      {currentScreen === 'dashboard' && (
        <DashboardScreen
          session={session}
          patient={activePatient}
          onNavigate={handleNavigate}
          onOpenConfig={() => setConfigModalVisible(true)}
          onLogout={async () => {
            await signOutUser();
            setSession(null);
          }}
        />
      )}

      {currentScreen === 'patients' && (
        <PatientListScreen
          patients={patients}
          activePatientId={activePatientId}
          onSelectPatient={(id) => {
            setActivePatientId(id);
            setCurrentScreen('workflow');
          }}
          onNavigateNew={() => setCurrentScreen('new_patient')}
        />
      )}

      {currentScreen === 'new_patient' && (
        <NewPatientScreen
          onPatientCreated={handlePatientCreated}
          onCancel={() => setCurrentScreen('dashboard')}
        />
      )}

      {currentScreen === 'workflow' && activePatient && (
        <WorkflowScreen
          patient={activePatient}
          initialStep={workflowInitialStep}
          onRefreshPatient={handleRefreshPatient}
          onBackToDashboard={() => setCurrentScreen('dashboard')}
        />
      )}

      {/* Mobile Bottom Tab Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <Text style={[styles.navIcon, currentScreen === 'dashboard' && styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, currentScreen === 'dashboard' && styles.navLabelActive]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('new_patient')}
        >
          <Text style={[styles.navIcon, currentScreen === 'new_patient' && styles.navIconActive]}>➕</Text>
          <Text style={[styles.navLabel, currentScreen === 'new_patient' && styles.navLabelActive]}>New Case</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('workflow')}
        >
          <Text style={[styles.navIcon, currentScreen === 'workflow' && styles.navIconActive]}>⚙️</Text>
          <Text style={[styles.navLabel, currentScreen === 'workflow' && styles.navLabelActive]}>Workflow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('patients')}
        >
          <Text style={[styles.navIcon, currentScreen === 'patients' && styles.navIconActive]}>📋</Text>
          <Text style={[styles.navLabel, currentScreen === 'patients' && styles.navLabelActive]}>Records</Text>
        </TouchableOpacity>
      </View>

      <SupabaseConfigModal
        visible={configModalVisible}
        onClose={() => setConfigModalVisible(false)}
        onConfigSaved={loadData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600'
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingVertical: 8
  },
  navItem: {
    flex: 1,
    alignItems: 'center'
  },
  navIcon: {
    fontSize: 18,
    opacity: 0.6
  },
  navIconActive: {
    opacity: 1
  },
  navLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2
  },
  navLabelActive: {
    color: '#60a5fa'
  }
});
