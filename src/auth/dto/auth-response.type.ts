// 🐾🔐 NEKO DEFENSE - Auth Response Type 🔐🐾
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => String)
  username: string;

  @Field(() => String)
  role: string;

  @Field(() => String, {
    nullable: true,
    description: '🌍 User preferred language (en, es, zh, hi, ar), nyaa~!',
  })
  language?: string;
}

@ObjectType()
export class AuthResponse {
  @Field(() => String, { description: 'JWT access token' })
  access_token: string;

  @Field(() => UserType, { description: 'User information' })
  user: UserType;
}
