/** Opens once startup routing (the splash route's replace to /home or /welcome) has
 *  finished. A notification tap that launched the app waits on it before navigating, so the
 *  splash's replace cannot overwrite the alert screen. */
export function createStartupGate() {
  let resolve = () => {};
  const wait = new Promise<void>((r) => {
    resolve = r;
  });
  const gate = {
    done: false,
    wait,
    open() {
      gate.done = true;
      resolve();
    },
  };
  return gate;
}
