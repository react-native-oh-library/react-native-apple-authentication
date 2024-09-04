import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export declare enum HarmonyResponseType {
    ALL = "ALL",
    CODE = "CODE",
    ID_TOKEN = "ID_TOKEN",
}

export declare enum HarmonyScope {
    ALL = "ALL",
    EMAIL = "EMAIL",
    NAME = "NAME",
}

export interface HarmonyConfig {
    clientId: string;
    redirectUri: string;
    responseType?: HarmonyResponseType;
    scope?: HarmonyScope;
    state?: string;
    nonce?: string;
    nonceEnabled?: boolean;
}

export interface AndroidSigninResponse {
    nonce?: string;
    user?: {
        name?: { firstName?: string; lastName?: string; };
        email?: string;
    };
    state: string;
    id_token?: string;
    code: string;
}

export interface Spec extends TurboModule {
    configure: (configObject: HarmonyConfig) => void
    signIn: () => Promise<AndroidSigninResponse>
}

export default TurboModuleRegistry.get<Spec>('ReactNativeAppleAuthentication') as Spec | null;