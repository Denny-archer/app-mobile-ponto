# Sistema Ponto Mobile - AGENTS.md

## Regra principal para agentes

Expo mudou bastante nesta versao. Antes de escrever codigo novo, consulte a documentacao versionada exata do SDK usado neste projeto:

https://docs.expo.dev/versions/v57.0.0/

Este projeto e o app mobile separado do sistema web/API. Ele fica fora do repositorio principal do Docker para nao interferir no `docker compose up -d --build` do sistema atual.

## Stack atual

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript strict
- React Navigation native stack
- TanStack Query
- Axios
- Zustand
- React Hook Form + Zod
- Expo SecureStore
- Expo Camera
- Expo FileSystem legacy API
- Expo Sharing
- Expo Font + `@expo-google-fonts/inter`
- Lucide React Native

Scripts importantes:

```bash
npm run typecheck
npm run start:go
npm run android:go
npm run android:dev
npx expo start --go --android -c
```

## Configuracao de ambiente

O app usa variavel publica do Expo:

```env
EXPO_PUBLIC_API_BASE_URL=http://172.16.10.28:8005
```

Para Android emulator acessando API local do Windows/Docker, usar:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8005
```

Sempre reinicie o Metro com cache limpo depois de alterar `.env`:

```bash
npx expo start --go --android -c
```

## Arquitetura implementada

A estrutura segue camadas simples inspiradas em Clean Architecture:

```txt
src/
  app/                  boot da app, QueryClient, dependencias e online manager
  core/                 config, HTTP, storage seguro e download autenticado de PDF
  domain/               entidades, contratos de repositorio e casos de uso
  data/                 repositorios Axios que consomem a API FastAPI
  navigation/           stacks autenticado e nao autenticado
  presentation/         telas, componentes e tema visual
  shared/               utilitarios e tipos compartilhados
```

Regras:

- Tela nao deve montar URL de API diretamente, exceto quando for necessario passar path para utilitario de download autenticado.
- Regra de negocio de ponto, auditoria, permissoes e banco de horas continua no backend FastAPI.
- O mobile apenas calcula estados visuais locais, como proximo tipo de batida e resumo mensal exibido.
- Token JWT deve permanecer no SecureStore, nunca em AsyncStorage comum.

## Navegacao atual

O fluxo autenticado foi ajustado para seguir o design do Pencil, sem tab bar visivel:

```txt
Home
  -> RegistrarPonto
      -> PontoRegistrado
  -> PontosBatidos
      -> RelatorioMensal
  -> RelatorioMensal
```

Arquivos principais:

- `src/navigation/RootNavigator.tsx`: escolhe Auth ou App conforme sessao.
- `src/navigation/AuthNavigator.tsx`: login.
- `src/navigation/AppNavigator.tsx`: stack autenticado.
- `src/navigation/AppTabs.tsx`: mantido apenas como compatibilidade, apontando para AppNavigator.

## Design aplicado do Pencil

Fonte de referencia: `C:\Users\denilson.jose\Desktop\designs\app-ponto.pen`.

Tokens visuais aplicados:

- Background: `#F3F4F6`
- Card: `#FFFFFF`
- Texto principal: `#111827`
- Texto secundario: `#667085`
- Verde principal: `#188C57`
- Azul: `#1677F2`
- Borda: `#E5E7EB`
- Fonte: Inter

Componentes criados/ajustados:

- `Screen`
- `AppButton`
- `AppTextInput`
- `InfoCard`
- `MobileHeader`
- `StatusBadge`
- `UserSummaryCard`
- `BatidaRow`
- `JustificativaModal`

## Fluxos implementados

### Login

Mantido o contrato existente:

- `POST /token/`
- Formato: `application/x-www-form-urlencoded`
- Campos: `username`, `password`
- Depois do login: `GET /usuarios/me`

Arquivos:

- `src/data/auth/AuthApiRepository.ts`
- `src/domain/auth/useCases/authUseCases.ts`
- `src/presentation/auth/authStore.ts`
- `src/presentation/auth/LoginScreen.tsx`

### Home do ponto

Tela baseada no Pencil com:

- dados do colaborador;
- relogio atual;
- botao de registrar ponto;
- resumo de hoje;
- botao de comprovante;
- atalhos para pontos batidos e relatorio.

APIs usadas:

- `GET /batidas/?id_usuario=&data_inicio=&data_fim=`
- `GET /batidas/saldo_diario/{id_usuario}?data=YYYY-MM-DD`
- `GET /batidas/{id_batida}/comprovante`

Arquivo:

- `src/presentation/ponto/PontoHomeScreen.tsx`

### Registro de ponto com selfie

Tela com camera frontal e moldura visual, baseada no Pencil.

Regras atuais no mobile:

- Se nao ha batidas no dia, o proximo tipo e `E`.
- Se a ultima batida foi `E`, o proximo tipo e `S`.
- Se a ultima batida foi `S`, o proximo tipo e `E`.

API usada:

- `POST /batidas/?id_usuario={id}&tipo={E|S}`
- Body multipart com campo `imagem`.

Arquivos:

- `src/presentation/ponto/RegistrarPontoScreen.tsx`
- `src/data/ponto/PontoApiRepository.ts`
- `src/shared/utils/ponto.ts`

### Tela de sucesso

Depois do registro, navega para `PontoRegistrado` exibindo:

- icone de sucesso;
- preview da selfie capturada;
- usuario, email, hora, data e tipo;
- botao para baixar comprovante;
- botao para voltar ao inicio.

Arquivo:

