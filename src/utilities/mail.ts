import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.MAILER_EMAIL,
    pass: process.env.MAILER_EMAIL_PASSWORD,
  },
});

export const sendEmail = (
  destinatario: string,
  asunto: string,
  content: string,
) => {
  const mailOptions = {
    from: process.env.MAILER_EMAIL,
    to: destinatario,
    subject: asunto,
    html: content,
  };

  transporter.sendMail(mailOptions, (error: any, info: any) => {
    if (error) {
      console.error('Error al enviar el correo electrónico:', error);
    } else {
      console.log('Correo electrónico enviado:', info.response);
    }
  });
};



export const MAIL_COLORS_UTILS = {
  USER: "#4318FF",
  ESTADO: "#8EA501",
}