import { connect } from 'mongoose';

export const dbConnection = async(): Promise<void> => {
	if (!process.env.MONGODB_URI) throw new Error('Error: Invalid MONGODB_URI');

	const MONGODB_URI = process.env.MONGODB_URI;
	await connect(MONGODB_URI)
		.then(() => console.log('Connected to DB'))
		.catch((err) => console.error('Error connecting to DB ' + err));
};


