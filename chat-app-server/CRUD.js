import { addDoc, getDocs, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";

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

export async function update(docRef, newData) {
    try {
        await updateDoc(docRef, newData);
        console.log("Message updated: ", docRef.id);
    } catch (e) {
        console.error("Error updating the message: ", error);
        throw error;
    }
}

export async function deleteMessage(docRef) {
    try {
        await deleteDoc(docRef);
        console.log("Message deleted: ", docRef.id);
    } catch (e) {
        console.error("Error deleting message: ", error);
        throw error;
    }
}