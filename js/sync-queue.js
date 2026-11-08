// Serialize cloud saves. Requests during a save trigger another pass with the
// latest local snapshot, so quick answers never race or disappear.
export function createSyncQueue(run) {
  let running=null, pending=false;
  return function request() {
    pending=true;
    if(!running) running=Promise.resolve().then(async()=>{
      try {
        while(pending) {pending=false;await run();}
      } finally {running=null;}
    });
    return running;
  };
}
