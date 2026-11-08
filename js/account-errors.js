// Turn authentication errors into next steps without changing account permissions.
export function accountError(error, signingUp=false) {
  const code=error?.code, message=error?.message||'';
  if(code==='otp_disabled' || /signups not allowed for otp/i.test(message))
    return signingUp ? 'Sign-up is unavailable. Please contact the administrator.' : 'Could not sign in with this email. If you are new, choose Sign up first.';
  if(/error sending (confirmation|magic link|otp) email/i.test(message))
    return 'We could not send your email link. The administrator needs to check email delivery.';
  if(code==='over_email_send_rate_limit'||code==='over_request_rate_limit')
    return 'Too many email requests. Please wait a few minutes before trying again.';
  if(code==='email_address_not_authorized')
    return 'Email sign-in is not available for this address yet. Please contact the administrator.';
  return message||'Could not send the sign-in link. Please try again.';
}
