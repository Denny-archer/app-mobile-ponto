import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import { usuarioUseCases } from "../../app/dependencies";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import { useAuthStore } from "../auth/authStore";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { InfoCard } from "../components/InfoCard";
import { MobileHeader } from "../components/MobileHeader";
import { Screen } from "../components/Screen";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = NativeStackScreenProps<AppStackParamList, "AlterarSenha">;

const schema = z
  .object({
    novaSenha: z.string().min(6, "Informe uma senha com pelo menos 6 caracteres."),
    confirmarSenha: z.string().min(6, "Confirme a nova senha."),
  })
  .refine((values) => values.novaSenha === values.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

type FormValues = z.infer<typeof schema>;

export function AlterarSenhaScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      novaSenha: "",
      confirmarSenha: "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user?.id) {
      Alert.alert("Erro", "Usuário não encontrado na sessão atual.");
      return;
    }

    try {
      await usuarioUseCases.alterarSenha(user.id, values.novaSenha);
      Alert.alert("Senha alterada", "Sua senha foi atualizada com sucesso.", [
        { text: "OK", onPress: navigation.goBack },
      ]);
    } catch (error) {
      Alert.alert("Erro", error instanceof Error ? error.message : "Não foi possível alterar a senha.");
    }
  }

  return (
    <Screen scroll>
      <MobileHeader canGoBack onBack={navigation.goBack} title="Alterar senha" subtitle="Conta e segurança" />

      <View style={styles.stack}>
        <InfoCard title="Nova senha" subtitle="Use uma senha com pelo menos 6 caracteres.">
          <Controller
            control={control}
            name="novaSenha"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppTextInput
                error={errors.novaSenha?.message}
                label="Nova senha"
                onBlur={onBlur}
                onChangeText={onChange}
                secureTextEntry
                value={value}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmarSenha"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppTextInput
                error={errors.confirmarSenha?.message}
                label="Confirmar nova senha"
                onBlur={onBlur}
                onChangeText={onChange}
                secureTextEntry
                value={value}
              />
            )}
          />
        </InfoCard>

        <Text style={styles.notice}>Depois de alterar a senha, use a nova credencial no próximo login.</Text>

        <AppButton loading={isSubmitting} onPress={handleSubmit(onSubmit)} title="Salvar nova senha" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  notice: {
    color: colors.muted,
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
});