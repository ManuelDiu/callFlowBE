import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_EMAIL_PASSWORD,
  },
});

export const sendEmail = (
  asunto: string,
  destinatario: string,
  content: string,
) => {
  const mailOptions = {
    from: process.env.MAILER_EMAIL,
    to: destinatario,
    subject: asunto,
    html: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo electrónico:', error);
    } else {
      console.log('Correo electrónico enviado:', info.response);
    }
  });
};
