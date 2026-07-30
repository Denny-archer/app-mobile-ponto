import { httpClient } from "../core/http/httpClient";
import { secureTokenStorage } from "../core/storage/secureTokenStorage";
import { AjusteApiRepository } from "../data/ajustes/AjusteApiRepository";
import { AuthApiRepository } from "../data/auth/AuthApiRepository";
import { DepartamentoApiRepository } from "../data/departamentos/DepartamentoApiRepository";
import { JustificativaApiRepository } from "../data/justificativas/JustificativaApiRepository";
import { PontoApiRepository } from "../data/ponto/PontoApiRepository";
import { UsuarioApiRepository } from "../data/usuarios/UsuarioApiRepository";
import { createAjusteUseCases } from "../domain/ajustes/useCases/ajusteUseCases";
import { createAuthUseCases } from "../domain/auth/useCases/authUseCases";
import { createDepartamentoUseCases } from "../domain/departamentos/useCases/departamentoUseCases";
import { createJustificativaUseCases } from "../domain/justificativas/useCases/justificativaUseCases";
import { createPontoUseCases } from "../domain/ponto/useCases/pontoUseCases";
import { createUsuarioUseCases } from "../domain/usuarios/useCases/usuarioUseCases";

const authRepository = new AuthApiRepository(httpClient);
const pontoRepository = new PontoApiRepository(httpClient);
const justificativaRepository = new JustificativaApiRepository(httpClient);
const usuarioRepository = new UsuarioApiRepository(httpClient);
const departamentoRepository = new DepartamentoApiRepository(httpClient);
const ajusteRepository = new AjusteApiRepository(httpClient);

export const authUseCases = createAuthUseCases(authRepository, secureTokenStorage);
export const pontoUseCases = createPontoUseCases(pontoRepository);
export const justificativaUseCases = createJustificativaUseCases(justificativaRepository);
export const usuarioUseCases = createUsuarioUseCases(usuarioRepository);
export const departamentoUseCases = createDepartamentoUseCases(departamentoRepository);
export const ajusteUseCases = createAjusteUseCases(ajusteRepository);