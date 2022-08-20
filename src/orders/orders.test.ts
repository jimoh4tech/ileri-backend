import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, connection } from 'mongoose';
import supertest, { Response } from 'supertest';
import { app } from '../app';
import { Role, NewUser } from '../users/users.interface';
import { Category, ItemFields } from '../items/items.interface';
import { CartItem } from '../carts/carts.interface';

const api = supertest(app);

let mongodb: MongoMemoryServer;

const initialUsers: NewUser[] = [
	{
		name: 'Abu Abdillah',
		password: 'password',
		phone: '0099033223432',
		email: 'test1@ts.com',
		role: Role.Admin,
	},
	{
		name: 'Abu Ibrahim',
		password: 'password',
		phone: '009903787632',
		email: 'test2@ts.com',
		role: Role.User,
	},
];

const initialItems: ItemFields[] = [
	{
		name: '6 inches with hole',
		price: 200,
		category: Category.Block,
		imageUrl: 'localhost:3000/6-inches-no',
		deliveryValue: 2,
	},
	{
		name: '6 inches without hole',
		price: 300,
		category: Category.Sand,
		imageUrl: 'localhost:3000/6-inches',
		deliveryValue: 1,
	},
];

let res: Response;
let resUser: Response;
let items: Response;

beforeAll(async () => {
	try {
		mongodb = await MongoMemoryServer.create();
		const uri = mongodb.getUri();
		await connect(uri);
		await api.post('/api/v1/auth/register').send(initialUsers[0]).expect(201);
		await api.post('/api/v1/auth/register').send(initialUsers[1]).expect(201);

		res = await api.post('/api/v1/auth/login').send(initialUsers[0]);
		resUser = await api.post('/api/v1/auth/login').send(initialUsers[1]);

		await api
			.post('/api/v1/items')
			.set('Authorization', `Bearer ${res.body.token}`)
			.send(initialItems[0])
			.expect(201)
			.expect('Content-type', /application\/json/);

		await api
			.post('/api/v1/items')
			.set('Authorization', `Bearer ${res.body.token}`)
			.send(initialItems[1])
			.expect(201)
			.expect('Content-type', /application\/json/);

		items = await api
			.get('/api/v1/items')
			.expect(200)
			.expect('Content-type', /application\/json/);

		const itemObj: CartItem = {
			itemId: items.body[0].id as string,
			quantity: 12,
		};
		await api
			.post('/api/v1/carts')
			.set('Authorization', `Bearer ${resUser.body.token}`)
			.send(itemObj)
			.expect(201)
			.expect('Content-type', /application\/json/);
	} catch (error) {
		console.error(error);
	}
});

