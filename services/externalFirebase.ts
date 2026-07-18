import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, get, query, orderByKey, limitToLast, endBefore } from 'firebase/database';

// Helper to get or initialize an external Firebase app for RTDB access
const getExternalDb = (name: string, databaseURL: string) => {
  const existingApp = getApps().find(app => app.name === name);
  const app = existingApp || initializeApp({ databaseURL }, name);
  return getDatabase(app);
};

export const betrixDb = getExternalDb('betrix', 'https://betrix-ai-default-rtdb.firebaseio.com');
export const bettipsDb = getExternalDb('bettips', 'https://bettips-ai-default-rtdb.firebaseio.com');

export { ref, get, query, orderByKey, limitToLast, endBefore };
