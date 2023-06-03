const nodemailer = require("nodemailer");


class XL_GOI_THU_DIEN_TU {
    Goi_Thu_Lien_he(from, to, subject, body) {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'tieudan203@gmail.com', // User gmail 
                pass: 'pndexevztbvkxtop' // Pwd gmail
            }
        });

        let mailOptions = {
            from: `Của hàng PET SHOP <${from}>`,
            to: to,
            subject: subject,
            html: body
        };
        return transporter.sendMail(mailOptions)
    }

}
var Goi_thu = new XL_GOI_THU_DIEN_TU()
module.exports = Goi_thu

