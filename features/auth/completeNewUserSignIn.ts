import { markMpinUnlocked } from "./mpinStorage";
import { saveAuthSession } from "./session";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Completes the fresh-user MPIN handoff as one transition.
 *
 * Creating the MPIN already proves the user knows it, so the new session must
 * start unlocked. Marking that before publishing the auth session prevents
 * HomeEntry from briefly routing the user to the Enter MPIN screen.
 */
export function completeNewUserSignIn(
  mobile: string,
  local: StorageLike = window.localStorage,
  session: StorageLike = window.sessionStorage,
  now = Date.now(),
): void {
  markMpinUnlocked(session);
  saveAuthSession(mobile, local, now);
}
