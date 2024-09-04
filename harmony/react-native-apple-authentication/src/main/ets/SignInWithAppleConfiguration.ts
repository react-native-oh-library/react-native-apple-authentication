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

export interface SignInWithAppleConfigurationOptions {
  clientId: string;
  redirectUri: string;
  scope: SignInWithAppleConfiguration_Scope;
  responseType: SignInWithAppleConfiguration_ResponseType;
  state: string;
  rawNonce: string;
  nonce: string;
}

export enum SignInWithAppleConfiguration_ResponseType {
  CODE = "code",
  ID_TOKEN = "id_token",
  ALL = "code id_token"
}

export enum SignInWithAppleConfiguration_Scope {
  NAME = "name",
  EMAIL = "email",
  ALL = "name email"
}

export class SignInWithAppleConfiguration {
  private constructor(
    public clientId: string,
    public redirectUri: string,
    public scope: SignInWithAppleConfiguration_Scope,
    public responseType: SignInWithAppleConfiguration_ResponseType,
    public state: string,
    public rawNonce: string,
    public nonce: string
  ) {
  }

  static Builder = class {
    _clientId!: string;
    _redirectUri!: string;
    _scope!: SignInWithAppleConfiguration_Scope;
    _responseType!: SignInWithAppleConfiguration_ResponseType;
    _state!: string;
    _rawNonce!: string;
    _nonce!: string;

    clientId(clientId: string) {
      this._clientId = clientId;
      return this;
    }

    redirectUri(redirectUri: string) {
      this._redirectUri = redirectUri;
      return this;
    }

    scope(scope: SignInWithAppleConfiguration_Scope) {
      this._scope = scope;
      return this;
    }

    responseType(responseType: SignInWithAppleConfiguration_ResponseType) {
      this._responseType = responseType;
      return this;
    }

    state(state: string) {
      this._state = state;
      return this;
    }

    rawNonce(rawNonce: string) {
      this._rawNonce = rawNonce;
      return this;
    }

    nonce(nonce: string) {
      this._nonce = nonce;
      return this;
    }

    build() {
      return new SignInWithAppleConfiguration(
        this._clientId,
        this._redirectUri,
        this._scope,
        this._responseType,
        this._state,
        this._rawNonce,
        this._nonce
      );
    }
  }
}

// Usage example:
// const config = new SignInWithAppleConfiguration.Builder()
//   .clientId('your-client-id')
//   .redirectUri('your-redirect-uri')
//   .scope(Scope.ALL)
//   .responseType(ResponseType.ALL)
//   .state('your-state')
//   .rawNonce('your-raw-nonce')
//   .nonce('your-nonce')
//   .build();
