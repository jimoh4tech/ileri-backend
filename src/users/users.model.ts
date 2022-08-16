import { model, Schema } from 'mongoose';
import { User, Role } from './users.interface';

const schema = new Schema<User>({
	name: { type: String, required: [true, 'Please add name'], minlength: 5 },
	role: { type: String, enum: ['user', 'admin'], default: Role.User },
	password: {
		type: String,
		required: [true, 'Please add password'],
		minlength: 6,
	},
	phone: {
		type: String,
		required: [true, 'Please add number'],
		minLength: 11,
	},
	email: { type: String, required: [true, 'Email is required!'], unique: true },
	address: { type: String },
	createdAt: { type: Date, default: Date.now },
});

schema.set('toJSON', {
	transform: (_document, returnedObject) => {
		(returnedObject.id = String(returnedObject._id)),
			delete returnedObject._id,
			delete returnedObject.__v;
	},
});

const UserModel = model<User>('User', schema);

export default UserModel;
