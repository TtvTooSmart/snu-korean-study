// Pure validation and an optimistic-concurrency sync operation.
export function validStats(stats) {
  if (!stats || typeof stats !== 'object' || Array.isArray(stats)) throw Error('Invalid saved progress.');
  for (const [id,s] of Object.entries(stats)) {
    if (['__proto__','constructor','prototype'].includes(id) || !s ||
      ![s.seen,s.missed,s.streak].every(n=>Number.isInteger(n)&&n>=0) || s.missed>s.seen ||
      (s.flagged!==undefined && typeof s.flagged!=='boolean') ||
      (s.lastResult!==undefined && typeof s.lastResult!=='boolean')) throw Error('Invalid saved card progress.');
  }
  return stats;
}
// JSON object order is not data: PostgreSQL jsonb can reorder both card IDs and
// each card's fields. Compare values so a verified upload does not look conflicted.
export function sameProgress(a,b) {
  if(a===b)return true;
  if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;
  const keys=Object.keys(a);
  return keys.length===Object.keys(b).length && keys.every(key=>
    Object.prototype.hasOwnProperty.call(b,key)&&sameProgress(a[key],b[key]));
}
export async function syncSnapshot(client, userId, stats, base, revision) {
  validStats(stats);
  const {data:row,error} = await client.from('study_progress').select('stats, revision').eq('user_id',userId).maybeSingle();
  if (error) throw error;
  const remote = row || {stats:{},revision:0};
  validStats(remote.stats);
  // Clean local state can safely adopt another device's progress.
  if (sameProgress(stats,base) || sameProgress(stats,remote.stats)) return {kind:'saved',...remote};
  if (remote.revision!==revision) return {kind:'conflict',...remote};
  const {data:result,error:writeError} = await client.rpc('save_study_progress',{expected_revision:revision,new_stats:stats});
  if(writeError)throw writeError;
  if(!result.saved)return {kind:'conflict',stats:result.stats,revision:result.revision};
  // Read back the committed batch before marking the local cache as synced.
  // Failed verification leaves the old base/revision intact for a safe retry.
  const {data:verified,error:verifyError}=await client.from('study_progress').select('stats, revision').eq('user_id',userId).maybeSingle();
  if(verifyError)throw verifyError;
  if(!verified||verified.revision<result.revision)throw Error('Could not verify saved progress.');
  validStats(verified.stats);
  if(!sameProgress(verified.stats,stats))return {kind:'conflict',...verified};
  return {kind:'saved',...verified};
}

// An answer made while downloading a changed cloud snapshot must also trigger
// conflict resolution, rather than silently replacing either device's work.
export function reconcileInFlight(current, snapshot, result) {
  if(result.kind==='saved' && !sameProgress(current,snapshot) && !sameProgress(result.stats,snapshot))
    return {...result,kind:'conflict'};
  return result;
}
