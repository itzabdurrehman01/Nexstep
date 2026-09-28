import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ArrowLeft, LayoutGrid, X, Search, Sparkles, BookOpenCheck, Compass, Building2, GraduationCap, Wrench, Globe, Briefcase, Scale, Target, FileText, BookOpen, Mic, Bot, Users, UserCheck, Calendar, BarChart3, Settings, HelpCircle, Shield, Award, Layers } from 'lucide-react-native';
import { TabBar } from '../components/TabBar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../utils/theme';

const ArrowLeftIcon: any = ArrowLeft;
const LayoutGridIcon: any = LayoutGrid;
const XIcon: any = X;

// Import All Mobile Screens
import { DashboardScreen } from './DashboardScreen';
import { OnboardingScreen } from './OnboardingScreen';
import { Grade8MatricScreen } from './Grade8MatricScreen';
import { FscMapperScreen } from './FscMapperScreen';
import { UniversitiesScreen } from './UniversitiesScreen';
import { ScholarshipsScreen } from './ScholarshipsScreen';
import { TevtaItScreen } from './TevtaItScreen';
import { TransnationalScreen } from './TransnationalScreen';
import { DegreeCareerScreen } from './DegreeCareerScreen';
import { CareerComparisonScreen } from './CareerComparisonScreen';
import { CareerAIScreen } from './CareerAIScreen';
import { AssessmentScreen } from './AssessmentScreen';
import { SkillGapScreen } from './SkillGapScreen';
import { RoadmapScreen } from './RoadmapScreen';
import { ResumeScreen } from './ResumeScreen';
import { CoursesScreen } from './CoursesScreen';
import { MockInterviewScreen } from './MockInterviewScreen';
import { ChatbotScreen } from './ChatbotScreen';
import { VoiceAssistantScreen } from './VoiceAssistantScreen';
import { JobsScreen } from './JobsScreen';
import { CommunityScreen } from './CommunityScreen';
import { MentorshipScreen } from './MentorshipScreen';
import { CalendarNotifScreen } from './CalendarNotifScreen';
import { AnalyticsScreen } from './AnalyticsScreen';
import { SettingsScreen } from './SettingsScreen';
import { HelpCenterScreen } from './HelpCenterScreen';
import { RecruiterPortalScreen } from './RecruiterPortalScreen';
import { MentorPortalScreen } from './MentorPortalScreen';
import { AdminScreen } from './AdminScreen';
import { PricingScreen } from './PricingScreen';
import { DesignSystemScreen } from './DesignSystemScreen';
import { ExploreScreen } from './ExploreScreen';
import { ProfileScreen } from './ProfileScreen';
import { WorkspaceScreen } from './WorkspaceScreen';

interface ServiceItem {
  id: string;
  title: string;
  category: 'Pathways' | 'AI Tools' | 'Community' | 'Portals & System';
  icon: any;
  color: string;
}

