import test from 'node:test';
import assert from 'node:assert/strict';
import {studyRoute} from '../js/study-access.js';
import {accountError} from '../js/account-errors.js';

test('signed-out deep links and saved quiz routes require sign-in',()=>{
 for(const route of ['', 'home','quiz','settings','import','students','account','signin','unknown']){
  assert.equal(studyRoute(route,false),'signin');
 }
 assert.equal(studyRoute('signup',false),'signup');
});
test('signed-in learners retain access to their requested study route',()=>{
 for(const route of ['home','quiz','settings','import','students','account'])assert.equal(studyRoute(route,true),route);
 assert.equal(studyRoute('',true),'home');
});
test('authentication failures never offer a guest bypass',()=>{
 for(const error of [{code:'otp_disabled'},{message:'Error sending confirmation email'},{code:'email_address_not_authorized'}]){
  assert.doesNotMatch(accountError(error,true),/guest/i);
 }
});
