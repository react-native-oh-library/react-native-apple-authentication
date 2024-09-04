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

import {
  SignInWithAppleCancel,
  SignInWithAppleFailure,
  SignInWithAppleResult,
  SignInWithAppleResultType,
  SignInWithAppleSuccess
} from './SignInWithAppleResult';

export class FormInterceptorInterface {
  private static readonly STATE = 'state';
  private static readonly CODE = 'code';
  private static readonly TOKEN = 'id_token';
  private static readonly USER = 'user';
  private static readonly FORM_DATA_SEPARATOR = '|';
  private static readonly KEY_VALUE_SEPARATOR = '=';

  private expectedState: string;
  private callback: (result: SignInWithAppleResult) => void;

  constructor(expectedState: string, callback: (result: SignInWithAppleResult) => void) {
    this.expectedState = expectedState;
    this.callback = callback;
  }

  public processFormData(formData: string): void {
    const values = formData.split(FormInterceptorInterface.FORM_DATA_SEPARATOR);
    const tokenEncoded = values.find(v => v.startsWith(FormInterceptorInterface.TOKEN));
    const codeEncoded = values.find(v => v.startsWith(FormInterceptorInterface.CODE));
    const stateEncoded = values.find(v => v.startsWith(FormInterceptorInterface.STATE));
    const userEncoded = values.find(v => v.startsWith(FormInterceptorInterface.USER));

    if (stateEncoded && (codeEncoded || tokenEncoded || userEncoded)) {
      const stateValue = stateEncoded.substring(stateEncoded.indexOf(FormInterceptorInterface.KEY_VALUE_SEPARATOR) + 1);
      const codeValue = codeEncoded?.substring(codeEncoded.indexOf(FormInterceptorInterface.KEY_VALUE_SEPARATOR) + 1);
      const tokenValue =
        tokenEncoded?.substring(tokenEncoded.indexOf(FormInterceptorInterface.KEY_VALUE_SEPARATOR) + 1);
      const userValue = userEncoded?.substring(userEncoded.indexOf(FormInterceptorInterface.KEY_VALUE_SEPARATOR) + 1);

      if (stateValue === this.expectedState) {
        this.callback({
          type: 'Success',
          code: codeValue || '',
          id_token: tokenValue || '',
          state: stateValue,
          user: userValue || ''
        } as SignInWithAppleSuccess);
      } else {
        this.callback({
          type: 'Failure',
          error: new Error('state does not match')
        } as SignInWithAppleFailure);
      }
    } else {
      this.callback({ type: 'Cancel' } as SignInWithAppleCancel);
    }
  }

  // public static get JS_TO_INJECT() {
  //     function parseForm(form) {
  //       var values = '';
  //       for (var i = 0; i < form.elements.length; i++) {
  //         values +=
  //           form.elements[i].name +
  //           '${FormInterceptorInterface.KEY_VALUE_SEPARATOR}' +
  //           form.elements[i].value +
  //           '${FormInterceptorInterface.FORM_DATA_SEPARATOR}';
  //       }
  //       window.FormInterceptorInterface.processFormData(values);
  //     }
  //
  //     for (var i = 0; i < document.forms.length; i++) {
  //       parseForm(document.forms[i]);
  //     }
  //
  // }
}

// Example usage:
// window.FormInterceptor = new FormInterceptor('expected_state', (result) => {
//   if (result.type === SignInWithAppleResultType.Success) {
//     console.log('Success:', result);
//   } else if (result.type === SignInWithAppleResultType.Failure) {
//     console.error('Failure:', result.error);
//   } else if (result.type === SignInWithAppleResultType.Cancel) {
//     console.log('Cancelled');
//   }
// });