const ALL_SERVICES: ServiceItem[] = [
  { id: 'grade8Matric', title: 'Grade 8 & Matric', category: 'Pathways', icon: BookOpenCheck, color: Colors.primary },
  { id: 'fscMapper', title: 'F.Sc & Inter Mapper', category: 'Pathways', icon: Compass, color: Colors.accent },
  { id: 'universities', title: 'Universities', category: 'Pathways', icon: Building2, color: Colors.info },
  { id: 'scholarships', title: 'Scholarships', category: 'Pathways', icon: GraduationCap, color: Colors.gold },
  { id: 'tevtaIt', title: 'TEVTA & IT Diplomas', category: 'Pathways', icon: Wrench, color: Colors.warning },
  { id: 'transnational', title: 'Foreign Degrees (TNE)', category: 'Pathways', icon: Globe, color: Colors.accent },

  { id: 'career', title: 'Career AI Engine', category: 'AI Tools', icon: Sparkles, color: Colors.primary },
  { id: 'skillGap', title: 'Skill Gap Analyzer', category: 'AI Tools', icon: Target, color: Colors.accent },
  { id: 'roadmap', title: 'Career Roadmap', category: 'AI Tools', icon: Compass, color: Colors.info },
  { id: 'resume', title: 'AI Resume Builder', category: 'AI Tools', icon: FileText, color: Colors.primary },
  { id: 'mockInterview', title: 'Mock Interview AI', category: 'AI Tools', icon: Mic, color: Colors.danger },
  { id: 'chatbot', title: 'AI Career Chatbot', category: 'AI Tools', icon: Bot, color: Colors.primary },
  { id: 'voiceAssistant', title: 'Voice Assistant', category: 'AI Tools', icon: Mic, color: Colors.warning },

  { id: 'degreeCareer', title: 'Degree to Career', category: 'Community', icon: Briefcase, color: Colors.primary },
  { id: 'careerComparison', title: 'Career Comparison', category: 'Community', icon: Scale, color: Colors.gold },
  { id: 'courses', title: 'Skill Courses', category: 'Community', icon: BookOpen, color: Colors.accent },
  { id: 'community', title: 'Community Forum', category: 'Community', icon: Users, color: Colors.primary },
  { id: 'mentorship', title: '1-on-1 Mentorship', category: 'Community', icon: UserCheck, color: Colors.info },
  { id: 'calendarNotif', title: 'Calendar & Alerts', category: 'Community', icon: Calendar, color: Colors.warning },

  { id: 'analytics', title: 'Career Analytics', category: 'Portals & System', icon: BarChart3, color: Colors.primary },
  { id: 'settings', title: 'Settings', category: 'Portals & System', icon: Settings, color: Colors.accent },
  { id: 'helpCenter', title: 'Help Center', category: 'Portals & System', icon: HelpCircle, color: Colors.gold },
  { id: 'recruiterPortal', title: 'Recruiter Portal', category: 'Portals & System', icon: Briefcase, color: Colors.info },
  { id: 'mentorPortal', title: 'Mentor Portal', category: 'Portals & System', icon: UserCheck, color: Colors.primary },
  { id: 'adminPanel', title: 'Admin Console', category: 'Portals & System', icon: Shield, color: Colors.danger },
  { id: 'pricing', title: 'Pricing Plans', category: 'Portals & System', icon: Award, color: Colors.gold },
  { id: 'designSystem', title: 'Design System', category: 'Portals & System', icon: Layers, color: Colors.accent },
  { id: 'onboarding', title: 'Profile Onboarding', category: 'Portals & System', icon: UserCheck, color: Colors.primary },
];

