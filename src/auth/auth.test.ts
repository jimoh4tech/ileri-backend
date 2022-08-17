import { MongoMemoryServer } from 'mongodb-memory-server';
import { connection, connect } from 'mongoose';
import supertest from 'supertest';
import { app } from '../app';
import { NewUser, Role } from '../users/users.interface';

const api = supertest(app);

let mongodb: MongoMemoryServer;

const initialUsers: NewUser[] = [
	{
		name: 'Abu Abdillah',
		password: 'password',
		phone: '0099033223432',
		email: 'test1@gmail.com',
		role: Role.Admin,
	},
	{
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
	} catch (error) {
		console.error(error);
	}
});

describe('Auth API', () => {
	describe('Resgister', () => {
		it('should register user successfully', async () => {
			const user = await api
				.post('/api/v1/auth/register')
				.send(initialUsers[0])
				.expect(201)
				.expect('Content-Type', /application\/json/);

			expect(user.body.name).toContain(initialUsers[0].name);
			expect(user.body.phone).toContain(initialUsers[0].phone);
			expect(user.body.role).toContain(initialUsers[0].role);
			expect(user.body.createdAt).toBeTruthy();
			expect(user.body.token).toBeTruthy();
		});

		it('should throw error if name is less than 5 characters', async () => {
			const userObj: NewUser = {
				name: 'john',
				phone: '0780555225715',
				password: '123456',
				email: 'test2@gmail.com',
				role: Role.User,
			};

			const user = await api
				.post('/api/v1/auth/register')
				.send(userObj)
				.expect(400);

			expect(user.text).toContain('Error: Name must be at least 5 characters');
		});

		it('should throw error if pasword is less than 6 characters', async () => {
			const userObj: NewUser = {
				name: 'johnny',
				phone: '078055522571',
				password: '12345',
				email: 'test4@gmail.com',
				role: Role.User,
			};

			const user = await api
				.post('/api/v1/auth/register')
				.send(userObj)
				.expect(400);

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

			const user = await api
				.post('/api/v1/auth/register')
				.send(userObj)
				.expect(400);

			expect(user.text).toContain(
				'Error: Incorrect or missing phone undefined'
			);
		});

		it('should throw error if name is missing', async () => {
			const userObj = {
				phone: '05098078855',
				id: 'e122',
				password: '123456',
				role: Role.User,
			};

			const user = await api
				.post('/api/v1/auth/register')
				.send(userObj)
				.expect(400);

			expect(user.text).toContain('Error: Incorrect or missing name undefined');
		});
		it('should throw error if phone already taken', async () => {
			const user = await api
				.post('/api/v1/auth/register')
				.send(initialUsers[0])
				.expect(403);

			expect(user.text).toContain(
				'Email must be unique. User already registered'
			);
		});
		it('should register another user successfully', async () => {
			const user = await api
				.post('/api/v1/auth/register')
				.send(initialUsers[1])
				.expect(201)
				.expect('Content-Type', /application\/json/);

			expect(user.body.name).toContain(initialUsers[1].name);
			expect(user.body.phone).toContain(initialUsers[1].phone);
			expect(user.body.role).toContain(initialUsers[1].role);
			expect(user.body.createdAt).toBeTruthy();
			expect(user.body.token).toBeTruthy();
		});
	});

	describe('Login', () => {
		it('should login successfully with email address', async () => {
			const loginObj = {
				password: 'password',
				email: 'test1@gmail.com',
			};
			const user = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			expect(user.body.name).toContain(initialUsers[0].name);
			expect(user.body.phone).toContain(initialUsers[0].phone);
			expect(user.body.role).toContain(initialUsers[0].role);
			expect(user.body.createdAt).toBeTruthy();
			expect(user.body.token).toBeTruthy();
		});
		it('should throw error if password is not correct', async () => {
			const loginObj = {
				password: 'password1',
				email: 'test1@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(401);

			expect(login.text).toContain('Invalid username or password');
		});
		it('should throw error if email address is not correct', async () => {
			const loginObj = {
				password: 'password',
				email: 'test9@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(401);

			expect(login.text).toContain('Invalid username or password');
		});
		it('should throw error if email address is not valid', async () => {
			const loginObj = {
				password: 'password',
				email: 'test9',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(400);

			expect(login.text).toContain('Missing or invalid email test9');
		});

		it('should throw error if pasword is less than 6 characters', async () => {
			const loginObj = {
				password: 'pass',
				email: 'test1@gmail.com',
			};

			const user = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(400);

			expect(user.text).toContain(
				'Error: Password must be at least 6 characters'
			);
		});
	});

	describe('Change Password', () => {
		it('should change password successfully', async () => {
			const loginObj = {
				password: 'password',
				email: 'test1@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			const userAfterChange = await api
				.put(`/api/v1/auth/${login.body.id}`)
				.set('Authorization', `bearer ${login.body.token}`)
				.send({ currentPassword: 'password', newPassword: '123456' })
				.expect(200)
				.expect('Content-Type', /application\/json/);

			expect(userAfterChange.body.name).toContain(initialUsers[0].name);
			expect(userAfterChange.body.phone).toContain(initialUsers[0].phone);
			expect(userAfterChange.body.role).toContain(initialUsers[0].role);
			expect(userAfterChange.body.createdAt).toBeTruthy();
			expect(userAfterChange.body.token).toBeTruthy();
		});

		it('should throw error when using old password', async () => {
			const loginObj = {
				password: 'password1',
				email: 'test1@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(401);

			expect(login.text).toContain('Invalid username or password');
		});

		it('should throw error if password does not match', async () => {
			const loginObj = {
				password: '123456',
				email: 'test1@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			const userAfterChange = await api
				.put(`/api/v1/auth/${login.body.id}`)
				.set('Authorization', `bearer ${login.body.token}`)
				.send({ currentPassword: 'password', newPassword: '123456' })
				.expect(400);

			expect(userAfterChange.text).toContain(
				'Current password does not correspond'
			);
    });
    
    it('should throw error if user token is not provided', async () => {
			const loginObj = {
				password: '123456',
				email: 'test1@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			const userAfterChange = await api
				.put(`/api/v1/auth/${login.body.id}`)
				.send({ currentPassword: 'password', newPassword: '123456' })
				.expect(403);

			expect(userAfterChange.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});
});

afterAll(async () => {
	await connection.close();
	await mongodb.stop();
});