- `src/presentation/ponto/PontoRegistradoScreen.tsx`

### Pontos batidos

Tela com:

- card do colaborador;
- ultima batida;
- lista de batidas do dia;
- botao de solicitar justificativa;
- botao de relatorio.

APIs usadas:

- `GET /batidas/?id_usuario=&data_inicio=&data_fim=`
- `POST /justificativas/`
- `POST /justificativas/remocao`

Arquivo:

- `src/presentation/historico/PontosBatidosScreen.tsx`

### Justificativas

Modal suporta dois modos:

- Inclusao: envia `data_requerida` no formato `YYYY-MM-DD HH:mm` e `texto`.
- Remocao: envia `id_batida` e `texto`.

Contratos:

- Inclusao: `POST /justificativas/?data_requerida=...&texto=...`
- Remocao: `POST /justificativas/remocao?id_batida=...&texto=...`

Arquivos:

- `src/presentation/components/JustificativaModal.tsx`
- `src/data/justificativas/JustificativaApiRepository.ts`
- `src/domain/justificativas/*`

### Relatorio mensal

Tela baseada no Pencil com:

- seletor de mes/ano;
- resumo mensal;
- total trabalhado calculado no mobile;
- saldo calculado no mobile;
- distribuicao semanal calculada no mobile;
- ultimo registro do periodo;
- download/compartilhamento do PDF.

APIs usadas:

- `GET /batidas/espelho/{id_usuario}?data_inicio=&data_fim=`
- `GET /batidas/relatorio-mensal/{id_usuario}?data=YYYY-MM-01`
- `GET /batidas/?id_usuario=&data_inicio=&data_fim=` para ultimo registro.

Observacao: a rota de espelho retorna `datas`, nao retorna o total pronto. Por isso a tela soma os campos `tempo_trabalhado` e `saldo` localmente para exibicao.

Arquivo:

- `src/presentation/relatorio/RelatorioMensalScreen.tsx`

## Download e compartilhamento de PDFs

Foi criado o utilitario:

- `src/core/files/downloadAuthenticatedPdf.ts`

Ele:

- monta URL usando `EXPO_PUBLIC_API_BASE_URL`;
- le o token do SecureStore;
- baixa PDF com header `Authorization: Bearer ...`;
- salva em cache temporario;
- abre `expo-sharing` para visualizar/compartilhar.

A implementacao usa `expo-file-system/legacy`, porque no SDK 57 a API antiga de `downloadAsync` esta no namespace legacy.

## Cuidados importantes

- Nao usar `localhost` dentro do Android emulator para chamar a API do PC. Usar `10.0.2.2` para API local ou IP real do servidor.
- Sempre rodar `npm run typecheck` depois de mexer em telas, navegacao ou contratos.
- Nao rodar `npm audit fix --force` sem avaliar, pois pode quebrar compatibilidade do Expo SDK.
- A camera no Expo Go pode ter diferencas de permissao conforme ambiente. Para testes mais proximos de producao, usar development build.
- O `app.json` ja possui `android.package` e `ios.bundleIdentifier`: `br.gov.coffito.pontomobile`.
- O app pede camera e localizacao, mas o fluxo atual ainda nao envia localizacao para a API.

## Validacoes ja executadas

As seguintes validacoes passaram apos a implementacao:

```bash
npm run typecheck
npx expo config --type public
```

## Pendencias conhecidas / proximos passos

- Testar manualmente no Android emulator todos os fluxos com usuario real.
- Validar registro de selfie contra o backend de desenvolvimento.
- Validar abertura de comprovante e relatorio em PDF no emulador e em aparelho fisico.
- Avaliar se o backend deve receber localizacao no registro de ponto em etapa futura.
- Revisar UX de justificativa para datas/horarios com mascara ou seletor nativo.
- Avaliar build iOS via EAS quando houver conta Apple Developer disponivel.
## Fluxo de Gestão Mobile

A v1 do fluxo de gestão foi adicionada para perfis de gestão, mantendo o padrão de Clean Architecture já usado no app.

Perfis com entrada visível na Home:

- Administrador
- Gestor RH
- Chefe de Setor

Perfis sem entrada visível nesta etapa:

- Colaborador
- Visualizador

Telas adicionadas:

- `GestaoHome`: hub com atalhos de gestão.
- `GestaoColaboradores`: busca por nome, e-mail ou matrícula, filtro por status e departamento.
- `GestaoColaboradorDetalhe`: consulta colaborador, batidas do dia, saldo diário, espelho mensal, justificativas recentes, ajustes e download de relatório mensal.
- `GestaoJustificativas`: lista justificativas por status e permite aprovar/reprovar solicitações.

APIs usadas:

- `GET /usuarios/`
- `GET /departamentos/`
- `GET /batidas/`
- `GET /batidas/saldo_diario/{id_usuario}`
- `GET /batidas/espelho/{id_usuario}`
- `GET /batidas/relatorio-mensal/{id_usuario}`
- `GET /justificativas/`
- `PATCH /justificativas/{id_justificativa}`
- `GET /ajustes/{id_usuario}`

Regras importantes:

- A tela só esconde recursos visualmente; a permissão real continua no backend.
- Após aprovar/reprovar justificativa, invalidar queries de justificativas, batidas, saldo diário e espelho para evitar dados desatualizados.
- Não calcular saldo oficial no mobile quando o backend já retorna `tempo_trabalhado`, `saldo_dia` ou espelho.
- O `tipo_usuario` pode vir como número ou texto; use `normalizeUserRole`/`canAccessGestao` em vez de comparar direto.