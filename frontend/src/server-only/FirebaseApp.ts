import firebaseAdmin from "firebase-admin";

import firebaseCredentials from "../../firebase-credentials.json";

export default firebaseAdmin.apps.length
  ? firebaseAdmin.app()
  : firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(firebaseCredentials as any),
      databaseURL:
        process.env.FIREBASE_DATABASE_URL ||
        "https://amatas-ark-demo.firebaseio.com",
    });
