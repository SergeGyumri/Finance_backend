import nodemailer from 'nodemailer';
import validator from 'validator';
import md5 from 'md5';

const {
  EMAIL_NAME, EMAIL_FROM, EMAIL_PASSWORD, PASSWORD_SECRET, RESET_PASS_URL,
} = process.env;
const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_NAME,
    pass: EMAIL_PASSWORD,
  },
});

class helper {
  static passwordHash = (string) => md5(md5(string) + PASSWORD_SECRET);

  static passwordComparison = (password, basePassword) => password === basePassword;

  static normalizeEmail = (email) => validator.normalizeEmail(email);

  static verifyEmail = async (toEmail, verifyCode) => {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: toEmail,
      subject: 'Your Verify Code',
      html: `<div>   
        <p style="
        font-family: 'Roboto', 'sans-serif';
        font-style: normal;
        font-weight: 700;
        font-size: 20px;
        text-align: center;
        color: #000000;">Welcome to your Finance friend, use this code to verify your account, if you did not try to register, then do not pay attention!</p>
        <p style="
        padding: 15px 30px;
        background: #26865c;
        border-radius: 5px;
        font-family: 'Roboto', 'sans-serif';
        font-style: normal;
        font-weight: 700;
        font-size: 14px;
        text-align: center;
        color: #ffffff;">Your code: ${verifyCode}</p>
    </div>`,
    });
  };

  static forgotEmail = async (toEmail, name, forgotToken) => {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: toEmail,
      subject: 'Reset your Yas.am password.',
      text: '',
      html: `
      <div>
        <p>Hi dear ${name}, \n We are sending you this email because you requested a password reset. Click on this link to create a new password: BUTTON \n If you didn't request a password reset, you can ignore this email. Your password will not be changed. the finance friend team.</p>
        <a href="${RESET_PASS_URL}/?token=${forgotToken}" style="
          font-family: 'Roboto', 'sans-serif';
          font-style: normal;
          font-weight: 700;
          font-size: 14px;
          text-align: center;">Click this link to reset your password
         </a>
       </div>`,
    });
  };
}

export default helper;
