const sendVerificationCode = async (email, code) => {
  console.log(`[Mock] Enviando código de verificación ${code} a ${email}`);
  // En producción, implementar con Nodemailer, SendGrid, etc.
  return true;
};

module.exports = {
  sendVerificationCode,
};