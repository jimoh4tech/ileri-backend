import { Schema, model } from 'mongoose';
import { Token } from './auth.interface';

const schema = new Schema<Token>({
	userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
	token: { type: String, required: true },
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
		expires: 900,
	},
});

schema.set('toJSON', {
	transform(_doc, ret) {
		(ret.id = String(ret._id)), delete ret._id, delete ret.__v;
	},
});
const TokenModel = model<Token>('Token', schema);
export default TokenModel;
