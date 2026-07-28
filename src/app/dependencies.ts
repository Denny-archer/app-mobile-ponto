import { httpClient } from "../core/http/httpClient";
import { secureTokenStorage } from "../core/storage/secureTokenStorage";
import { AuthApiRepository } from "../data/auth/AuthApiRepository";
import { JustificativaApiRepository } from "../data/justificativas/JustificativaApiRepository";
import { PontoApiRepository } from "../data/ponto/PontoApiRepository";
import { createAuthUseCases } from "../domain/auth/useCases/authUseCases";
import { createJustificativaUseCases } from "../domain/justificativas/useCases/justificativaUseCases";
import { createPontoUseCases } from "../domain/ponto/useCases/pontoUseCases";

const authRepository = new AuthApiRepository(httpClient);
const pontoRepository = new PontoApiRepository(httpClient);
const justificativaRepository = new JustificativaApiRepository(httpClient);

export const authUseCases = createAuthUseCases(authRepository, secureTokenStorage);
export const pontoUseCases = createPontoUseCases(pontoRepository);
export const justificativaUseCases = createJustificativaUseCases(justificativaRepository);