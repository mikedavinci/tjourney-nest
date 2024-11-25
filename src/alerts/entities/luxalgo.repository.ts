import { EntityRepository, Repository } from 'typeorm';
import { LuxAlgoAlert } from './luxalgo.entity';

@EntityRepository(LuxAlgoAlert)
export class LuxAlgoRepository extends Repository<LuxAlgoAlert> {}
