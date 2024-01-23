import { Field, ObjectType, ID } from '@nestjs/graphql';
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
  avatar: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  password: string;

  @Field()
  @Column({ default: false })
  emailVerified: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  token: string;

  // @Field({ nullable: true })
  // @Column({ nullable: true })
  // tokenExpiry: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  resetToken: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  resetTokenExpiry: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedDate: Date;
}
