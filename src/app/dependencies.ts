import { httpClient } from "../core/http/httpClient";
import { secureTokenStorage } from "../core/storage/secureTokenStorage";
import { AuthApiRepository } from "../data/auth/AuthApiRepository";
import { JustificativaApiRepository } from "../data/justificativas/JustificativaApiRepository";
import { PontoApiRepository } from "../data/ponto/PontoApiRepository";
import { UsuarioApiRepository } from "../data/usuarios/UsuarioApiRepository";
import { createAuthUseCases } from "../domain/auth/useCases/authUseCases";
import { createJustificativaUseCases } from "../domain/justificativas/useCases/justificativaUseCases";
import { createPontoUseCases } from "../domain/ponto/useCases/pontoUseCases";
import { createUsuarioUseCases } from "../domain/usuarios/useCases/usuarioUseCases";

const authRepository = new AuthApiRepository(httpClient);
const pontoRepository = new PontoApiRepository(httpClient);
const justificativaRepository = new JustificativaApiRepository(httpClient);
const usuarioRepository = new UsuarioApiRepository(httpClient);

export const authUseCases = createAuthUseCases(authRepository, secureTokenStorage);
export const pontoUseCases = createPontoUseCases(pontoRepository);
export const justificativaUseCases = createJustificativaUseCases(justificativaRepository);
export const usuarioUseCases = createUsuarioUseCases(usuarioRepository);