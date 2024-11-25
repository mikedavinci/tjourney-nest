import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('luxalgo_alerts')
export class LuxAlgoAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb')
  @ApiProperty({ description: 'Complete alert data from LuxAlgo' })
  alert_data: any;

  @Column()
  ticker: string;

  @Column()
  tf: string;

  @Column('bigint')
  bartime: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
