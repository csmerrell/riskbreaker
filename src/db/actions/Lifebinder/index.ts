import { DocMetadata } from '@/db';
import { offering } from './Offering';
import { basicAttack } from './BasicAttack';

export default [
    { _id: offering.dbPath, data: offering },
    { _id: basicAttack.dbPath, data: basicAttack },
] as DocMetadata[];
