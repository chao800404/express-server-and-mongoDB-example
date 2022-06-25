const nodemailer = require('nodemailer');

module.exports = async options => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  const option = {
    from: 'Chao schedtmann <hello@gmail.com>',
    to: `${options.email}`,
    subject: `${options.subject}`,
    text: `${options.message}`
  };

  await transport.sendMail(option);
};
