import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LuxAlgoAlert } from './luxalgo.entity';

@Injectable()
export class LuxAlgoRepository extends Repository<LuxAlgoAlert> {
  constructor(private dataSource: DataSource) {
    super(LuxAlgoAlert, dataSource.createEntityManager());
    console.log('LuxAlgoRepository initialized');
  }
}
