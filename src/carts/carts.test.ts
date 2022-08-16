import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, connection } from 'mongoose';
import supertest, { Response } from 'supertest';
import { app } from '../app';
import { Category, Item, Items } from '../items/items.interface';
import { Role, Users } from '../users/users.interface';
import { CartItems } from './carts.interface';

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
		await api
			.post('/api/v1/items')
			.set('Authorization', `Bearer ${res.body.token}`)
			.send(initialItems[0]);
		await api
			.post('/api/v1/items')
			.set('Authorization', `Bearer ${res.body.token}`)
			.send(initialItems[1]);
	} catch (error) {
		console.error(error);
	}
});

describe('Cart', () => {
	describe('Create', () => {
		it('should create a new cart successfully', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const itemObj: CartItems = {
				item: items.body[0].id as unknown as Item,
				quantity: 2,
			};
			const cart = await api
				.post('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(itemObj)
				.expect(201)
				.expect('Content-type', /application\/json/);

			expect(cart.body.items[0].item.id).toContain(itemObj.item);
			expect(cart.body.items[0].quantity).toBe(2);
		});
		it('should update item quantity when items are readded', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const itemObj: CartItems = {
				item: items.body[0].id as unknown as Item,
				quantity: 3,
			};

			const cart = await api
				.post('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(itemObj)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(cart.body.items[0].item.id).toContain(itemObj.item);
			expect(cart.body.items[0].quantity).toBe(5);
		});
		it('should be able to add mulltiple items to the cart', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const itemObj: CartItems = {
				item: items.body[1].id as unknown as Item,
				quantity: 3,
			};

			const cart = await api
				.post('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(itemObj)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(cart.body.items[1].item.id).toContain(itemObj.item);
			expect(cart.body.items[1].quantity).toBe(3);
		});
	});
	describe('Update', () => {
		it('should be able to delete an item in the cart', async () => {
			const items = await api
				.get('/api/v1/items')
				.expect(200)
				.expect('Content-type', /application\/json/);

			const itemObj = {
				item: items.body[0].id as unknown as Item,
			};

			const cart = await api
				.put('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.send(itemObj)
				.expect(200)
				.expect('Content-type', /application\/json/);

			expect(cart.body.items).toHaveLength(1);
		});
		it('should be able to empty user cart', async () => {
			await api
				.delete('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(204);
			const cart = await api
				.get('/api/v1/carts')
				.set('Authorization', `Bearer ${resUser.body.token}`)
				.expect(200)
				.expect('Content-type', /application\/json/);
			
			expect(cart.body.items).toHaveLength(0);
		});
	});
});

afterAll(async () => {
	await connection.close();
	await mongodb.stop();
});
