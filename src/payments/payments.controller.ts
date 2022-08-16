import { Request, Response } from 'express';
import { throwError } from '../users/users.utils';
import { NewPayment, PaymentStatus } from './payments.interface';
import PaymentModel from './payments.model';
import { parseAmount } from './payments.util';

export const MakePayment = async (req: Request, res: Response) => {
	try {
		const amount = parseAmount(req.body.amount);
		const user = req.currentUser;
		const paymentObj: NewPayment = {
			amount,
			user,
			status: PaymentStatus.Pending,
		};

		const payment = await PaymentModel.create(paymentObj);
		return res.status(201).json(payment);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const getAllPayments = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;
		if (user.role !== 'admin')
			return res.status(403).send('Forbidden Exception. Admins only.');
		const payments = await PaymentModel.find();
		return res.status(200).json(payments);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const getUserPayments = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser.id;
		const payments = await PaymentModel.find({ user });
		return res.status(200).json(payments);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const user = req.currentUser;

		if (user.role !== 'admin')
			return res.status(403).send('Forbidden Exception. Admins only.');

		const updatedPayment = await PaymentModel.findByIdAndUpdate(
			id,
			{ updatedAt: new Date() },
			{
				new: true,
				runValidators: true,
			}
		);

		return res.status(200).json(updatedPayment);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const deletePayment = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const user = req.currentUser;

		if (user.role !== 'admin')
			return res.status(403).send('Forbidden Exception. Admins only.');

		await PaymentModel.findByIdAndDelete(id);
		return res.status(204).end();
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};
