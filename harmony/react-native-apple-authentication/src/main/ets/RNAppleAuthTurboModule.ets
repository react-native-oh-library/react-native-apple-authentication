/**
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { UITurboModule, UITurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { TM } from "@rnoh/react-native-openharmony/generated/ts"
import { BusinessError } from '@kit.BasicServicesKit';
import { ComponentContent, PromptAction, window } from '@kit.ArkUI';
import { webview } from '@kit.ArkWeb';
import {
  SignInWithAppleConfiguration,
  SignInWithAppleConfiguration_ResponseType,
  SignInWithAppleConfiguration_Scope
} from './SignInWithAppleConfiguration';
import { util } from '@kit.ArkTS';
import { CryptoJS } from '@ohos/crypto-js'
import Logger from './Logger'
import {
  SignInWithAppleCancel,
  SignInWithAppleFailure,
  SignInWithAppleResult,
  SignInWithAppleSuccess
} from './SignInWithAppleResult';
import { uri } from '@kit.ArkTS';

interface BuildWebviewParams {
  controller: WebviewController
  interceptLogic: (event: OnInterceptRequestEvent) => null
  uri: string
}

@Builder
function buildWebview(params: BuildWebviewParams) {
  Column() {
    Web({ src: 'www.apple.com.cn', controller: params.controller })
      .onInterceptRequest(params.interceptLogic)
  }
  .width('100%')
  .height('100%')
  .margin({ top: 38 })
  .padding({ bottom: 38 })
}

interface GeneratedTypeLiteralInterface_2 {
  firstName?: string;
  lastName?: string;
}

interface GeneratedTypeLiteralInterface_1 {
  name?: GeneratedTypeLiteralInterface_2;
  email?: string;
}

interface AndroidSigninResponse {
  nonce?: string;
  user?: GeneratedTypeLiteralInterface_1;
  state: string;
  id_token?: string;
  code: string;
}

interface ResponseType {
  All: 'code id_token';
  CODE: 'code';
  ID_TOKEN: 'id_token';
}

interface Scope {
  NAME: "name";
  EMAIL: "email";
  ALL: "name email";
}

interface Constants {
  E_NOT_CONFIGURED_ERROR: string;
  E_SIGNIN_FAILED_ERROR: string;
  E_SIGNIN_CANCELLED_ERROR: string;
  ResponseType: ResponseType;
  Scope: Scope;
  isSupported: boolean;
}

export class RNAppleAuthTurboModule extends UITurboModule implements TM.ReactNativeAppleAuthentication.Spec {
  static readonly E_NOT_CONFIGURED_ERROR: string = "E_NOT_CONFIGURED_ERROR";
  static readonly E_SIGNIN_FAILED_ERROR: string = "E_SIGNIN_FAILED_ERROR";
  static readonly E_SIGNIN_CANCELLED_ERROR: string = "E_SIGNIN_CANCELLED_ERROR";
  private static readonly VERSION: boolean = true;
  private configuration: SignInWithAppleConfiguration | undefined = undefined;
  private controller: WebviewController | null = null

  constructor(ctx: UITurboModuleContext) {
    super(ctx);
  }

  public configure(configObject: TM.ReactNativeAppleAuthentication.HarmonyConfig): void {
    const clientId = configObject.clientId || '';
    const redirectUri = configObject.redirectUri || '';
    const scope = SignInWithAppleConfiguration_Scope[configObject.scope!] || SignInWithAppleConfiguration_Scope.ALL;
    const responseType = SignInWithAppleConfiguration_ResponseType[configObject.responseType!] ||
    SignInWithAppleConfiguration_ResponseType.ALL;
    const state = configObject.state || util.generateRandomUUID();
    const nonceEnabled = configObject.nonceEnabled !== undefined ? configObject.nonceEnabled : true;
    let rawNonce = "";
    let nonce = "";

    if (nonceEnabled) {
      if (configObject.nonce) {
        nonce = rawNonce = configObject.nonce;
        console.log('自定义nonce设置成功啦:' + nonce)
      } else {
        nonce = util.generateRandomUUID();
        console.log('随机nonce设置成功啦:' + nonce)
      }

      try {
        nonce = CryptoJS.SHA256(nonce).toString(CryptoJS.enc.Hex);
        console.log('SHA256化nonce成功啦:' + nonce)
      } catch (e) {
        Logger.warn(JSON.stringify(e))
      }
    }

    this.configuration = new SignInWithAppleConfiguration.Builder()
      .clientId(clientId)
      .redirectUri(redirectUri)
      .scope(scope)
      .responseType(responseType)
      .state(state)
      .rawNonce(rawNonce)
      .nonce(nonce)
      .build()
  }


  signIn(): Promise<TM.ReactNativeAppleAuthentication.AndroidSigninResponse> {

    return new Promise((resolve, reject) => {
      if (!this.configuration) {
        reject(RNAppleAuthTurboModule.E_NOT_CONFIGURED_ERROR);
        return
      }

      let uriInstance = new uri.URI('https://appleid.apple.com/auth/authorize')
        .addQueryValue('client_id', this.configuration.clientId)
        .addQueryValue('redirectUri', this.configuration.redirectUri)
        .addQueryValue('responseType', this.configuration.responseType)
        .addQueryValue('scope', this.configuration.scope)
        .addQueryValue("response_mode", "form_post")
        .addQueryValue('state', this.configuration.state)
      if (this.configuration.nonce !== null && this.configuration.nonce.trim().length !== 0) {
        uriInstance = uriInstance.addQueryValue("nonce", this.configuration.nonce)
      }
      const finallyUri = uriInstance.toString() //webview最终进入的uri


      /**
       * 请求监听器callback
       * @param event
       * @returns
       */
      const interceptLogic: (event: OnInterceptRequestEvent) => null = (event) => {
        const responseWeb: WebResourceResponse = new WebResourceResponse();
        if (event) {
          if (event.request.getRequestMethod().trim() === 'POST' &&
          event.request.getRequestUrl().trim().includes(this.configuration?.redirectUri!)// 如果是POST并且重合redirectUri
          ) {
            const res: TM.ReactNativeAppleAuthentication.AndroidSigninResponse = {
              state: 'promise success',
              code: '111'
            }

            resolve(res)
            return null
          }
        }
        return null
      }
      this.controller = new webview.WebviewController();
      const webviewParams: BuildWebviewParams = {
        controller: this.controller,
        interceptLogic,
        uri: finallyUri
      }

      window.getLastWindow(this.ctx.uiAbilityContext)
        .then((value) => {
          const uiContext = value.getUIContext()
          const promptAction = uiContext?.getPromptAction();
          const contentNode = new ComponentContent(uiContext!, wrapBuilder(buildWebview), webviewParams!);
          try {
            promptAction?.openCustomDialog(contentNode);
          } catch (error) {
            let message = (error as BusinessError).message;
            let code = (error as BusinessError).code;
            console.error(`OpenCustomDialog args error code is ${code}, message is ${message}`);
          }
        })


      const onSignInWithAppleSuccess =
        (code: string, id_token: string, state: string, user: string): void => {
          const rawNonce = this.configuration?.rawNonce
          const response: AndroidSigninResponse = { code, id_token, state, }
          if (rawNonce) {
            response.nonce = rawNonce
          }
          const userJson: GeneratedTypeLiteralInterface_1 = JSON.parse(user)
          response.user = userJson
          resolve(response)
        }

      const onSignInWithAppleFailure = (error: Error): void => {
        reject(RNAppleAuthTurboModule.E_SIGNIN_FAILED_ERROR + ':' + error)
      }

      const onSignInWithAppleCancel = (): void => {
        reject(RNAppleAuthTurboModule.E_SIGNIN_CANCELLED_ERROR)
      }

      const toFunction = () => {
        return (result: SignInWithAppleSuccess | SignInWithAppleFailure | SignInWithAppleCancel) => {
          switch (result.type) {
            case 'Success':
              onSignInWithAppleSuccess(result.code, result.id_token, result.state, result.user);
              break;
            case 'Failure':
              onSignInWithAppleFailure(result.error);
              break;
            case 'Cancel':
              onSignInWithAppleCancel();
              break;
            default:
              console.error('Unknown result type:', JSON.stringify(result));
          }
        };
      }


    })

    // 以下为新版写法,490暂未支持
    // const uiContext = this.ctx.getUIContext();
    // const promptAction = uiContext?.getPromptAction();
    // const contentNode = new ComponentContent(uiContext!, wrapBuilder(buildText), controller);
  }
}

