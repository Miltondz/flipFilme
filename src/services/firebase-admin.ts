import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../serviceAccountKeyFB.json';

const app = initializeApp({
  credential: cert(serviceAccount as any)
});

export const adminDb = getFirestore(app);