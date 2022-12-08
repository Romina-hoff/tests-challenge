import { InMemoryUsersRepository } from "../../modules/users/repositories/in-memory/InMemoryUsersRepository";  
import { IUsersRepository } from "../../modules/users/repositories/IUsersRepository";
import { CreateUserError } from "../../modules/users/useCases/createUser/CreateUserError";
import { CreateUserUseCase } from "../../modules/users/useCases/createUser/CreateUserUseCase";
import {expect, jest, test} from '@jest/globals';
/*global spyOn*/
/*global callThrough*/

let inMemoryUsersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase

describe('Create User Use Case', () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
      });
      it('should be able to create a new user', async () => {
        const usersRepositoryCreateUser = jest.spyOn(
          inMemoryUsersRepository,
          'create',
        )//.callThrough();
    
        const userData = {
          name: 'meu_name',
          email: 'meu_email@mail.com',
        };
    
        const user = await createUserUseCase.execute({
          ...userData,
          password: '123456',
        });
    
        expect(usersRepositoryCreateUser).toHaveBeenCalledWith(
          expect.objectContaining({
            name: userData.name,
            email: userData.email,
          }),
        );
        expect(user).toHaveProperty('id');
      });
    
      it('should not be able to create a user with duplicate email', async () => {
        const usersRepositoryFindByEmail = jest.spyOn(
          inMemoryUsersRepository,
          'findByEmail',
        )
    
        const user_meu_email = 'meu2_email@mail.com';
    
        await createUserUseCase.execute({
          name: 'meu2_name',
          email: user_meu_email,
          password: '123456',
        });
    
        await expect(
          createUserUseCase.execute({
            name: 'meu_name',
            email: user_meu_email,
            password: '123456',
          }),
        ).rejects.toBeInstanceOf(CreateUserError);
        expect(usersRepositoryFindByEmail).toHaveBeenNthCalledWith(2, user_meu_email);
      });
    });