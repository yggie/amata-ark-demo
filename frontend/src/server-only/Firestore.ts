import { getFirestore } from "firebase-admin/firestore";

import app from "./FirebaseApp";

const db = getFirestore(app);

export default db;

export const collections = {
  creators: db.collection("creator-profiles"),
  collectibles: db.collection("collectibles"),
};
