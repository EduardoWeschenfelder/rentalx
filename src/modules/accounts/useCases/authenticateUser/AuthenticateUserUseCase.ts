import { compare } from "bcryptjs"
import { sign } from "jsonwebtoken"
import { inject, injectable } from 'tsyringe';
import { Subject } from "typeorm/persistence/Subject";
import { AppError } from "../../../../errors/appError";


import { IUsersRepository } from '../../repositories/IUsersRepository';

interface IRequest {
  email: string;
  password: string
}

interface IResponse {
  user: {
    name: string;
    email: string;
  }
  token: string;
}

@injectable()
class AuthenticateUserUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) { }
  async execute({ email, password }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findByEmail(email)
    if (!user) {
      throw new AppError("Email or password incorrect!")
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError("Email or password incorrect!")
    }

    const token = sign({}, "fdb758aa93edca6644d43d92805b1567", { subject: user.id, expiresIn: "1d" })

    const tokenReturn: IResponse = {
      token,
      user: {
        name: user.name,
        email: user.email
      }
    }
    return tokenReturn;
  }
}

export { AuthenticateUserUseCase }