const bcrypt = require('bcrypt');

// Function to hash a password
const hashPassword = async (plainPassword) => {
  const saltRounds = 10; // Number of salt rounds (higher means more secure but slower)
  console.log('hashedPassword')
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  console.log(hashedPassword)
  return hashedPassword;
};

const comparePassword = async (plainPassword, hashedPassword) => {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
  };

module.exports = {
    hashPassword,
    comparePassword
}