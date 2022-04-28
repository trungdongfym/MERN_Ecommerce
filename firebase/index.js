const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require('firebase-admin/auth');
const { credential } = require('firebase-admin')

const serviceAccount = require("./firebaseAdminConfig.json");

const app = initializeApp({
   credential: credential.cert(serviceAccount)
});

const authFirebase = getAuth(app);

module.exports = {
   authFirebase
}
