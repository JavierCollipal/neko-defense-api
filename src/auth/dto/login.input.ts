// 🐾🔐 NEKO DEFENSE - Login Input DTO 🔐🐾
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field(() => String, { description: 'Username for authentication' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @Field(() => String, { description: 'Password for authentication' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
