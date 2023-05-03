const nodemailer = require('nodemailer');

const sendEmail = (from, to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'mouadakroubi@gmail.com',
            pass: 'fnpdvcdwmjwczzzy'
        }
    });
    
    const mailOption = {
        from: from,
        to: to,
        subject: subject,
        text: text
    };
    
    transporter.sendMail(mailOption, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("your email is sent", info.messageId);
        }
    });
}

module.exports = sendEmail;