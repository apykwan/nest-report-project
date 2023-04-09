import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>

    beforeEach(async () => {
        // Create a fake copy of the users service
        const users: User[] = [];

        fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = { id: Math.floor(Math.random() * 99999), email, password } as User;
                users.push(user);
                return Promise.resolve(user);
            }
        };

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService
                }
            ]
        }).compile();

        service = module.get(AuthService);
    });

    it('Can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signup('test@test.com', '1234');

        expect(user.password).not.toEqual('1234');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('Throw an error if users sings up with email that is in use', async () => {
        // return one user which will resutl in error
        await service.signup('test@test.com', 'asdf');
        await expect(service.signup('test@test.com', '1234'))
            .rejects.toThrow(BadRequestException);
    });

    it('Throws if signin is called with an unused email', async () => {
        await expect(service.signin('asdflkj@asdlfkj.com', 'passdflkj'))
            .rejects.toThrow(NotFoundException);
    });

    it('throws if an invalid password is provided', async () => {
        await service.signup('laskdjf@alskdfj.com', 'password');
        await expect(service.signin('laskdjf@alskdfj.com', 'passdflkj'))
            .rejects.toThrow(BadRequestException);
    });

    it('returns a user if correct password in provided', async () => {
        await service.signup('test@test.com', 'mypassword');
        const user = await service.signin('test@test.com', 'mypassword');

        expect(user).toBeDefined();
    });
});

