import { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import { useAppData } from '@/context/AppContext';

export const colors = {
  ink: '#142b3b',
  muted: '#617383',
  background: '#f3f6f8',
  surface: '#ffffff',
  border: '#dce4e9',
  primary: '#126b5b',
  primaryLight: '#e2f3ee',
  blue: '#245f9e',
  yellow: '#fff4d4',
  red: '#a93732',
  redLight: '#fbe9e7',
  green: '#20744d',
  greenLight: '#e5f4ea',
};

const NAV_TABS = [
  {
    key: 'inicio',
    label: 'Inicio',
    icon: '🏠',
    path: '/',
    isActive: (p: string) => p === '/' || p === '',
  },
  {
    key: 'nuevo',
    label: 'Nuevo',
    icon: '➕',
    path: '/reporte/nuevo',
    isActive: (p: string) => p.startsWith('/reporte/nuevo'),
  },
  {
    key: 'avisos',
    label: 'Avisos',
    icon: '🔔',
    path: '/avisos',
    isActive: (p: string) => p.startsWith('/avisos'),
    hasBadge: true,
  },
  {
    key: 'permisos',
    label: 'Permisos',
    icon: '🛡️',
    path: '/permisos',
    isActive: (p: string) => p.startsWith('/permisos'),
  },
  {
    key: 'ajustes',
    label: 'Ajustes',
    icon: '⚙️',
    path: '/ajustes-app',
    isActive: (p: string) => p.startsWith('/ajustes-app'),
  },
];

export function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { notices } = useAppData();

  return (
    <View style={styles.bottomNavContainer}>
      <SafeAreaView edges={['bottom']} style={styles.bottomNavInner}>
        {NAV_TABS.map((tab) => {
          const active = tab.isActive(pathname);
          const showBadge = tab.hasBadge && notices.length > 0;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              onPress={() => {
                if (pathname === tab.path) return;
                router.push(tab.path as any);
              }}
              style={({ pressed }) => [
                styles.bottomNavTab,
                active && styles.bottomNavTabActive,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.tabIconWrapper}>
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                {showBadge ? (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {notices.length > 9 ? '9+' : notices.length}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.bottomNavLabel,
                  active && styles.bottomNavLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </SafeAreaView>
    </View>
  );
}

export function Screen({
  children,
  style,
  hideNav = false,
}: PropsWithChildren<{
  style?: ViewStyle;
  hideNav?: boolean;
}>) {
  const { storageError } = useAppData();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.screen, style]}
        >
          {storageError ? <InlineError>{storageError}</InlineError> : null}
          {children}
        </ScrollView>
      </View>
      {!hideNav ? <BottomNavBar /> : null}
    </SafeAreaView>
  );
}

export function Eyebrow({ children }: PropsWithChildren) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Heading({ children, subtitle }: PropsWithChildren<{ subtitle?: string }>) {
  return (
    <View style={styles.heading}>
      <Text style={styles.title}>{children}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonProps = PropsWithChildren<{
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'quiet';
  disabled?: boolean;
  accessibilityLabel?: string;
}>;

export function ActionButton({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
}: ButtonProps) {
  const variantStyle = {
    primary: styles.button_primary,
    secondary: styles.button_secondary,
    danger: styles.button_danger,
    quiet: styles.button_quiet,
  }[variant];
  const textVariantStyle = {
    primary: styles.buttonText_primary,
    secondary: styles.buttonText_secondary,
    danger: styles.buttonText_danger,
    quiet: styles.buttonText_quiet,
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, textVariantStyle]}>{children}</Text>
    </Pressable>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  hint?: string;
};

export function Field({ label, hint, multiline, style, ...props }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multiline, style]}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function InlineError({ children }: PropsWithChildren) {
  return (
    <View accessibilityRole="alert" style={styles.errorBox}>
      <Text style={styles.errorText}>{children}</Text>
    </View>
  );
}

export function Loading({ label = 'Cargando…' }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.bodyText}>{label}</Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bottomNavContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  bottomNavInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  bottomNavTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  bottomNavTabActive: {
    backgroundColor: colors.primaryLight,
  },
  tabIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  bottomNavLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  bottomNavLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.red,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  screen: {
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  heading: {
    gap: 7,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  button_primary: {
    backgroundColor: colors.primary,
  },
  button_secondary: {
    backgroundColor: colors.primaryLight,
  },
  button_danger: {
    backgroundColor: colors.redLight,
  },
  button_quiet: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  buttonText_primary: {
    color: '#ffffff',
  },
  buttonText_secondary: {
    color: colors.primary,
  },
  buttonText_danger: {
    color: colors.red,
  },
  buttonText_quiet: {
    color: colors.ink,
  },
  field: {
    gap: 7,
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 11,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 15,
  },
  multiline: {
    minHeight: 116,
    paddingTop: 12,
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  errorBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0c3be',
    borderRadius: 12,
    backgroundColor: colors.redLight,
  },
  errorText: {
    color: colors.red,
    fontSize: 14,
    lineHeight: 20,
  },
  loading: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bodyText: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
