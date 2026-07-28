import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
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
  login: z.string().min(1, "Informe matrícula, e-mail ou CPF."),
  password: z.string().min(1, "Informe sua senha."),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const signIn = useAuthStore((state) => state.signIn);
  const authError = useAuthStore((state) => state.error);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginForm) {
    try {
      setIsSubmitting(true);
      await signIn(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <ShieldCheck color={colors.primary} size={32} />
          </View>
          <Text style={styles.brand}>Ponto Eletrônico</Text>
          <Text style={styles.subtitle}>Acesse para registrar e acompanhar sua jornada.</Text>
        </View>

        <InfoCard>
          <View style={styles.form}>
            <Controller
              control={control}
              name="login"
              render={({ field: { onBlur, onChange, value } }) => (
                <AppTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.login?.message}
                  keyboardType="email-address"
                  label="Matrícula, e-mail ou CPF"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onBlur, onChange, value } }) => (
                <AppTextInput
                  error={errors.password?.message}
                  label="Senha"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry
                  value={value}
                />
              )}
            />

            {authError ? <Text style={styles.error}>{authError}</Text> : null}

            <AppButton
              loading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              title="Entrar"
            />
          </View>
        </InfoCard>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logoCircle: {
    alignItems: "center",
    backgroundColor: colors.softGreen,
    borderRadius: 999,
    height: 76,
    justifyContent: "center",
    marginBottom: spacing.md,
    width: 76,
  },
  brand: {
    color: colors.text,
    fontFamily: typography.fontFamilyBold,
    fontSize: 24,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  form: {
    gap: spacing.lg,
  },
  error: {
    color: colors.danger,
    fontFamily: typography.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
});