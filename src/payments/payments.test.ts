import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, connection } from 'mongoose';
import supertest, { Response } from 'supertest';
import { app } from '../app';
import { Role, Users } from '../users/users.interface';
import { PaymentStatus } from './payments.interface';

const api = supertest(app);

let mongodb: MongoMemoryServer;

const initialUsers: Users = [
	{
		id: 'abc1',
		name: 'Abu Abdillah',
		password: 'password',
		phone: '0099033223432',
		email: 'test1@ts.com',
		role: Role.Admin,
	},
	{
		id: 'abc2',
		name: 'Abu Ibrahim',
		password: 'password',
		phone: '009903787632',
		email: 'test2@ts.com',
		role: Role.User,
	},
];

const initialPayment = [
	{
		amount: 10000,
		status: PaymentStatus.Refunded,
	},
	{
		amount: 135000,
		status: PaymentStatus.Completed,
	},
	{
		amount: 32000,
		status: PaymentStatus.Pending,
	},
];

const loginDetails = { password: 'password', phone: '0099033223432' };
const userLogin = { password: 'password', phone: '009903787632' };
let res: Response;
let resUser: Response;

beforeAll(async () => {
	try {
		mongodb = await MongoMemoryServer.create();
		const uri = mongodb.getUri();
		await connect(uri);
		await api.post('/api/v1/users').send(initialUsers[0]);
		await api.post('/api/v1/users').send(initialUsers[1]);

		res = await api.post('/api/v1/auth').send(loginDetails);
		resUser = await api.post('/api/v1/auth').send(userLogin);
	} catch (error) {
		console.error(error);
	}
});

describe('Payment', () => {
	describe('Make', () => {
		it('should be able to make payment', async () => {
			const payment = await api
				.post('/api/v1/payments')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(initialPayment[0])
				.expect(201)
				.expect('Content-type', /application\/json/);

			expect(payment.body.amount).toBe(initialPayment[0].amount);
			expect(payment.body.status).toBe('pending');
			expect(payment.body.user).toBeTruthy();
		});

		it('should be able to make multiple payments', async () => {
			const payment = await api
				.post('/api/v1/payments')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(initialPayment[1])
				.expect(201)
				.expect('Content-type', /application\/json/);

			expect(payment.body.amount).toBe(initialPayment[1].amount);
			expect(payment.body.status).toBe('pending');
			expect(payment.body.user).toBeTruthy();
		});
	});

	describe('Admin and Restricted user', () => {
		it('should return all payments related to the logged in user', async () => {
			const payments = await api
				.get('/api/v1/payments/user')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(payments.body).toHaveLength(2);
			expect(payments.body[0].amount).toBe(initialPayment[0].amount);
			expect(payments.body[0].status).toBe('pending');
		});
		it('should be able to get all payments', async () => {
			const payments = await api
				.get('/api/v1/payments')
				.set('Authorization', `Bearer ${res.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(payments.body).toHaveLength(2);
			expect(payments.body[0].amount).toBe(initialPayment[0].amount);
			expect(payments.body[0].status).toBe('pending');
    });
    
		it('should thrown error if user tries to get all payments', async () => {
			const payments = await api
				.get('/api/v1/payments')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(403);

			expect(payments.text).toContain('Admins only');
		});
	});
});

afterAll(async () => {
	await connection.close();
	await mongodb.stop();
});
