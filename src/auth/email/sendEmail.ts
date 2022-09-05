/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createTransport } from 'nodemailer';
import { compile } from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

const sendEmail = (
	email: string,
	subject: string,
	payload: unknown,
	template: string
) => {
	try {
		
		const transporter = createTransport({
			service: 'gmail',
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
		const source = readFileSync(join(__dirname, template), 'utf8');
		const compiledTemplate = compile(source);
		const options = () => {
			return {
				from: '"ILERI-OLUWA JIM-KAD Ventures"',
				to: email,
				subject,
				html: compiledTemplate(payload),
			};
		};

		transporter.sendMail(options(), (error:unknown) => {
      if (error) return error;
      return true;
		});
	} catch (error) {
		return error;
	}
};

export { sendEmail };
