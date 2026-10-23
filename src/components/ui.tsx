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

export function Screen({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const { storageError } = useAppData();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.screen, style]}
      >
        {storageError ? <InlineError>{storageError}</InlineError> : null}
        {children}
      </ScrollView>
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
  screen: {
    gap: 18,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
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
