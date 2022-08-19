import { MongoMemoryServer } from 'mongodb-memory-server';
import { connection, connect } from 'mongoose';
import supertest from 'supertest';
import { app } from '../app';
import { NewUser, Role } from './users.interface';

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
		await api.post('/api/v1/auth/register').send(initialUsers[0]).expect(201);
		await api.post('/api/v1/auth/register').send(initialUsers[1]).expect(201);
	} catch (error) {
		console.error(error);
	}
});

describe('User API', () => {
	describe('Get Users', () => {
		it('should get all registered users successfully', async () => {
			const loginObj = {
				password: 'password',
				email: 'test1@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);
			const users = await api
				.get('/api/v1/users')
				.set('Authorization', `bearer ${login.body.token}`)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			expect(users.body).toHaveLength(2);
		});

		it('should keep correct details of registered users', async () => {
			const loginObj = {
				password: 'password',
				email: 'test1@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);
			const users = await api
				.get('/api/v1/users')
				.set('Authorization', `bearer ${login.body.token}`)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			expect(users.body[0].name).toContain(initialUsers[0].name);
			expect(users.body[0].phone).toContain(initialUsers[0].phone);
			expect(users.body[0].email).toContain(initialUsers[0].email);
			expect(users.body[0].role).toContain(initialUsers[0].role);

			expect(users.body[1].name).toContain(initialUsers[1].name);
			expect(users.body[1].phone).toContain(initialUsers[1].phone);
			expect(users.body[1].email).toContain(initialUsers[1].email);
			expect(users.body[1].role).toContain(initialUsers[1].role);
		});

		it('should throw error if regular users want to get user details', async () => {
			const loginObj = {
				password: 'password',
				email: 'test2@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);
			const users = await api
				.get('/api/v1/users')
				.set('Authorization', `bearer ${login.body.token}`)
				.expect(403);

			expect(users.text).toContain(
				'Forbidden Exception. Only Admin can acces this route'
			);
		});
		it('should throw error if user token is not provided', async () => {
			const users = await api.get('/api/v1/users').expect(403);

			expect(users.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});

	describe('User: Update details', () => {
		it('should update details successfully', async () => {
			const userObj = { name: 'Abdulfattah', phone: '0805566485896' };

			const loginObj = {
				password: 'password',
				email: 'test2@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			const updatedUser = await api
				.put(`/api/v1/users/${login.body.id}/user`)
				.set('Authorization', `bearer ${login.body.token}`)
				.send(userObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			expect(updatedUser.body.name).toBe(userObj.name);
			expect(updatedUser.body.phone).toBe(userObj.phone);
		});

		it('should throw error if name is less than 5 characters', async () => {
			const userObj = { name: 'Abd', phone: '0805566485896' };

			const loginObj = {
				password: 'password',
				email: 'test2@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			const updatedUser = await api
				.put(`/api/v1/users/${login.body.id}/user`)
				.set('Authorization', `bearer ${login.body.token}`)
				.send(userObj)
				.expect(400);

			expect(updatedUser.text).toContain('Name must be at least 5 characters');
		});

		it('should throw error if phone is less than 10 characters', async () => {
			const userObj = { name: 'AbdulRazaq', phone: '080556554' };

			const loginObj = {
				password: 'password',
				email: 'test2@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			const updatedUser = await api
				.put(`/api/v1/users/${login.body.id}/user`)
				.set('Authorization', `bearer ${login.body.token}`)
				.send(userObj)
				.expect(400);

			expect(updatedUser.text).toContain(
				'Phone number must be at least 10 characters'
			);
		});
		it('should throw error if user token is not provided', async () => {
			const userObj = { name: 'AbdulRazaq', phone: '0805566485896' };
			const loginObj = {
				password: 'password',
				email: 'test2@gmail.com',
			};
			const login = await api
				.post('/api/v1/auth/login')
				.send(loginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);
			const users = await api
				.put(`/api/v1/users/${login.body.id}`)
				.send(userObj)
				.expect(403);

			expect(users.text).toContain(
				'Forbidden Exception. Token must be provided'
			);
		});
	});

	describe('Admin: Update details', () => {
		it('should update user priviledge to ADMIN status', async () => {
			const userObj = {
				name: 'Abdulfattah',
				phone: '0805566485896',
				role: 'admin',
			};

			const userLoginObj = {
				password: 'password',
				email: 'test2@gmail.com',
			};
			const userLogin = await api
				.post('/api/v1/auth/login')
				.send(userLoginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			const updatedUser = await api
				.put(`/api/v1/users/${userLogin.body.id}`)
				.set('Authorization', `bearer ${userLogin.body.token}`)
				.send(userObj)
				.expect(403);

			expect(updatedUser.text).toBe(
				'Forbidden Exception. Only Admin can acces this route'
			);
		});

		it('should throw error if the user is not admin', async () => {
			const userObj = {
				name: 'Abdulfattah',
				phone: '0805566485896',
				role: 'admin',
			};

			const userLoginObj = {
				password: 'password',
				email: 'test2@gmail.com',
			};
			const userLogin = await api
				.post('/api/v1/auth/login')
				.send(userLoginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			const adminLoginObj = {
				password: 'password',
				email: 'test1@gmail.com',
			};
			const adminLogin = await api
				.post('/api/v1/auth/login')
				.send(adminLoginObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			const updatedUser = await api
				.put(`/api/v1/users/${userLogin.body.id}`)
				.set('Authorization', `bearer ${adminLogin.body.token}`)
				.send(userObj)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			expect(updatedUser.body).toHaveLength(2);
			expect(updatedUser.body[1].role).toBe(userObj.role);
			expect(updatedUser.body[1].name).toBe(userObj.name);
			expect(updatedUser.body[1].phone).toBe(userObj.phone);
		});
	});
});

afterAll(async () => {
	await connection.close();
	await mongodb.stop();
});
