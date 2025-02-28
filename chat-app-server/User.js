import bcrypt from "bcrypt";
import { doc, collection, query, where, setDoc, getDoc, addDoc } from "firebase/firestore";

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
        password: await bcrypt.hash(plaintextPassword, 11),
        rooms: [], // refs to each room,
        roomJoinRequests: []
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

export async function createRoom(db, roomName) {
    const roomsCollectionRef = collection(db, "rooms");
    const roomRef = await addDoc(roomsCollectionRef, {
        name: roomName,
        users: [],
        tentativeUsers: [], // users who haven't accepted the request to be added yet
        messages: []
    });
    return roomRef;
}

export async function addUserToRoom(db, username, roomRef) {
    const userRef = getUserDocRef(db, username);
    const user = await getUser(userRef);
    if (user === false) {
        return { added: false, msg: "User does not exist" };
    }
    const roomSnapshot = await getDoc(roomRef);
    if (!roomSnapshot.exists()) {
        return { added: false, msg: "Room does not exist" };
    }

    user.roomJoinRequests.push(getRoomID(roomRef));
    await setDoc(userRef, user);

    const roomData = roomSnapshot.data();
    roomData.tentativeUsers.push(username);
    await setDoc(roomRef, roomData);
    return { added: true, msg: `User ${username} added successfully to room ${roomData.name}` };
}

export async function acceptRoomAddRequest(db, username, roomRef) {
    const userRef = getUserDocRef(db, username);
    const user = await getUser(userRef);
    if (user === false) {
        return { success: false, msg: "User does not exist" };
    }

    const roomSnapshot = await getDoc(roomRef);
    if (!roomSnapshot.exists()) {
        return { success: false, msg: "Room does not exist" };
    }
    const roomData = roomSnapshot.data();

    const indexOfUser = roomData.tentativeUsers.indexOf(username);
    if (indexOfUser === -1) {
        return { success: false, msg: "User has not been asked to join group, or already has joined group" };
    }

    const indexOfRequest = user.roomJoinRequests.indexOf(getRoomID(roomRef));
    if (indexOfRequest === -1) {
        console.log(user.roomJoinRequests);
        return { success: false, msg: "User has not been added to group" };
    }

    roomData.tentativeUsers.splice(indexOfUser, 1);
    roomData.users.push(username);
    await setDoc(roomRef, roomData);

    user.roomJoinRequests.splice(indexOfRequest, 1);
    user.rooms.push(getRoomID(roomRef));
    await setDoc(userRef, user);

    return { success: true, msg: `User ${username} successfully joined room ${roomData.name}` };
}

export function getRoomRef(db, roomID) {
    return doc(db, "rooms", roomID);
}

export function getRoomID(roomRef) {
    return roomRef.id;
}

export async function getRoomData(db, roomID) {
    const roomRef = getRoomRef(db, roomID);
    const roomSnapshot = await getDoc(roomRef);
    const roomData = roomSnapshot.data();
    return roomData;
}