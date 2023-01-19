import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'

import 'firebase/auth'
import 'firebase/database'

const firebaseConfig = {
    apiKey: 'AIzaSyDiRmTF0H_IZqdAUNLoy2JLFeT-BI3HKmo',
    authDomain: 'raymond-bar.firebaseapp.com',
    databaseURL: "https://raymond-bar-default-rtdb.firebaseio.com/",
    projectId: 'raymond-bar',
    storageBucket: "raymond-bar.appspot.com",
    messagingSenderId: "826148068765",
    appId: "1:826148068765:web:96fdbe86cb58ecf574e374"
};

const app = initializeApp(firebaseConfig)

const database = getDatabase(app)
const storage = getStorage(app)

export { database, storage }