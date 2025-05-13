const userModel = require('../models/userModel');
const authCodeModel = require('../models/authCodeModel');
const { generateToken } = require('../utils/auth');
const { validateEmail, validatePhone } = require('../utils/validators');
const { sendVerificationCode } = require('../services/emailService');
const { sendSMSCode } = require('../services/smsService');

const CODE_EXPIRATION_MINUTES = 5;
const RESEND_TIMEOUT_MS = 60000; // 1 minute

const resolvers = {
  Query: {
    getUsers: () => userModel.getAll(),
    getUser: (_, { id }) => userModel.getUserById(id)
  },
  Mutation: {
    async registerUser(_, { email, phone, via }) {
      // Validate inputs
      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }
      
      if (!validatePhone(phone)) {
        throw new Error('Invalid phone number format. Use international format');
      }

      // Check if user already exists
      const existingUser = await userModel.getUserByEmail(email);
      if (existingUser) {
        if (existingUser.isVerified) {
          throw new Error('User already exists and is verified');
        }
        // If not verified, we'll update the record and send new code
      }

      // Create or update user
      const user = existingUser 
        ? await userModel.update(existingUser.id, { email, phone })
        : await userModel.create({ email, phone, isVerified: false });

      // Generate and save verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await authCodeModel.create({
        userId: user.id,
        code,
        createdAt: new Date().toISOString()
      });

      // Send code via requested channel
      if (via === 'email') {
        await sendVerificationCode(email, code);
      } else if (via === 'sms') {
        await sendSMSCode(phone, code);
      } else {
        throw new Error('Invalid verification channel');
      }

      return true;
    },

    async verifyCode(_, { email, code }) {
      const user = await userModel.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('User is already verified');
      }

      const authCode = await authCodeModel.getLatestByUserId(user.id);
      if (!authCode) {
        throw new Error('No verification code found');
      }

      // Check code expiration (5 minutes)
      const createdAt = new Date(authCode.createdAt);
      const now = new Date();
      const diffMinutes = (now - createdAt) / (1000 * 60);

      if (diffMinutes > CODE_EXPIRATION_MINUTES) {
        throw new Error('Verification code has expired');
      }

      if (authCode.code !== code) {
        throw new Error('Invalid verification code');
      }

      // Mark user as verified
      await userModel.update(user.id, { isVerified: true });

      // Generate and return JWT token
      const token = generateToken(user);
      return {
        token,
        user
      };
    },

    async login(_, { email }) {
      const user = await userModel.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        // User is verified, no need to send code
        // In a real implementation, you might send a login link or token directly
        return true;
      }

      // Check when last code was sent to prevent spam
      const lastCode = await authCodeModel.getLatestByUserId(user.id);
      if (lastCode) {
        const lastSent = new Date(lastCode.createdAt);
        const now = new Date();
        if ((now - lastSent) < RESEND_TIMEOUT_MS) {
          throw new Error('Please wait before requesting a new code');
        }
      }

      // Generate and send new verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await authCodeModel.create({
        userId: user.id,
        code,
        createdAt: new Date().toISOString()
      });

      // Send via email by default (you could make this configurable)
      await sendVerificationCode(email, code);

      return true;
    }
  }
};

module.exports = resolvers;