import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import {
  signInUser,
  signUpUser,
  fetchProfileByUserId,
  fetchProfileByEmail,
  fetchProfilesFromSupabase,
  logAuditEvent,
  signOutUser
} from '../lib/supabase';
import type { UserSession } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
  onOpenConfig?: () => void;
}

export function LoginScreen({ onLoginSuccess, onOpenConfig }: LoginScreenProps) {
  const [roleTab, setRoleTab] = useState<'surgeon' | 'admin'>('surgeon');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password;

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Check directory for pre-provisioned / registered profile first
      let profile = await fetchProfileByEmail(cleanEmail);

      // 2. Authenticate via Supabase Auth
      let authSuccess = false;
      let authUserId: string | null = null;

      try {
        const { data: authData, error: authError } = await signInUser(cleanEmail, cleanPass);
        if (!authError && authData?.user) {
          authSuccess = true;
          authUserId = authData.user.id;
        }
      } catch (authErr) {
        console.warn('Supabase Auth signIn notice:', authErr);
      }

      // If Supabase Auth failed, check if profile has passwordHash fallback (and auto-register in Supabase Auth)
      if (!authSuccess && profile && profile.passwordHash) {
        if (profile.passwordHash.toLowerCase() === cleanPass.toLowerCase()) {
          authSuccess = true;
          try {
            const { data: regData } = await signUpUser(cleanEmail, cleanPass);
            if (regData?.user) authUserId = regData.user.id;
          } catch (regErr) {
            console.warn('Auto Supabase Auth registration notice:', regErr);
          }
        }
      }

      if (!authSuccess) {
        await logAuditEvent(cleanEmail, roleTab.toUpperCase(), 'FAILED_LOGIN', 'Invalid email or password', 'FAILED');
        setErrorMsg('Invalid email or password.');
        setLoading(false);
        return;
      }

      // 3. Retrieve user profile by User ID (if available) or Email
      if (authUserId && !profile) {
        profile = await fetchProfileByUserId(authUserId);
      }

      if (!profile) {
        await signOutUser();
        await logAuditEvent(cleanEmail, roleTab.toUpperCase(), 'FAILED_LOGIN', 'Profile not found in hospital directory', 'DENIED');
        setErrorMsg('Your clinical profile could not be found. Please contact your hospital administrator.');
        setLoading(false);
        return;
      }

      // 4. Verify Account Status
      if (profile.status === 'SUSPENDED' || profile.status === 'INACTIVE') {
        await signOutUser();
        await logAuditEvent(cleanEmail, profile.role, 'BLOCKED_LOGIN', `Account status is ${profile.status}`, 'BLOCKED');
        setErrorMsg('Your account is currently inactive or suspended. Please contact the administrator.');
        setLoading(false);
        return;
      }

      // 5. Verify Role for selected tab
      if (roleTab === 'admin' && profile.role !== 'ADMIN') {
        await signOutUser();
        await logAuditEvent(cleanEmail, profile.role, 'UNAUTHORIZED_ADMIN_LOGIN', 'Surgeon attempted admin portal login', 'DENIED');
        setErrorMsg('Access denied. Administrator credentials required to access the Admin Portal.');
        setLoading(false);
        return;
      }

      if (roleTab === 'surgeon' && profile.role !== 'SURGEON' && profile.role !== 'CLINICAL_STAFF') {
        await signOutUser();
        await logAuditEvent(cleanEmail, profile.role, 'UNAUTHORIZED_SURGEON_LOGIN', 'Admin attempted surgeon workspace login', 'DENIED');
        setErrorMsg('Access denied. Clinical workspace requires a surgeon or clinical staff account.');
        setLoading(false);
        return;
      }

      // 6. Successful Authentication & Authorization
      await logAuditEvent(cleanEmail, profile.role, 'USER_LOGIN', `Successful mobile login via Supabase Auth`, 'SUCCESS');
      onLoginSuccess({
        id: profile.id,
        email: profile.email,
        role: profile.role,
        name: profile.fullName
      });
    } catch (err: any) {
      console.error('Mobile auth exception:', err);
      setErrorMsg(err.message || 'Unable to connect to the authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header Banner */}
      <View style={styles.headerBox}>
        <View style={styles.headerTopRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>RESTRICTED CLINICAL PORTAL</Text>
          </View>
          {onOpenConfig && (
            <TouchableOpacity style={styles.configBtn} onPress={onOpenConfig}>
              <Text style={styles.configBtnText}>⚙️ Server</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title}>RECONAI</Text>
        <Text style={styles.subtitle}>
          Hospital Staff Authentication Portal
        </Text>
        <Text style={styles.description}>
          AI-driven 3D maxillofacial reconstruction, volumetric defect analysis, and surgical planning.
        </Text>
      </View>

      {/* Role Switcher Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, roleTab === 'surgeon' && styles.tabItemActiveSurgeon]}
          onPress={() => { setRoleTab('surgeon'); setErrorMsg(''); }}
        >
          <Text style={[styles.tabText, roleTab === 'surgeon' && styles.tabTextActive]}>Surgeon Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, roleTab === 'admin' && styles.tabItemActiveAdmin]}
          onPress={() => { setRoleTab('admin'); setErrorMsg(''); }}
        >
          <Text style={[styles.tabText, roleTab === 'admin' && styles.tabTextActive]}>Admin Login</Text>
        </TouchableOpacity>
      </View>

      {/* Auth Form Card */}
      <View style={styles.formCard}>
        <Text style={styles.cardHeaderTitle}>
          {roleTab === 'admin' ? 'ADMINISTRATOR AUTHENTICATION' : 'CLINICIAN AUTHENTICATION'}
        </Text>
        <Text style={styles.cardHeaderSub}>Access restricted to authorized hospital staff.</Text>

        <Text style={styles.label}>{roleTab === 'admin' ? 'ADMIN EMAIL' : 'SURGEON / CLINICIAN EMAIL'}</Text>
        <TextInput
          style={styles.input}
          placeholder={roleTab === 'admin' ? 'Enter administrator email' : 'Enter hospital-approved email'}
          placeholderTextColor="#64748b"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>{roleTab === 'admin' ? 'ADMIN PASSWORD' : 'PASSWORD'}</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeBtnText}>{showPassword ? '🙈 Hide' : '👁️ View'}</Text>
          </TouchableOpacity>
        </View>

        {!!errorMsg && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryBtn, roleTab === 'admin' ? styles.adminBtn : styles.surgeonBtn]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryBtnText}>
              {roleTab === 'admin' ? 'Sign In to Admin Portal →' : 'Sign In to Clinical Workspace →'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0f172a',
    minHeight: '100%',
    justifyContent: 'center'
  },
  headerBox: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  badge: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  badgeText: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1
  },
  configBtn: {
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569'
  },
  configBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700'
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2
  },
  subtitle: {
    color: '#93c5fd',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 8
  },
  description: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  tabItemActiveSurgeon: {
    backgroundColor: '#2563eb'
  },
  tabItemActiveAdmin: {
    backgroundColor: '#0f172a'
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700'
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '900'
  },
  formCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardHeaderTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  cardHeaderSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 14
  },
  label: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14
  },
  passwordInput: {
    flex: 1,
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  eyeBtnText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '700'
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '600'
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  surgeonBtn: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb'
  },
  adminBtn: {
    backgroundColor: '#0f172a',
    shadowColor: '#0f172a'
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  }
});
