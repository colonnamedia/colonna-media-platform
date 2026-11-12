// Keep the admin session through reloads in this tab, without storing CRM data
// or creating a long-lived remember-me login in localStorage.
export function adminAuthOptions(
  storageAccessor = () => window.sessionStorage,
) {
  const memory = new Map();
  const storage = {
    getItem(key) {
      try {
        return storageAccessor().getItem(key) ?? memory.get(key) ?? null;
      } catch {
        return memory.get(key) ?? null;
      }
    },
    setItem(key, value) {
      memory.set(key, value);
      try {
        storageAccessor().setItem(key, value);
      } catch {
        /* In-memory fallback when browser storage is unavailable. */
      }
    },
    removeItem(key) {
      memory.delete(key);
      try {
        storageAccessor().removeItem(key);
      } catch {
        /* Never keep an in-memory signed-out session. */
      }
    },
  };
  return {
    persistSession: true,
    storage,
    storageKey: "colonna-media-admin-session-v1",
    autoRefreshToken: true,
    detectSessionInUrl: true,
  };
}
