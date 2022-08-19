import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, connection } from 'mongoose';
import supertest, { Response } from 'supertest';
import { app } from '../app';
import { Role, NewUser } from '../users/users.interface';
import { Category, ItemFields } from './items.interface';

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

beforeAll(async () => {
	try {
		mongodb = await MongoMemoryServer.create();
		const uri = mongodb.getUri();
		await connect(uri);
		await api.post('/api/v1/auth/register').send(initialUsers[0]).expect(201);
		await api.post('/api/v1/auth/register').send(initialUsers[1]).expect(201);

		res = await api.post('/api/v1/auth/login').send(initialUsers[0]);
		resUser = await api.post('/api/v1/auth/login').send(initialUsers[1]);
	} catch (error) {
		console.error(error);
	}
});

describe('Items API', () => {
	describe('Add Item', () => {
		it('should add new item successfully', async () => {
			const item = await api
				.post('/api/v1/items')
				.set('Authorization', `Bearer ${res.body.token}`)
				.send(initialItems[0])
				.expect(201)
				.expect('Content-type', /application\/json/);

			expect(item.body[0].name).toContain(initialItems[0].name);
			expect(item.body[0].imageUrl).toContain(initialItems[0].imageUrl);
			expect(item.body[0].price).toBe(initialItems[0].price);
			expect(item.body[0].category).toBe(initialItems[0].category);
			expect(item.body[0].deliveryValue).toBe(initialItems[0].deliveryValue);
			expect(item.body[0].discount).toBeLessThan(1);
			expect(item.body[0].reviews.rating).toBeLessThanOrEqual(5);
			expect(item.body[0].reviews.numReviews).toBeLessThanOrEqual(15);
			expect(item.body[0].createdAt).toBeTruthy();
			expect(item.body[0].updatedAt).toBeTruthy();
		});

		it('should add another item successfully', async () => {
			const item = await api
				.post('/api/v1/items')
				.set('Authorization', `Bearer ${res.body.token}`)
				.send(initialItems[1])
				.expect(201)
				.expect('Content-type', /application\/json/);

			expect(item.body[1].name).toContain(initialItems[1].name);
			expect(item.body[1].imageUrl).toContain(initialItems[1].imageUrl);
			expect(item.body[1].price).toBe(initialItems[1].price);
			expect(item.body[1].category).toBe(initialItems[1].category);
			expect(item.body[1].deliveryValue).toBe(initialItems[1].deliveryValue);
			expect(item.body[1].discount).toBeLessThanOrEqual(1);
			expect(item.body[1].reviews.rating).toBeLessThanOrEqual(5);
			expect(item.body[1].reviews.numReviews).toBeLessThanOrEqual(15);
			expect(item.body[1].createdAt).toBeTruthy();
			expect(item.body[1].updatedAt).toBeTruthy();
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

		it('should throw error if user token is not provided', async () => {
			const itemObj = {
				name: '9 inches',
				price: 300,
				category: Category.Block,
				imageUrl: 'localhost:3000/6-inches',
				discount: 0.15,
			};
			const item = await api.post('/api/v1/items').send(itemObj).expect(403);

			expect(item.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});

	describe('Get Item', () => {
		it('should return the current length of items', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);
			expect(items.body).toHaveLength(2);
		});

		it('should return the correct items details', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(items.body[0].name).toContain(initialItems[0].name);
			expect(items.body[0].imageUrl).toContain(initialItems[0].imageUrl);
			expect(items.body[0].price).toBe(initialItems[0].price);
			expect(items.body[0].category).toBe(initialItems[0].category);
			expect(items.body[0].deliveryValue).toBe(initialItems[0].deliveryValue);
			expect(items.body[0].discount).toBeLessThanOrEqual(1);
			expect(items.body[0].reviews.rating).toBeLessThanOrEqual(5);
			expect(items.body[0].reviews.numReviews).toBeLessThanOrEqual(15);
			expect(items.body[0].createdAt).toBeTruthy();
			expect(items.body[0].updatedAt).toBeTruthy();

			expect(items.body[1].name).toContain(initialItems[1].name);
			expect(items.body[1].imageUrl).toContain(initialItems[1].imageUrl);
			expect(items.body[1].price).toBe(initialItems[1].price);
			expect(items.body[1].category).toBe(initialItems[1].category);
			expect(items.body[1].deliveryValue).toBe(initialItems[1].deliveryValue);
			expect(items.body[1].discount).toBeLessThanOrEqual(1);
			expect(items.body[1].reviews.rating).toBeLessThanOrEqual(5);
			expect(items.body[1].reviews.numReviews).toBeLessThanOrEqual(15);
			expect(items.body[1].createdAt).toBeTruthy();
			expect(items.body[1].updatedAt).toBeTruthy();
		});
	});

	describe('Update Item', () => {
		it('should be able to update item details', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const updatedItem = await api
				.put(`/api/v1/items/${items.body[0].id}`)
				.set('Authorization', `Bearer ${res.body.token}`)
				.send({
					price: 400,
					name: '4 inches solid',
					category: 'cement',
					imageUrl: 'image.png',
				})
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(updatedItem.body[0].price).toBe(400);
			expect(updatedItem.body[0].name).toBe('4 inches solid');
			expect(updatedItem.body[0].category).toBe('cement');
			expect(updatedItem.body[0].imageUrl).toBe('image.png');
			expect(updatedItem.body[0].createdAt).toBe(items.body[0].createdAt);
			expect(updatedItem.body[0].updatedAt).not.toBe(items.body[0].updatedAt);
		});

		it('should throw error if price is not a valid number', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const updatedItem = await api
				.put(`/api/v1/items/${items.body[0].id}`)
				.set('Authorization', `Bearer ${res.body.token}`)
				.send({
					price: '4k',
					name: '4 inches solid',
					category: 'cement',
					imageUrl: 'image.png',
				})
				.expect(400);

			expect(updatedItem.text).toContain('Incorrect or missing item price ');
		});

		it('should throw error if user role is not admin', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const updatedItem = await api
				.put(`/api/v1/items/${items.body[0].id}`)
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(403);

			expect(updatedItem.text).toContain(
				'Forbidden Exception. Only Admin can acces this route'
			);
		});

		it('should throw error if user token is not provided', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const updatedItem = await api
				.put(`/api/v1/items/${items.body[0].id}`)
				.expect(403);

			expect(updatedItem.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});

	describe('Toggle Item Stock', () => {
		it('should allow item to be unstocked', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(items.body[0].stocked).toBe(true);

			const updatedItem = await api
				.put(`/api/v1/items/${items.body[0].id}/stock`)
				.set('Authorization', `Bearer ${res.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(updatedItem.body[0].stocked).toBe(false);
		});

		it('should allow item to be restocked', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(items.body[0].stocked).toBe(false);

			const updatedItem = await api
				.put(`/api/v1/items/${items.body[0].id}/stock`)
				.set('Authorization', `Bearer ${res.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(updatedItem.body[0].stocked).toBe(true);
		});

		it('should throw error if user role is not admin', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const updatedItem = await api
				.put(`/api/v1/items/${items.body[0].id}/stock`)
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(403);

			expect(updatedItem.text).toContain(
				'Forbidden Exception. Only Admin can acces this route'
			);
		});

		it('should throw error if user token is not provided', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const updatedItem = await api
				.put(`/api/v1/items/${items.body[0].id}/stock`)
				.expect(403);

			expect(updatedItem.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});

	describe('Delete Item', () => {
		it('should delete item successfully', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			await api
				.delete(`/api/v1/items/${items.body[0].id}`)
				.set('Authorization', `Bearer ${res.body.token}`)
				.expect(204);

			const deteltedItem = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(deteltedItem.body).toHaveLength(1);

			expect(deteltedItem.body[0].name).not.toContain(items.body[0].name);
			expect(deteltedItem.body[0].imageUrl).not.toContain(items.body[0].imageUrl);
			expect(deteltedItem.body[0].price).not.toBe(items.body[0].price);
			expect(deteltedItem.body[0].category).not.toBe(items.body[0].category);
			expect(deteltedItem.body[0].deliveryValue).not.toBe(
				items.body[0].deliveryValue
			);
			expect(deteltedItem.body[0].discount).not.toBe(items.body[0].discount);
			expect(deteltedItem.body[0].reviews.rating).not.toBe(
				items.body[0].reviews.rating
			);
			expect(deteltedItem.body[0].reviews.numReviews).not.toBe(
				items.body[0].reviews.numReviews
			);
			expect(deteltedItem.body[0].createdAt).not.toBe(items.body[0].createdAt);
			expect(deteltedItem.body[0].updatedAt).not.toBe(items.body[0].updatedAt);
		});

		it('should throw error if user role is not admin', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const deletedItem = await api
				.delete(`/api/v1/items/${items.body[0].id}`)
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(403);

			expect(deletedItem.text).toContain(
				'Forbidden Exception. Only Admin can acces this route'
			);
		});

		it('should throw error if user token is not provided', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const updatedItem = await api
				.delete(`/api/v1/items/${items.body[0].id}`)
				.expect(403);

			expect(updatedItem.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});
});

afterAll(async () => {
	await connection.close();
	await mongodb.stop();
});
