import { GOOGLE_PROVIDER_NAME } from "./providers/google.js";
import { LOCAL_PROVIDER_NAME } from "./providers/local.js";

export const BUILTIN_PROVIDERS = [GOOGLE_PROVIDER_NAME, LOCAL_PROVIDER_NAME] as const;
