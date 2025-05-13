const { usersCollection } = require('./firebase');

// Obtener todos los usuarios
const getAll = async () => {
    const snapshot = await usersCollection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Obtener un usuario por su ID
const getUserById = async (id) => {
    const doc = await usersCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
};

// Crear un nuevo usuario
const create = async (name, email) => {
    const newUser = { name, email };
    const docRef = await usersCollection.add(newUser);
    return { id: docRef.id, ...newUser };
};

// Actualizar un usuario por su ID
const update = async (id, updatedFields) => {
    const docRef = usersCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    await docRef.update(updatedFields);
    return { id, ...doc.data(), ...updatedFields };
};

// Eliminar un usuario por su ID
const remove = async (id) => {
    const docRef = usersCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    await docRef.delete();
    return { id, ...doc.data() };
};

// Exportar las funciones para usarlas en otros archivos
module.exports = {
    getAll,
    getUserById,
    create,
    update,
    remove,
};