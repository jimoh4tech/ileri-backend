import { model, Schema } from 'mongoose';
import { NewPayment } from './payments.interface';

const schema = new Schema<NewPayment>({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	amount: { type: Number, required: [true, 'Please add a valid amount'] },
	status: {
		type: String,
		enum: ['pending', 'completed', 'refunded'],
		required: true,
	},
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

schema.set('toJSON', {
	transform(_doc, ret) {
		(ret.id = String(ret._id)), delete ret._id, delete ret.__v;
	},
});

const PaymentModel = model<NewPayment>('Payment', schema);

export default PaymentModel;
