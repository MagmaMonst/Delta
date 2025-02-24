import bcrypt from "bcrypt";
import { addDoc, getDoc, collection } from "firebase/firestore";
export async function addUser(db, username, plaintextPassword) {
    const user = {
        username: username,
        dms: [],
        gcs: [],
        password: await bcrypt.hash(plaintextPassword, 11)
    };
    try {
        const userDocRef = await addDoc(collection(db, "users"), user);
        const userDocSnapshot = getDoc(userDocRef);
        return userDocSnapshot;
    } catch (e) {
        console.error(e);
    }
}

export async function validateUser(db, username, plaintextPassword) {

}