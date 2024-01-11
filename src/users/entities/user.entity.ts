import { Field, ObjectType, GraphQLISODateTime, ID } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryColumn()
  user_id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column()
  password: string;

  @Field(() => GraphQLISODateTime)
  emailVerified: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  token: string;
}
