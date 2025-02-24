import bcrypt from "bcrypt";

export async function addUser(db, username, plaintextPassword) {
    const user = {
        username: username,
        dms: [],
        gcs: [],
        password: await bcrypt.hash(plaintextPassword, 11)
    };
    try {
        const userDocRef = await db.collection("users").add(user);
        return userDocRef;
    } catch (e) {
        console.error(e);
    }
}

export async function validateUser(db, username, plaintextPassword) {

}