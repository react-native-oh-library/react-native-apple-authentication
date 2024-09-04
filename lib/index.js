/**
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import version from './version';
import { NativeModules, TurboModuleRegistry } from 'react-native';
import AppleAuthModule from './AppleAuthModule';
const { RNAppleAuthModule, RNAppleAuthModuleAndroid } = NativeModules;

const AppleAuthModuleHarmony = TurboModuleRegistry ?
  TurboModuleRegistry.get('ReactNativeAppleAuthentication') :
  NativeModules.RNAppleAuthModuleAndroid

export { default as AppleButton } from './AppleButton';

/**
 * iOS
 */
export const appleAuth = new AppleAuthModule(RNAppleAuthModule, version);
export default appleAuth;

/**
 * Android
 */
export const appleAuthAndroid = RNAppleAuthModuleAndroid ? {
  isSupported: RNAppleAuthModuleAndroid.isSupported,
  configure: RNAppleAuthModuleAndroid.configure,
  signIn: RNAppleAuthModuleAndroid.signIn,

  Error: {
    NOT_CONFIGURED: RNAppleAuthModuleAndroid.E_NOT_CONFIGURED_ERROR,
    SIGNIN_FAILED: RNAppleAuthModuleAndroid.E_SIGNIN_FAILED_ERROR,
    SIGNIN_CANCELLED: RNAppleAuthModuleAndroid.E_SIGNIN_CANCELLED_ERROR,
  },
  Scope: RNAppleAuthModuleAndroid.Scope,
  ResponseType: RNAppleAuthModuleAndroid.ResponseType,
} : {};

/**
 * HarmonyOS
 */
export const appleAuthHarmony = AppleAuthModuleHarmony ? {
  isSupported: AppleAuthModuleHarmony.isSupported,
  configure: AppleAuthModuleHarmony.configure,
  signIn: AppleAuthModuleHarmony.signIn,

  Error: {
    NOT_CONFIGURED: AppleAuthModuleHarmony.E_NOT_CONFIGURED_ERROR,
    SIGNIN_FAILED: AppleAuthModuleHarmony.E_SIGNIN_FAILED_ERROR,
    SIGNIN_CANCELLED: AppleAuthModuleHarmony.E_SIGNIN_CANCELLED_ERROR,
  },
  Scope: { ALL: 'ALL', CODE: 'CODE', ID_TOKEN: 'ID_TOKEN' },
  ResponseType: { ALL: 'ALL', EMAIL: 'EMAIL', NAME: 'NAME' }
} : {};