// 🐾🔐 NEKO DEFENSE - Login Input DTO 🔐🐾
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

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

  @Field(() => String, {
    nullable: true,
    defaultValue: 'en',
    description: '🌍 User preferred language for i18n (en, es, zh, hi, ar), nyaa~!',
  })
  @IsString()
  @IsOptional()
  language?: string;
}
