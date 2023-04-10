import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt as _script } from 'crypto';
import { promisify } from 'util';

import { User } from './user.entity';

const scrypt = promisify(_script);
@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>) {}

    create(email: string, password: string) {
        const user = this.repo.create({ email, password });

        return this.repo.save(user);
    }

    findAll() {
        return this.repo.find();
    }
    
    findOne(id: number) {
        if(!id) return null;
        return this.repo.findOneBy({ id });
    }

    find(email: string) {
        return this.repo.find({ where: { email } });
    }

    async update(id: number, attrs: Partial<User>) {
        const user = await this.findOne(id);
        if (!user) throw new NotFoundException('user not found');

        if(attrs.password) {
            // Generate a salt
            const salt = randomBytes(8).toString('hex');

            // Hash the salt and password together
            const hash = await scrypt(attrs.password, salt, 32) as Buffer;

            // Join the hashed result and the salt together
            attrs.password = `${salt}.${hash.toString('hex')}`;
        }

        Object.assign(user, attrs);
        return this.repo.save(user);
    }

    async remove(id: number) {
        const user = await this.findOne(id);
        if (!user) throw new NotFoundException('user not found');

        return this.repo.remove(user);
    }
}
