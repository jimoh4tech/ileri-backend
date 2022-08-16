import { MongoMemoryServer } from 'mongodb-memory-server';
import { connection, connect } from 'mongoose';
import supertest from 'supertest';
import { app } from '../app';
import { Role, User, Users } from './users.interface';

const api = supertest(app);

let mongodb: MongoMemoryServer;

const initialUsers: Users = [
	{
		id: 'abc1',
		name: 'Abu Abdillah',
		password: 'password',
		phone: '0099033223432',
		email: 'test1@gmail.com',
		role: Role.Admin,
	},
	{
		id: 'abc2',
		name: 'Abu Ibrahim',
		password: 'password',
		phone: '009903787632',
		email: 'test2@gmail.com',
		role: Role.User,
	},
];

beforeAll(async () => {
	try {
		mongodb = await MongoMemoryServer.create();
		const uri = mongodb.getUri();
		await connect(uri);
		await api.post('/api/v1/users').send(initialUsers[0]);
	} catch (error) {
		console.error(error);
	}
});

describe('User API', () => {
	describe('Resgister', () => {
		it('should register user successfully', async () => {
			const user = await api
				.post('/api/v1/users')
				.send(initialUsers[1])
				.expect(201)
				.expect('Content-Type', /application\/json/);

			expect(user.body.name).toContain(initialUsers[1].name);
			expect(user.body.phone).toContain(initialUsers[1].phone);
			expect(user.body.role).toContain(initialUsers[1].role);
			expect(user.body.createdAt).toBeTruthy();
		});

		it('should throw error if name is less than 5 characters', async () => {
			const userObj: User = {
				name: 'john',
				phone: '0780555225715',
				id: 'e122',
				password: '123456',
				email: 'test2@gmail.com',
				role: Role.User,
			};

			const user = await api.post('/api/v1/users').send(userObj).expect(400);

			expect(user.text).toContain('Error: Name must be at least 5 characters');
		});

		it('should throw error if pasword is less than 6 characters', async () => {
			const userObj: User = {
				name: 'johnny',
				phone: '078055522571',
				id: 'e122',
				password: '12345',
				email: 'test4@gmail.com',
				role: Role.User,
			};

			const user = await api.post('/api/v1/users').send(userObj).expect(400);

			expect(user.text).toContain(
				'Error: Password must be at least 6 characters'
			);
		});

		it('should throw error if phone is missing', async () => {
			const userObj = {
				name: 'johnny',
				id: 'e122',
				password: '123456',
				role: Role.User,
			};

			const user = await api.post('/api/v1/users').send(userObj).expect(400);

			expect(user.text).toContain(
				'Error: Incorrect or missing phone undefined'
			);
		});
		it('shoud throw error if phone already taken', async () => {
			const userObj: User = {
				id: 'abc1',
				name: 'Abu Ibrahim',
				password: 'password',
				phone: '009903787632',
				email: 'test5@gmail.com',
				role: Role.User,
			};
			const user = await api.post('/api/v1/users').send(userObj).expect(403);

			expect(user.text).toContain(
				'Phone number must be unique. User already registered'
			);
		});
	});

	describe('Login', () => {
		it('should login successfully with phone number', async () => {
			const loginObj = {
				password: 'password',
				phone: '0099033223432',
			};
			const login = await api
				.post('/api/v1/auth')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			expect(login.body.token).toBeTruthy();
			expect(login.body.id).toBeTruthy();
		});
		it('should login successfully with email address', async () => {
			const loginObj = {
				password: 'password',
				email: 'test1@gmail.com'
			};
			const login = await api
				.post('/api/v1/auth')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			expect(login.body.token).toBeTruthy();
			expect(login.body.id).toBeTruthy();
		});
		it('should throw error if login credentials are incorrect', async () => {
			const loginObj = {
				password: 'password1',
				phone: '0099033223432',
			};
			const login = await api.post('/api/v1/auth').send(loginObj).expect(401);

			expect(login.text).toContain('Invalid username or password');
		});
	});
});

afterAll(async () => {
	await connection.close();
	await mongodb.stop();
});
