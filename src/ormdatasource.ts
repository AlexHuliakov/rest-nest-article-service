import { DataSource } from 'typeorm';
import { cfg } from './ormconfig';

export default new DataSource(cfg as any);
