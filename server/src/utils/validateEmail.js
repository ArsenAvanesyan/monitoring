/**
 * Валидация email адреса
 * @param {string} email - Email для проверки
 * @returns {boolean} true если email валидный, false если нет
 */
function validateEmail(email) {
  // Регулярное выражение для проверки email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = validateEmail;
