/**
 * Ungated local operator.
 * Replaces Firebase Google sign-in + daily-3 quota.
 * The UI still asks /api/quota; the server always answers unlimited.
 */

export const GATES_OPEN = true;

export const LOCAL_OPERATOR = {
  uid: "local-operator",
  displayName: "Local operator",
  email: "operator@localhost",
  photoURL: null as string | null,
};

export const UNLIMITED_QUOTA = {
  allowed: true,
  limit: 999999,
  remaining: 999999,
  used: 0,
};
