import * as firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyBawSMeuepLWJhq1ttQ5kWJjR0UNkNocP8',
  authDomain: 'astraining-95c0a.firebaseapp.com',
  databaseURL: 'https://astraining-95c0a.firebaseio.com',
  projectId: 'astraining-95c0a',
  storageBucket: 'astraining-95c0a.appspot.com',
  messagingSenderId: '41136097540',
};
firebase.initializeApp(firebaseConfig);

export default firebase;
