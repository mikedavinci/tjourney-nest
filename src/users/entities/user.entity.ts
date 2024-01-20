import { Field, ObjectType, GraphQLISODateTime, ID } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { v4 as uuidv4 } from 'uuid';

@ObjectType()
@Entity()
export class User {
  // Field of type ID is required for GraphQL
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  displayName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  password: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Column({ nullable: true })
  emailVerified: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  verificationCode: string;

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
