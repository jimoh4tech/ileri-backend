import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, connection } from 'mongoose';
import supertest, { Response } from 'supertest';
import { app } from '../app';
import { Users, Role } from '../users/users.interface';
import { Items, Category } from './items.interface';

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

const initialItems: Items = [
	{
		name: '6 inches with hole',
		price: 200,
		category: Category.Block,
		imageUrl: 'localhost:3000/6-inches-no',
		discount: 0.1,
		id: '62b70e9f30c172b17710bf49',
	},
	{
		name: '6 inches without hole',
		price: 300,
		category: Category.Block,
		imageUrl: 'localhost:3000/6-inches',
		discount: 0.15,
		id: '62b7f7e4864ee754064d8d23',
	},
];

const loginDetails = { password: 'password', phone: '0099033223432' };
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
		resUser = await api.post('/api/v1/auth').send(initialUsers[1]);
	} catch (error) {
		console.error(error);
	}
});

describe('Items', () => {
	describe('Add', () => {
		it('should add new item successfully', async () => {
			const item = await api
				.post('/api/v1/items')
				.set('Authorization', `Bearer ${res.body.token}`)
				.send(initialItems[0])
				.expect(201)
				.expect('Content-type', /application\/json/);

			expect(item.body.name).toContain(initialItems[0].name);
			expect(item.body.imageUrl).toContain(initialItems[0].imageUrl);
			expect(item.body.price).toBe(initialItems[0].price);
			expect(item.body.discount).toBe(initialItems[0].discount);
			expect(item.body.category).toBe(initialItems[0].category);
			expect(item.body.createdAt).toBeTruthy();
			expect(item.body.updatedAt).toBeTruthy();
		});

		it('should throw error if user tries to add item', async () => {
			const item = await api
				.post('/api/v1/items')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(initialItems[1])
				.expect(403);

			expect(item.text).toContain(
				'Forbidden Exception. Only Admin can acces this route'
			);
		});

		it('should throw error if item name already exist', async () => {
			const item = await api
				.post('/api/v1/items')
				.set('Authorization', `Bearer ${res.body.token}`)
				.send(initialItems[0])
				.expect(403);

			expect(item.text).toContain(
				'Item name already existed. Items must have unique name'
			);
		});

		it('should throw error if item name is missing', async () => {
			const itemObj = {
				price: 300,
				category: Category.Block,
				imageUrl: 'localhost:3000/6-inches',
				discount: 0.15,
			};
			const item = await api
				.post('/api/v1/items')
				.set('Authorization', `Bearer ${res.body.token}`)
				.send(itemObj)
				.expect(400);

			expect(item.text).toContain('Incorrect or missing item name');
		});
	});

	describe('Update', () => {
		it('should get the correct item length', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(items.body).toHaveLength(1);
		});

		it('should be able to update item price and discount', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const updatedItem = await api
				.put(`/api/v1/items/${items.body[0].id}`)
				.set('Authorization', `Bearer ${res.body.token}`)
				.send({ price: 300, discount: 1.2 })
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(updatedItem.body.price).toBe(300);
			expect(updatedItem.body.discount).toBe(1.2);
			expect(updatedItem.body.createdAt).toBe(items.body[0].createdAt);
			expect(updatedItem.body.updatedAt).not.toBe(items.body[0].updatedAt);
		});

		it('should throw error if price or discount or not a valid number', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const updatedItem = await api
				.put(`/api/v1/items/${items.body[0].id}`)
				.set('Authorization', `Bearer ${res.body.token}`)
				.send({ price: '4th4', discount: 1.2 })
				.expect(400);

      expect(updatedItem.text).toContain('Incorrect or missing item price NaN');
		});

		it('should be able to delete user', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			await api
				.delete(`/api/v1/items/${items.body[0].id}`)
				.set('Authorization', `Bearer ${res.body.token}`)
				.expect(204);
		});
	});
});

afterAll(async () => {
	await connection.close();
	await mongodb.stop();
});
