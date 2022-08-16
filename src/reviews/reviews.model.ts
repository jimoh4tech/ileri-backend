import { model, Schema, SchemaTypes } from 'mongoose';
import { Review } from './reviews.interface';

const schema = new Schema<Review>({
	user: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
	comment: { type: String, required: true },
	rating: { type: Number, required: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

schema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = String(ret._id),
      delete ret._id,
      delete ret.__v;
  },
});

const ReviewModel = model<Review>('Review', schema);
export default ReviewModel;
