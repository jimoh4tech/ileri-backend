import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (
	_request: Request,
	response: Response,
	_next: NextFunction
) => {
	const message = 'Resource not found';

	response.status(404).send(message);
};
