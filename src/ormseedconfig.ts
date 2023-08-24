import { cfg } from './ormconfig';

const ormseedconfig = {
  ...cfg,
  migrations: [__dirname + '/seeds/*{.ts,.js}'],
};

export default ormseedconfig;