class Callback {
  configuration: SignInWithAppleConfiguration | undefined = undefined;

  constructor(configuration: SignInWithAppleConfiguration) {
    this.configuration = configuration
  }

  onSignInWithAppleSuccess(code: string, id_token: string, state: string, user: string): AndroidSigninResponse {
    const rawNonce = this.configuration?.rawNonce
    const response: AndroidSigninResponse = { code, id_token, state, }
    if (rawNonce) {
      response.nonce = rawNonce
    }
    const userJson: GeneratedTypeLiteralInterface_1 = JSON.parse(user)
    response.user = userJson
    return response
  }

  onSignInWithAppleFailure(error: Error): string {
    return RNAppleAuthTurboModule.E_SIGNIN_FAILED_ERROR + ':' + error
  }

  onSignInWithAppleCancel(): string {
    return RNAppleAuthTurboModule.E_SIGNIN_CANCELLED_ERROR
  }

  toFunction() {
    return (result: SignInWithAppleSuccess | SignInWithAppleFailure | SignInWithAppleCancel) => {
      switch (result.type) {
        case 'Success':
          this.onSignInWithAppleSuccess(result.code, result.id_token, result.state, result.user);
          break;
        case 'Failure':
          this.onSignInWithAppleFailure(result.error);
          break;
        case 'Cancel':
          this.onSignInWithAppleCancel();
          break;
        default:
          console.error('Unknown result type:', JSON.stringify(result));
      }
    };
  }
}