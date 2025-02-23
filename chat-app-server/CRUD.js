import { addDoc, getDocs, collection } from "firebase/firestore";

export async function create(db, collectionName, document) {
    try {
        const docRef = await addDoc(collection(db, collectionName), document);
        console.log("Document written with ID: ", docRef.id);
        return docRef;
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function readAll(db, collectionName) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
    });
    return querySnapshot;
}