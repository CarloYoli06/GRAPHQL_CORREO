const { usersCollection } = require('./firebase');

const getAll = async () => {
  const snapshot = await usersCollection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getUserById = async (id) => {
  const doc = await usersCollection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const getUserByEmail = async (email) => {
  const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

const create = async ({ email, phone, isVerified = false }) => {
  const newUser = { email, phone, isVerified, createdAt: new Date().toISOString() };
  const docRef = await usersCollection.add(newUser);
  return { id: docRef.id, ...newUser };
};

const update = async (id, updatedFields) => {
  const docRef = usersCollection.doc(id);
  await docRef.update(updatedFields);
  const doc = await docRef.get();
  return { id, ...doc.data() };
};

module.exports = {
  getAll,
  getUserById,
  getUserByEmail,
  create,
  update,
};