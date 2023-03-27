import firebaseAdmin from "firebase-admin";

import firebaseCredentials from "../../frontend/firebase-credentials.json";

export default firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseCredentials as any),
  databaseURL:
    process.env.FIREBASE_DATABASE_URL ||
    "https://amatas-ark-demo.firebaseio.com",
});