export function MainNavigator() {
  const { user } = useAuth();
  const role = user?.role?.toUpperCase() ?? 'STUDENT';
  const { dark, colors: c } = useTheme();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [navHistory, setNavHistory] = useState<string[]>(['home']);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const handleNavigate = useCallback((route: string) => {
    if (route === 'services') {
      setIsServicesOpen(true);
      return;
    }
    setIsServicesOpen(false);
    setNavHistory(prev => [...prev, route]);
    setActiveTab(route);
  }, []);

  const handleBack = () => {
    if (navHistory.length > 1) {
      const nextHistory = [...navHistory];
      nextHistory.pop();
      const prevRoute = nextHistory[nextHistory.length - 1];
      setNavHistory(nextHistory);
      setActiveTab(prevRoute);
    } else {
      setActiveTab('home');
    }
  };

  const isMainTab = ['home', 'explore', 'career', 'jobs', 'profile', 'workspace'].includes(activeTab);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.bg }]}>
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={c.bg}
      />

      {/* Top Header Bar for Sub-screens */}
      {!isMainTab && (
        <View style={[styles.headerBar, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <ArrowLeftIcon size={20} color={c.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>
            {ALL_SERVICES.find(s => s.id === activeTab)?.title ?? activeTab.toUpperCase()}
          </Text>
          <TouchableOpacity onPress={() => setIsServicesOpen(true)} style={styles.menuBtn}>
            <LayoutGridIcon size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Screen Router */}
      <View style={styles.content}>
        {activeTab === 'home' && <DashboardScreen onNavigate={handleNavigate} />}
        {activeTab === 'workspace' && <WorkspaceScreen />}
        {activeTab === 'explore' && <ExploreScreen onNavigate={handleNavigate} />}
        {activeTab === 'career' && <CareerAIScreen onNavigate={handleNavigate} />}
        {activeTab === 'roadmap' && <RoadmapScreen />}
        {activeTab === 'jobs' && <JobsScreen />}
        {activeTab === 'profile' && <ProfileScreen />}

        {/* All Extended Screens */}
        {activeTab === 'onboarding' && <OnboardingScreen onDone={() => handleNavigate('home')} />}
        {activeTab === 'grade8Matric' && <Grade8MatricScreen onNavigate={handleNavigate} />}
        {activeTab === 'fscMapper' && <FscMapperScreen onNavigate={handleNavigate} />}
        {activeTab === 'universities' && <UniversitiesScreen />}
        {activeTab === 'scholarships' && <ScholarshipsScreen />}
        {activeTab === 'tevtaIt' && <TevtaItScreen />}
        {activeTab === 'transnational' && <TransnationalScreen />}
        {activeTab === 'degreeCareer' && <DegreeCareerScreen />}
        {activeTab === 'careerComparison' && <CareerComparisonScreen />}
        {activeTab === 'quiz' && <AssessmentScreen onDone={() => handleNavigate('career')} />}
        {activeTab === 'skillGap' && <SkillGapScreen />}
        {activeTab === 'resume' && <ResumeScreen />}
        {activeTab === 'courses' && <CoursesScreen />}
        {activeTab === 'mockInterview' && <MockInterviewScreen />}
        {activeTab === 'chatbot' && <ChatbotScreen />}
        {activeTab === 'voiceAssistant' && <VoiceAssistantScreen />}
        {activeTab === 'community' && <CommunityScreen />}
        {activeTab === 'mentorship' && <MentorshipScreen />}
        {activeTab === 'calendarNotif' && <CalendarNotifScreen />}
        {activeTab === 'analytics' && <AnalyticsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
        {activeTab === 'helpCenter' && <HelpCenterScreen />}
        {activeTab === 'recruiterPortal' && <RecruiterPortalScreen />}
        {activeTab === 'mentorPortal' && <MentorPortalScreen />}
        {activeTab === 'adminPanel' && <AdminScreen />}
        {activeTab === 'pricing' && <PricingScreen />}
        {activeTab === 'designSystem' && <DesignSystemScreen />}
      </View>

      {/* Bottom Dock Navigation */}
      <TabBar activeTab={activeTab} onTabPress={handleNavigate} dark={dark} role={role} />

      {/* All Services Quick Launcher Drawer Modal */}
      <Modal visible={isServicesOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: c.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>NEXSTEP MOBILE SUITE</Text>
                <Text style={[styles.modalTitle, { color: c.text }]}>All Services & Features</Text>
              </View>
              <TouchableOpacity onPress={() => setIsServicesOpen(false)} style={styles.closeBtn}>
                <XIcon size={22} color={c.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.drawerScroll}>
              {['Pathways', 'AI Tools', 'Community', 'Portals & System'].map((cat) => (
                <View key={cat} style={{ gap: Spacing.xs }}>
                  <Text style={[styles.catHeading, { color: Colors.primary }]}>{cat.toUpperCase()}</Text>
                  <View style={styles.serviceGrid}>
                    {ALL_SERVICES.filter(s => s.category === cat).map((srv) => {
                      const IconComponent: any = srv.icon;
                      return (
                        <TouchableOpacity
                          key={srv.id}
                          onPress={() => handleNavigate(srv.id)}
                          style={[styles.serviceItem, { backgroundColor: c.surface2 }]}
                        >
                          <View style={[styles.iconBox, { backgroundColor: srv.color + '20' }]}>
                            <IconComponent size={20} color={srv.color} />
                          </View>
                          <Text numberOfLines={2} style={[styles.serviceText, { color: c.text }]}>{srv.title}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBar: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, borderBottomWidth: 1 },
  backBtn: { padding: Spacing.xs },
  menuBtn: { padding: Spacing.xs },
  headerTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  content: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: Radius['2xl'], borderTopRightRadius: Radius['2xl'], padding: Spacing['2xl'], maxHeight: '88%', gap: Spacing.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalEyebrow: { color: Colors.primary, fontSize: FontSize.xs, letterSpacing: 1.2, fontWeight: FontWeight.extrabold },
  modalTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  closeBtn: { padding: Spacing.xs },
  drawerScroll: { gap: Spacing.lg, paddingBottom: Spacing['2xl'] },
  catHeading: { fontSize: FontSize.xs, letterSpacing: 1.1, fontWeight: FontWeight.extrabold },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  serviceItem: { width: '31%', padding: Spacing.md, borderRadius: Radius.xl, alignItems: 'center', gap: Spacing.xs },
  iconBox: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  serviceText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, textAlign: 'center' },
});
