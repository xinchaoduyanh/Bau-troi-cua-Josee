const readline = require('readline');
const bcrypt = require('bcryptjs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Nhập password cần hash: ', async (password) => {
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash password của bạn là:');
  console.log(hash);
  rl.close();
});
