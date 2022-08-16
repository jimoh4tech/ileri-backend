/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { auth } from '../auth/auth.middleware';
import {
	createReview,
	deleteReview,
	getAllReviews,
	getReviewById,
} from './reviews.controller';

export const reviewRouter = Router();

reviewRouter.post('/', auth, createReview);

reviewRouter.get('/', getAllReviews);

reviewRouter.get('/:id', getReviewById);

reviewRouter.delete('/:id', auth, deleteReview);
