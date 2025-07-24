const crypto = require('crypto');
const CryptoJS = require('crypto-js');

const readlineSync = require('readline-sync');
const password = readlineSync.question('Enter your password: ', {
  hideEchoBack: true,
  mask: '*'
});

const salt = crypto.randomBytes(16).toString('hex');
const hashed = CryptoJS.MD5(salt+password).toString();

console.log('cnppwordsalt:', salt);
console.log('cnppwordhash:', hashed);

