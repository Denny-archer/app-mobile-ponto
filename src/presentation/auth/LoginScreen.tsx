import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { z } from "zod";

import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { InfoCard } from "../components/InfoCard";
import { Screen } from "../components/Screen";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useAuthStore } from "./authStore";

const loginSchema = z.object({
  login: z
    .string()
    .trim()
    .min(1, "Informe matrícula, e-mail ou CPF."),
  password: z
    .string()
    .min(1, "Informe sua senha."),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const signIn = useAuthStore((state) => state.signIn);
  const authError = useAuthStore((state) => state.error);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginForm) {
    try {
      setIsSubmitting(true);

      await signIn({
        login: values.login.trim(),
        password: values.password,
      });
    } catch {
      // O authStore converte o erro da API em mensagem visível.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardContainer}
    >
      <Screen scroll>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View
              pointerEvents="none"
              style={[styles.decorativeCircle, styles.circleTop]}
            />

            <View
              pointerEvents="none"
              style={[styles.decorativeCircle, styles.circleBottom]}
            />

            <View style={styles.brandIcon}>
              <ShieldCheck
                color={colors.primary}
                size={34}
                strokeWidth={2.2}
              />
            </View>

            <Text style={styles.brand}>Ponto Eletrônico</Text>

            <Text style={styles.heroSubtitle}>
              Registre e acompanhe sua jornada de trabalho
            </Text>

            <View style={styles.securityBadge}>
              <LockKeyhole
                color={colors.white}
                size={13}
                strokeWidth={2.2}
              />

              <Text style={styles.securityBadgeText}>
                Acesso seguro
              </Text>
            </View>
          </View>

          <InfoCard style={styles.loginCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                Bem-vindo de volta
              </Text>

              <Text style={styles.formSubtitle}>
                Informe seus dados para acessar sua conta.
              </Text>
            </View>

            <View style={styles.form}>
              <Controller
                control={control}
                name="login"
                render={({
                  field: {
                    onBlur,
                    onChange,
                    value,
                  },
                }) => (
                  <AppTextInput
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect={false}
                    error={errors.login?.message}
                    label="Matrícula, e-mail ou CPF"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="Digite seu acesso"
                    returnKeyType="next"
                    textContentType="username"
                    value={value}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({
                  field: {
                    onBlur,
                    onChange,
                    value,
                  },
                }) => (
                  <AppTextInput
                    autoCapitalize="none"
                    autoComplete="current-password"
                    autoCorrect={false}
                    error={errors.password?.message}
                    label="Senha"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    onSubmitEditing={handleSubmit(onSubmit)}
                    placeholder="Digite sua senha"
                    returnKeyType="go"
                    secureTextEntry
                    textContentType="password"
                    value={value}
                  />
                )}
              />

              {authError ? (
                <View
                  accessibilityLiveRegion="polite"
                  style={styles.errorBox}
                >
                  <Text style={styles.errorText}>
                    {authError}
                  </Text>
                </View>
              ) : null}

              <AppButton
                loading={isSubmitting}
                onPress={handleSubmit(onSubmit)}
                title="Entrar"
              />
            </View>
          </InfoCard>

          <View style={styles.securityNote}>
            <ShieldCheck
              color={colors.muted}
              size={16}
            />

            <Text style={styles.securityNoteText}>
              Seus dados são protegidos e usados somente para autenticação.
            </Text>
          </View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },

  hero: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 28,
    minHeight: 270,
    overflow: "hidden",
    paddingBottom: 58,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    position: "relative",
  },

  decorativeCircle: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 999,
    position: "absolute",
  },

  circleTop: {
    height: 180,
    right: -70,
    top: -80,
    width: 180,
  },

  circleBottom: {
    bottom: -100,
    height: 210,
    left: -90,
    width: 210,
  },

  brandIcon: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 999,
    height: 72,
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    width: 72,
    elevation: 4,
  },

  brand: {
    color: colors.white,
    fontFamily: typography.fontFamilyBold,
    fontSize: 27,
    lineHeight: 34,
    textAlign: "center",
  },

  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.86)",
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
    maxWidth: 260,
    textAlign: "center",
  },

  securityBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },

  securityBadgeText: {
    color: colors.white,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 11,
  },

  loginCard: {
    marginHorizontal: spacing.sm,
    marginTop: -5,
    shadowColor: "#101828",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    zIndex: 2,
    elevation: 7,
  },

  formHeader: {
    marginBottom: spacing.xl,
  },

  formTitle: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 21,
    lineHeight: 28,
  },

  formSubtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  form: {
    gap: spacing.lg,
  },

  errorBox: {
    backgroundColor: "rgba(180, 35, 24, 0.08)",
    borderColor: "rgba(180, 35, 24, 0.18)",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  errorText: {
    color: colors.danger,
    fontFamily: typography.fontFamilySemiBold,
    fontSize: 12,
    lineHeight: 18,
  },

  securityNote: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },

  securityNoteText: {
    color: colors.muted,
    flexShrink: 1,
    fontFamily: typography.fontFamily,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});