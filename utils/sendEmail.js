const nodemailer = require('nodemailer');

const sendEmail = async (req, res) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'christop.koch52@ethereal.email',
      pass: 'jKxSs1ZWDTsaFNxkGb',
    },
  });

  const info = await transporter.sendMail({
    from: '"VFTHV" <vadfthv@gmail.com>', // sender address
    to: 'user@user.com', // list of receivers
    subject: 'Testing SDG back-end ✔', // Subject line
    text: 'SDG back end?', // plain text body
    html: '<b>sdg back end</b>', // html body
  });
};

module.exports = sendEmail;
