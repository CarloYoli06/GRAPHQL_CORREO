require('dotenv').config(); // Carga automáticamente .env
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const admin = require('../models/firebase'); // Asegúrate de que la ruta sea correcta

const sendVerificationCode = async (email, code) => {
  console.log(`[Mock] Enviando código de verificación ${code} a ${email}`);
  const msg = {
  to: email, // Change to your recipient
  from: 'guelito002@gmail.com', // Change to your verified sender
  subject: 'Validad tu cuenta',
  text: 'Tu código de verificación es: ' + code,
  html: '<strong> Código: '+ code +'</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })
  // En producción, implementar con Nodemailer, SendGrid, etc.
  return true;
};

module.exports = {
  sendVerificationCode,
};