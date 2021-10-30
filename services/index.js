const {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
  query,
  where,
  orderBy,
  startAt,
  startAfter,
  limit,
} = require('firebase/firestore');

const { getAuth, signInWithCustomToken } = require('firebase/auth');
const { initializeApp } = require('firebase/app');
const jwt = require('jsonwebtoken');

const serviceAccount = require('/home/sabil/Downloads/phonebook-710fe-firebase-adminsdk-p87by-160871680c.json');
var services = require('../services');

const config = {
  apiKey: 'AIzaSyAmu49HAxxlUzlD7RoBPu99kCK7oFjuedM',
  authDomain: 'phonebook-710fe.firebaseapp.com',
  databaseURL: 'https://phonebook-710fe.firebaseio.com',
  projectId: 'phonebook-710fe',
  storageBucket: 'phonebook-710fe.appspot.com',
  messagingSenderId: '848441670315',
};
const app = initializeApp(config);
const db = getFirestore(app);

const data = {
  iss: serviceAccount.client_email,
  sub: serviceAccount.client_email,
  aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 60 * 60, // Maximum expiration time is one hour
  uid: 'some-uid',
};
var token = jwt.sign(data, serviceAccount.private_key, { algorithm: 'RS256' });

const auth = getAuth();
const phonebooksCollection = collection(db, 'phonebooks');

const getPhonebooks = (queryStringObj) => {
  let { page, offset, perPage, name, phone } = queryStringObj
  return new Promise((resolve, reject) => {
    signInWithCustomToken(auth, token)
      .then(async (userCredential) => {
        let phonebookSnapshot;
        let searchQuery;

        if (!name && !phone) {
          if (page == 1) {
            const first = query(phonebooksCollection, orderBy('id'), limit(15));
            phonebookSnapshot = await getDocs(first);
          } else {
            offset = (page - 2) * 5 + 15
            const first = query(phonebooksCollection, orderBy('id'), limit(offset));

            phonebookSnapshot = await getDocs(first);
            const lastVisible = phonebookSnapshot.docs[phonebookSnapshot.docs.length - 1];
            const next = query(
              phonebooksCollection,
              orderBy('id'),
              startAfter(lastVisible),
              limit(5)
            );
            phonebookSnapshot = await getDocs(next);
          }

        } else if (name || phone) {
          if (name && phone) {
            searchQuery = query(
              phonebooksCollection,
              where('name', '==', name),
              where('phone', '==', phone)
            );
          } else if (name) {
            searchQuery = query(phonebooksCollection, where('name', '==', name));
          } else {
            searchQuery = query(phonebooksCollection, where('phone', '==', phone));
          }
          phonebookSnapshot = await getDocs(searchQuery);
        }
        const phonebookList = phonebookSnapshot.docs.map((doc) => doc.data());
        resolve(phonebookList);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        reject(error);
      });
  });
};

//Create new instance
const createPhonebook = (input) => {
  return new Promise((resolve, reject) => {
    signInWithCustomToken(auth, token)
      .then(async (userCredential) => {
        const id = Date.now().toString();
        const phonebook = await setDoc(doc(phonebooksCollection, id), {
          id: id,
          name: input.name,
          phone: input.phone,
          createdAt: Timestamp.fromDate(new Date(Date.now())),
          updatedAt: Timestamp.fromDate(new Date(Date.now())),
        });

        resolve({
          id: id,
          name: input.name,
          phone: input.phone,
          createdAt: Timestamp.fromDate(new Date(Date.now())),
          updatedAt: Timestamp.fromDate(new Date(Date.now())),
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        reject(error);
      });
  });
};

//Update existing instance
const updatePhonebook = (id, input) => {
  return new Promise((resolve, reject) => {
    signInWithCustomToken(auth, token)
      .then(async (userCredential) => {
        const phonebookRef = doc(db, 'phonebooks', id);
        const update = {
          createdAt: serverTimestamp(),
        };
        if (input.name) {
          update.name = input.name;
        }
        if (input.phone) {
          update.phone = input.phone;
        }

        await updateDoc(phonebookRef, update);

        const phonebookSnap = await getDoc(phonebookRef);
        if (phonebookSnap.exists()) {
          resolve(phonebookSnap.data());
        } else {
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        reject(error);
      });
  });
};

//Delete an instance
const deletePhonebook = (id) => {
  return new Promise((resolve, reject) => {
    signInWithCustomToken(auth, token)
      .then(async (userCredential) => {
        const phonebookRef = doc(db, 'phonebooks', id);
        const phonebookSnap = await getDoc(phonebookRef);
        await deleteDoc(phonebookRef);
        if (phonebookSnap.exists()) {
          resolve(phonebookSnap.data());
        } else {
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        reject(error);
      });
  });
};

module.exports = {
  getPhonebooks,
  createPhonebook,
  updatePhonebook,
  deletePhonebook,
};