describe('Orders API', () => {
	describe('Place order', () => {
		it('should be able to place other successfully', async () => {
			const orderObj = {
				name: 'Abu Abdillah',
				address: '123 Example',
				city: 'Iba',
				phone: '0105552228899',
				type: 'standard',
				total: 123456,
				paymentRef: '12303093',
			};
			const order = await api
				.post('/api/v1/orders')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(orderObj)
				.expect(201)
				.expect('Content-type', /application\/json/);

			expect(order.body.items).toHaveLength(1);
			expect(order.body.name).toBe(orderObj.name);
			expect(order.body.address).toBe(orderObj.address);
			expect(order.body.city).toBe(orderObj.city);
			expect(order.body.phone).toBe(orderObj.phone);
			expect(order.body.type).toBe(orderObj.type);
			expect(order.body.total).toBe(orderObj.total);
			expect(order.body.paymentRef).toBe(orderObj.paymentRef);
			expect(order.body.createdAt).toBeTruthy();
		});
		it('should empty cart after successful order', async () => {
			const cart = await api
				.get('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);
			expect(cart.body).toHaveLength(0);
		});

		it('should throw error if address is missing', async () => {
			const orderObj = {
				name: 'Abu Abdillah',
				city: 'Iba',
				phone: '0105552228899',
				type: 'standard',
				total: 123456,
				paymentRef: '12303093',
			};
			const order = await api
				.post('/api/v1/orders')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(orderObj)
				.expect(400);

			expect(order.text).toContain('Incorrect or missing address ');
		});

		it('should throw error if name is missing', async () => {
			const orderObj = {
				address: '123 Example',
				city: 'Iba',
				phone: '0105552228899',
				type: 'standard',
				total: 123456,
				paymentRef: '12303093',
			};
			const order = await api
				.post('/api/v1/orders')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(orderObj)
				.expect(400);

			expect(order.text).toContain('Incorrect or missing name ');
		});
		it('should throw error if user token is not provided', async () => {
			const orderObj = {
				name: 'Abu Abdillah',
				address: '123 Example',
				city: 'Iba',
				phone: '0105552228899',
				type: 'standard',
				total: 123456,
				paymentRef: '12303093',
			};
			const order = await api.post('/api/v1/orders').send(orderObj).expect(403);

			expect(order.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});

	describe('Admin: Get Orders', () => {
		it('should get all orders', async () => {
			const orders = await api
				.get('/api/v1/orders/admin')
				.set('Authorization', `Bearer ${res.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);
			expect(orders.body).toHaveLength(1);
		});
		it('should return correct order details', async () => {
			const orderObj = {
				name: 'Abu Abdillah',
				address: '123 Example',
				city: 'Iba',
				phone: '0105552228899',
				type: 'standard',
				total: 123456,
				paymentRef: '12303093',
			};
			const orders = await api
				.get('/api/v1/orders/admin')
				.set('Authorization', `Bearer ${res.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(orders.body[0].name).toBe(orderObj.name);
			expect(orders.body[0].address).toBe(orderObj.address);
			expect(orders.body[0].city).toBe(orderObj.city);
			expect(orders.body[0].phone).toBe(orderObj.phone);
			expect(orders.body[0].type).toBe(orderObj.type);
			expect(orders.body[0].total).toBe(orderObj.total);
			expect(orders.body[0].paymentRef).toBe(orderObj.paymentRef);
		});
		it('should throw error if user tries to access', async () => {
			const orders = await api
				.get('/api/v1/orders/admin')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(403);

			expect(orders.text).toContain(
				'Forbidden Exception. Only admin can access'
			);
		});
		it('should throw error if user token is not provided', async () => {
			const orders = await api.get('/api/v1/orders/admin').expect(403);

			expect(orders.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});
	describe('User: Get Order', () => {
		it('should get all orders', async () => {
			const orders = await api
				.get('/api/v1/orders')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);
			expect(orders.body).toHaveLength(1);
		});
		it('should return correct order details', async () => {
			const orderObj = {
				name: 'Abu Abdillah',
				address: '123 Example',
				city: 'Iba',
				phone: '0105552228899',
				type: 'standard',
				total: 123456,
				paymentRef: '12303093',
			};
			const orders = await api
				.get('/api/v1/orders')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(orders.body[0].name).toBe(orderObj.name);
			expect(orders.body[0].address).toBe(orderObj.address);
			expect(orders.body[0].city).toBe(orderObj.city);
			expect(orders.body[0].phone).toBe(orderObj.phone);
			expect(orders.body[0].type).toBe(orderObj.type);
			expect(orders.body[0].total).toBe(orderObj.total);
			expect(orders.body[0].paymentRef).toBe(orderObj.paymentRef);
		});
		it('should throw error if user token is not provided', async () => {
			const orders = await api.get('/api/v1/orders').expect(403);

			expect(orders.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});

	describe('Update Order status', () => {
		it('should update order status successfully', async () => {
			const orders = await api
				.get('/api/v1/orders/admin')
				.set('Authorization', `Bearer ${res.body.token}`)
				.expect(200)
        .expect('Content-type', /application\/json/);
      
      const updatedOrder = await api
				.put(`/api/v1/orders/${orders.body[0].id}`)
        .set('Authorization', `Bearer ${res.body.token}`)
        .send({status: 'shipped'})
				.expect(200)
				.expect('Content-type', /application\/json/);
      expect(updatedOrder.body[0].status).toBe('shipped');
    });
    it('should throw error if user tries to access', async () => {
			const orders = await api
				.get('/api/v1/orders/admin')
				.set('Authorization', `Bearer ${res.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);

			const updatedOrder = await api
				.put(`/api/v1/orders/${orders.body[0].id}`)
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send({ status: 'shipped' })
				.expect(403);

			expect(updatedOrder.text).toContain(
				'Forbidden Exception. Only admin can access'
			);
		});
		it('should throw error if user token is not provided', async () => {
			const orders = await api
				.get('/api/v1/orders/admin')
				.set('Authorization', `Bearer ${res.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);

			const updatedOrder = await api
				.put(`/api/v1/orders/${orders.body[0].id}`)
				.send({ status: 'shipped' })
				.expect(403);

			expect(updatedOrder.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});
});

afterAll(async () => {
	await connection.close();
	await mongodb.stop();
});
