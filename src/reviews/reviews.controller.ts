import { Request, Response } from 'express';
import { throwError } from '../users/users.utils';
import { NewReview, Review } from './reviews.interface';
import ReviewModel from './reviews.model';
import { parseComment, parseRating } from './reviews.util';

export const createReview = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;
		if (!user) return res.status(401).send('Unauthorized Exeception');
		const reviewObj: NewReview = {
			user,
			comment: parseComment(req.body.comment),
			rating: parseRating(req.body.rating),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const review = await ReviewModel.create(reviewObj);
		return res.status(201).json(review);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const getAllReviews = async (_req: Request, res: Response) => {
	try {
		const reviews = await ReviewModel.find({});
		res.status(200).json(reviews);
	} catch (error: unknown) {
		res.status(400).send(throwError(error));
	}
};

export const getReviewById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const review: Review | undefined = await ReviewModel.findById(id);
		if (review) return res.status(200).json(review);
		return res.status(404).send(`Review with id: ${id} not found!`);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const deleteReview = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const user = req.currentUser;
		if (!user) return res.status(401).send('Unauthorized Exeception');

		const review: Review | undefined = await ReviewModel.findById(id);

		if (user !== review.user)
			return res
				.status(401)
				.send('Unauthorized Exeception. Cannot delete another user review');

    await ReviewModel.findByIdAndDelete(id);
    return res.status(204).end();
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};
