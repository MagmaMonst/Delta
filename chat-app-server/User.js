import bcrypt from "bcrypt";
import { doc, setDoc, getDoc } from "firebase/firestore";

export function getUserDocRef(db, username) {
    return doc(db, "users", username);
}

export async function getUser(userDocRef) {
    const userDocSnapshot = await getDoc(userDocRef);
    if (!userDocSnapshot.exists()) return false;
    return userDocSnapshot.data();
}

export async function addUser(db, username, plaintextPassword) {
    const user = {
        username: username,
        dms: [],
        gcs: [],
        password: await bcrypt.hash(plaintextPassword, 11)
    };

    const userDocRef = getUserDocRef(db, username);

    const userDoc = await getUser(userDocRef);
    if (userDoc !== false) return { added: false, msg: "Username already exists, sorry" };

    await setDoc(userDocRef, user);
    return { added: true, msg: "User added successfully!" };
}

export async function validateUser(db, username, plaintextPassword) {
    const userDocRef = getUserDocRef(db, username);

    const userDoc = await getUser(userDocRef);
    if (!userDoc) return { valid: false, msg: "No user with given username exists" };

    const result = await bcrypt.compare(plaintextPassword, userDoc.password);
    if (result) {
        return { valid: true, msg: "Username and password are valid!" };
    } else {
        return { valid: false, msg: "Invalid password" };
    }
}