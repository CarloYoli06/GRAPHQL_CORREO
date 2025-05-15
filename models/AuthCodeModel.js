const { authCodesCollection } = require('./firebase');

const create = async ({ userId, code, createdAt }) => {
  const newCode = { userId, code, createdAt };
  const docRef = await authCodesCollection.add(newCode);
  
  return { id: docRef.id, ...newCode };
};

const getLatestByUserId = async (userId) => {
  const snapshot = await authCodesCollection
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

module.exports = {
  create,
  getLatestByUserId,
};