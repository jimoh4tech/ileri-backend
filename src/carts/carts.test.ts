import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, connection } from 'mongoose';
import supertest, { Response } from 'supertest';
import { app } from '../app';
import { Role, NewUser } from '../users/users.interface';
import { Category, ItemFields } from '../items/items.interface';
import { CartItem } from './carts.interface';

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
	} catch (error) {
		console.error(error);
	}
});

describe('Cart', () => {
	describe('Add To Cart', () => {
		it('should create a new cart successfully', async () => {
			const itemObj: CartItem = {
				itemId: items.body[0].id as string,
				quantity: 12,
			};
			const cart = await api
				.post('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(itemObj)
				.expect(201)
				.expect('Content-type', /application\/json/);

			expect(cart.body.items[0].itemId + '').toContain(itemObj.itemId);
			expect(cart.body.items[0].quantity).toBe(12);
		});
		it('should update item quantity when item is already in cart', async () => {
			const itemObj: CartItem = {
				itemId: items.body[0].id as string,
				quantity: 3,
			};

			const cart = await api
				.post('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(itemObj)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(cart.body.items[0].itemId + '').toContain(itemObj.itemId);
			expect(cart.body.items[0].quantity).toBe(15);
		});
		it('should be able to add another item to the cart', async () => {
			const itemObj: CartItem = {
				itemId: items.body[1].id as string,
				quantity: 3,
			};

			const cart = await api
				.post('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(itemObj)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(cart.body.items[1].itemId + '').toContain(itemObj.itemId);
			expect(cart.body.items[1].quantity).toBe(3);
		});
		it('should increase item by one if quantity is not provided', async () => {
			const itemObj = {
				itemId: items.body[1].id as string,
			};

			const cart = await api
				.post('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(itemObj)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(cart.body.items[1].itemId + '').toContain(itemObj.itemId);
			expect(cart.body.items[1].quantity).toBe(4);
		});

		it('should throw error if item is not provided', async () => {
			await api
				.post('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(400);
		});
		it('should throw error if item id is not valid', async () => {
			const itemObj: CartItem = {
				itemId: '22322114',
				quantity: 3,
			};

			const cart = await api
				.post('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(itemObj)
				.expect(400);

			expect(cart.text).toContain('Error: Cast to embedded failed for value');
		});
		it('should throw error if user token is not provided', async () => {
			const itemObj: CartItem = {
				itemId: items.body[1].id as string,
				quantity: 3,
			};

			const cart = await api.post('/api/v1/carts').send(itemObj).expect(403);

			expect(cart.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});

	describe('Get cart Items', () => {
		it('should return the correct length of cart items', async () => {
			const cart = await api
				.get('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);
			expect(cart.body).toHaveLength(2);
		});
		it('should return the correct details of cart items', async () => {
			const cart = await api
				.get('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(cart.body[0].id).toBe(items.body[0].id);
			expect(cart.body[0].name).toBe(items.body[0].name);
			expect(cart.body[0].category).toBe(items.body[0].category);
			expect(cart.body[0].imageUrl).toBe(items.body[0].imageUrl);
			expect(cart.body[0].stocked).toBe(items.body[0].stocked);
			expect(cart.body[0].deliveryValue).toBe(items.body[0].deliveryValue);
			expect(cart.body[0].quantity).toBe(15);

			expect(cart.body[1].id).toBe(items.body[1].id);
			expect(cart.body[1].name).toBe(items.body[1].name);
			expect(cart.body[1].category).toBe(items.body[1].category);
			expect(cart.body[1].imageUrl).toBe(items.body[1].imageUrl);
			expect(cart.body[1].stocked).toBe(items.body[1].stocked);
			expect(cart.body[1].deliveryValue).toBe(items.body[1].deliveryValue);
			expect(cart.body[1].quantity).toBe(4);
		});

		it('should throw error if user have no cart', async () => {
			const cart = await api
				.get('/api/v1/carts')
				.set('Authorization', `Bearer ${res.body.token}`)
				.expect(400);

			expect(cart.text).toContain('Error: Cannot read properties of null');
		});

		it('should throw error if user token is not provided', async () => {
			const cart = await api.get('/api/v1/carts').expect(403);

			expect(cart.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});

	describe('Update Cart Item', () => {
		it('should be able to increase cart items quantity', async () => {
			const value = 10;
			const cart = await api
				.put(`/api/v1/carts/${items.body[0].id}/update?value=${value}`)
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(cart.body[0].quantity).toBe(25);
		});
		it('should be able to decrease cart items quantity', async () => {
			const value = -10;
			const cart = await api
				.put(`/api/v1/carts/${items.body[0].id}/update?value=${value}`)
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(cart.body[0].quantity).toBe(15);
		});

		it('should throw error if user token is not provided', async () => {
			const value = 100;
			const cart = await api
				.put(`/api/v1/carts/${items.body[0].id}/update?value=${value}`)
				.expect(403);

			expect(cart.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});

	describe('Remove Cart Item', () => {
		it('should remove item from cart successfully', async () => {
			const cart = await api
				.put(`/api/v1/carts/${items.body[0].id}/remove`)
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(cart.body).toHaveLength(1);
			expect(cart.body[0].id).not.toBe(items.body[0].id);
			expect(cart.body[0].name).not.toBe(items.body[0].name);
			expect(cart.body[0].category).not.toBe(items.body[0].category);
			expect(cart.body[0].imageUrl).not.toBe(items.body[0].imageUrl);
			expect(cart.body[0].deliveryValue).not.toBe(items.body[0].deliveryValue);
			expect(cart.body[0].quantity).not.toBe(15);
		});
		it('should throw error if user token is not provided', async () => {
			const cart = await api
				.put(`/api/v1/carts/${items.body[0].id}/remove`)
				.expect(403);

			expect(cart.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});

	describe('Empty Cart', () => {
		it('should empty user cart successfully', async () => {
			await api
				.delete(`/api/v1/carts`)
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(204);
		});
		it('should throw error if user token is not provided', async () => {
			const cart = await api
				.delete(`/api/v1/carts`)
				.expect(403);

			expect(cart.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});
});

afterAll(async () => {
	await connection.close();
	await mongodb.stop();
});
