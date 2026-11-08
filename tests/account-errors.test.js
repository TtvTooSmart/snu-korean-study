import test from 'node:test';
import assert from 'node:assert/strict';
import {accountError} from '../js/account-errors.js';
test('OTP rejection guides new users to sign up without claiming an account exists',()=>{
 assert.match(accountError({code:'otp_disabled'}),/choose Sign up first/);
 assert.match(accountError({message:'Signups not allowed for otp'}),/choose Sign up first/);
 assert.match(accountError({code:'otp_disabled'},true),/Sign-up is unavailable/);
});
test('mail delivery failures do not claim success or reveal SMTP details',()=>{
 assert.match(accountError({code:'unexpected_failure',message:'Error sending confirmation email'}),/administrator needs to check email delivery/);
 assert.match(accountError({message:'Error sending magic link email'}),/could not send/);
 assert.equal(accountError({code:'unexpected_failure',message:'Another failure'}),'Another failure');
});
test('rate limits and absent errors have useful next steps',()=>{
 assert.match(accountError({code:'over_email_send_rate_limit'}),/wait a few minutes/);
 assert.match(accountError(null),/Please try again/);
});
