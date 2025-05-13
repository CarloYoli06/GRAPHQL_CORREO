const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  // Validación básica de teléfono internacional
  const re = /^\+\d{1,3}\d{6,14}$/;
  return re.test(phone);
};

module.exports = {
  validateEmail,
  validatePhone,
};