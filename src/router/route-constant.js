import LoginPage from '@views/auth/login-page.vue'
// import RegisterPage from '@layouts/auth/register-page.vue'
// import VerifyEmailPage from '@layouts/auth/email/verify-email-page.vue'
// import VerifyEmailSuccessPage from '@layouts/auth/email/email-verify-success.vue'
// import AuthLayout from '@layouts/auth/auth-template.vue'
import DefaultLayout from '@layouts/default-layout.vue'
// import ResetPasswordPage from '@layouts/auth/password/reset-password-page.vue'
// import SendResetPasswordPage from '@layouts/auth/password/send-forgot-password-page.vue'
// import ForgotPasswordPage from '@layouts/auth/password/forgot-password-page.vue'
import { Route } from './ARoute'
import homeRoute from './routes/home'

export const constantRoutes = [
  homeRoute,
  // Route.withPageLayout('').addChildren(
  //   Route.withPath('/redirect/:path*', 'redirect').withName('redirect'),
  //   Route.withPath('/403', '403').withName('error.403').withTitle('error.403'),
  //   Route.withPath('/404', '404').withName('error.404').withTitle('error.404')
  // ),
  Route.withPath('/', DefaultLayout).addChildren(
    Route.withPath('/sign-in', LoginPage).withName('login').withNoAuth(),
    // Route.withPath('/sign-up', RegisterPage).withName('register').withNoAuth(),
    // Route.withPath('/verify-email', VerifyEmailPage)
    //   .withName('verify-email-page')
    //   .withNoAuth()
    //   .withProps((route) => ({ email: route.query.email || '' })),
    // Route.withPath('', AuthLayout)
    //   .withNoAuth()
    //   .addChildren([
    //     Route.withPath('/reset-password', ResetPasswordPage).withName(
    //       'resetpassword'
    //     ),
    //     Route.withPath('/send-forgot-password', SendResetPasswordPage).withName(
    //       'sendresetpassword'
    //     ),
    //     Route.withPath('/forgot-password', ForgotPasswordPage).withName(
    //       'forgotpassword'
    //     ),
    //     Route.withPath(
    //       '/email-verify-success',
    //       VerifyEmailSuccessPage
    //     ).withName('emailsuccess'),
    //   ])
  ),
]

export const Wildcard404 = Route.withPath('*', '404').withTitle('error.404')
