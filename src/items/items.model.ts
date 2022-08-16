import { model, Schema } from 'mongoose';
import { Item } from './items.interface';

const schema = new Schema<Item>({
	name: {
		type: String,
		required: [true, 'Please add item name'],
		unique: true,
	},
	price: {
		type: Number,
		required: [true, 'Please add item price'],
	},
	category: {
		type: String,
		enum: ['block', 'cement', 'sand', 'others'],
		required: true,
	},
	imageUrl: {
		type: String,
		required: true,
	},
	deliveryValue: {type: Number, required: true},
	discount: { type: Number, required: true },
	description: { type: String },
	stocked: { type: Boolean, default: true },
	reviews: { rating: Number, numReviews: Number },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

schema.set('toJSON', {
	transform: (_document, returnedObject) => {
		(returnedObject.id = String(returnedObject._id)),
			delete returnedObject._id,
			delete returnedObject.__v;
	},
});

const ItemModel = model<Item>('Item', schema);

export default ItemModel;
