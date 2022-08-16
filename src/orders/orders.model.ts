import { model, Schema } from 'mongoose';
import { NewOrder } from './orders.interface';

const schema = new Schema<NewOrder>({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	paymentRef: { type: String, required: true },
	address: { type: String, required: [true, 'Please add a valid addres'] },
	items: [
		{
			itemId: { type: Schema.Types.ObjectId, required: true, ref: 'Item' },
			quantity: { type: Number, default: 1 },
		},
	],
	status: {
		type: String,
		enum: ['confirmed', 'shipped', 'delivered'],
		required: [true, 'Please add a valid status'],
	},
	total: { type: Number, required: true },
	name: { type: String, required: true },
	phone: { type: String, required: true },
	city: { type: String, required: true },
	type: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

schema.set('toJSON', {
	transform(_doc, ret) {
		(ret.id = String(ret._id)), delete ret._id, delete ret.__v;
	},
});

const OrderModel = model<NewOrder>('Order', schema);

export default OrderModel;
