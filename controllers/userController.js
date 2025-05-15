const userModel = require('../models/userModel');
const authCodeModel = require('../models/AuthCodeModel');
const {db} = require('../models/firebase'); // Asegúrate de que la ruta sea correcta
const { validateEmail, validatePhone } = require('../utils/validators');
const { sendVerificationCode } = require('../services/emailService');

const CODE_EXPIRATION_MINUTES = 60; // 1 hora
const RESEND_TIMEOUT_MS = 60000; // 1 minute

const resolvers = {
  Query: {
    getUsers: () => userModel.getAll(),
    getUser: (_, { id }) => userModel.getUserById(id)
  },
  Mutation: {
    async registerUser(_, { email, phone }) {
      if (!validateEmail(email)) {
        throw new Error('Formato de email incorrecto');
      }
      
      if (!validatePhone(phone)) {
        throw new Error('Formato de teléfono inválido. Usa formato internacional');
      }

      const existingUser = await userModel.getUserByEmail(email);
      if (existingUser) {
        throw new Error('El usuario ya existe');
      }

      const user = await userModel.create({ 
        email, 
        phone, 
        isVerified: false 
      });

      await this.createVerificationCode(user);

      return user;
    },

    async verifyCode(_, { email, code }) {
      const user = await userModel.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          user: null
        };
      }

      if (user.isVerified) {
        return {
          success: true,
          message: 'El usuario ya estaba verificado',
          user
        };
      }

      const authCode = await authCodeModel.getLatestByUserId(user.id);
      if (!authCode) {
        return {
          success: false,
          message: 'Código de verificación no encontrado',
          user: null
        };
      }

      // Verificar expiración (5 minutos)
      const createdAt = new Date(authCode.createdAt);
      const now = new Date();
      const diffMinutes = (now - createdAt) / (1000 * 60);

      if (diffMinutes > CODE_EXPIRATION_MINUTES) {
        return {
          success: false,
          message: 'El código de verificación ha expirado',
          user: null
        };
      }

      if (authCode.code !== code) {
        return {
          success: false,
          message: 'Código de verificación incorrecto',
          user: null
        };
      }

      // Marcar usuario como verificado
      const updatedUser = await userModel.update(user.id, { isVerified: true });

      return {
        success: true,
        message: 'Usuario verificado exitosamente',
        user: updatedUser
      };
    },

    async login(_, { email }) {
      const user = await userModel.getUserByEmail(email);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.isVerified) {
        throw new Error('El usuario no está verificado. Por favor verifica tu email primero');
      }

      return true;
    },

    async resendCode(_, { email }) {
      const user = await userModel.getUserByEmail(email);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (user.isVerified) {
        throw new Error('El usuario ya está verificado');
      }

      // Verificar tiempo mínimo entre reenvíos
      const lastCode = await authCodeModel.getLatestByUserId(user.id);
      if (lastCode) {
        const lastSent = new Date(lastCode.createdAt);
        const now = new Date();
        if ((now - lastSent) < RESEND_TIMEOUT_MS) {
          throw new Error('Por favor espera 1 minuto antes de solicitar un nuevo código');
        }
      }
      await db.collection('authCodes').doc(user.id).delete();

      await this.createVerificationCode(user);

      return true;
    },

    async createVerificationCode(user) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await authCodeModel.create({
        userId: user.id,
        code,
        createdAt: new Date().toISOString()
      });

      await sendVerificationCode(user.email, code);
    }
  }
};

module.exports = resolvers;