import { DocMetadata } from '../index';
import { netherFencer } from './Netherfencer';
import { lifebinder } from './Lifebinder';
import { skeleton } from './Skeleton';

export const unitIdBase = 'units/';
export default [
    { _id: `${unitIdBase}${netherFencer.className}`, data: netherFencer },
    { _id: `${unitIdBase}${lifebinder.className}`, data: lifebinder },
    { _id: `${unitIdBase}${skeleton.className}`, data: skeleton },
] as DocMetadata[];
