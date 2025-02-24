import { collection, getDocs, addDoc as f_create, updateDoc as f_update, deleteDoc as f_delete, doc } from "firebase/firestore";

export async function createDoc(db, collectionName, document) {
    try {
        const docRef = await f_create(collection(db, collectionName), document);
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

export async function updateDoc(docRef, newData) {
    try {
        await f_update(docRef, newData);
        console.log("Document updated: ", docRef.id);
    } catch (e) {
        console.error("Error updating: ", e);
    }
}

export async function deleteDoc(docRef) {
    try {
        await f_delete(docRef);
        console.log("Document deleted: ", docRef.id);
    } catch (e) {
        console.error("Error deleting: ", e);
    }
}