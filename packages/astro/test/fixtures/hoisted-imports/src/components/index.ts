import A_aliased from './A.astro';
import { default as C_aliased } from './CWrapper.astro';
import D from './D.astro';
import E_aliased from './E.astro';

export { A_aliased as A, C_aliased as C_aliased };
export { default as B2 } from './B.astro';
export const D_aliased = D;
export default E_aliased;

export { default as LargeScript } from './LargeScript.astro';
