'use client';
import SuperTokens from 'supertokens-web-js';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword';
import EmailVerification from 'supertokens-web-js/recipe/emailverification';
import Session from 'supertokens-web-js/recipe/session';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:58000';
let initialized = false;
export function initAuth() {
  if (typeof window === 'undefined' || initialized) return;
  SuperTokens.init({
    appInfo: { appName: 'Civis', apiDomain: API, apiBasePath: '/auth' },
    recipeList: [Session.init(), EmailPassword.init(), EmailVerification.init()],
  });
  initialized = true;
}
export { EmailPassword, EmailVerification, Session };
