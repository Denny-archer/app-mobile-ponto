# Sistema Ponto Mobile

Aplicativo mobile do sistema de ponto eletrônico, criado em Expo + TypeScript para Android e iOS.

## Stack inicial

- Expo + React Native + TypeScript
- React Navigation
- TanStack Query
- Axios
- Zustand
- React Hook Form + Zod
- Expo SecureStore
- Expo Camera e Expo Location preparados para o fluxo de batida

## Arquitetura

```txt
src/
  app/                  composição da aplicação, dependências e QueryClient
  core/                 infraestrutura transversal: HTTP, env, storage seguro
  domain/               entidades, contratos e casos de uso
  data/                 implementação dos repositórios consumindo a API FastAPI
  navigation/           rotas autenticadas e não autenticadas
  presentation/         telas, componentes e tema visual
  shared/               tipos utilitários compartilhados
```

Regra principal: o mobile consome a API existente. Ele não deve duplicar regras de banco de horas, permissões, auditoria ou fechamento de ponto.

## Configuração

Crie um `.env` baseado no `.env.example`:

```env
EXPO_PUBLIC_API_BASE_URL=http://SEU_IP_LOCAL:8000
```

Observações:

- Em dispositivo físico, use o IP da máquina/servidor na rede.
- Em emulador Android local, normalmente use `http://10.0.2.2:8000`.
- Em produção, use HTTPS obrigatório.

## Comandos

```bash
npm install
npm start
npm run android
npm run ios
```

## Endpoints já mapeados

- `POST /token/`: login com `username` e `password` em `application/x-www-form-urlencoded`.
- `GET /usuarios/me`: restaura sessão do usuário autenticado.
- `GET /batidas/`: lista batidas.
- `POST /batidas/`: registra batida com multipart `imagem` e query params `id_usuario`, `tipo`, `descricao`.

## Próximas etapas recomendadas

1. Ligar os botões Entrada/Saída ao fluxo real de câmera/selfie.
2. Adicionar checagem de localização quando a regra de negócio exigir.
3. Criar módulo de justificativas com endpoints reais do backend.
4. Definir estratégia de build com EAS para Android e iOS.
5. Criar pipeline separado do Docker Compose do sistema web/API.