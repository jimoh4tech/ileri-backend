import { Schema, model } from 'mongoose';
import { Cart } from './carts.interface';

const schema = new Schema<Cart>({
	user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
	items: [
		{
			itemId: { type: Schema.Types.ObjectId, required: true, ref: 'Item' },
			quantity: { type: Number, default: 1 },
		},
	],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

schema.set('toJSON', {
	transform(_doc, ret) {
		(ret.id = String(ret._id)), delete ret._id, delete ret.__v;
	},
});

const CartModel = model<Cart>('Cart', schema);

export default CartModel;
