const firebaseConfig = {
  apiKey: "AIzaSyAfMJZqdszm_rwx_NbyVT7lNLN22T1DI_c",
  authDomain: "kim-stylus.firebaseapp.com",
  projectId: "kim-stylus",
  storageBucket: "kim-stylus.firebasestorage.app",
  messagingSenderId: "612654426606",
  appId: "1:612654426606:web:cecd6ca2972f24b55b86ff",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Apaga registros com mais de 60 dias
function limparRegistrosAntigos() {
  const limite = new Date();
  limite.setDate(limite.getDate() - 60);

  db.collection("registros")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const r = doc.data();
        if (r.data) {
          const dataReg = new Date(r.data);
          if (dataReg < limite) {
            doc.ref.delete();
          }
        }
      });
    })
    .catch((erro) => {
      console.log("Erro ao limpar antigos:", erro);
    });
}
