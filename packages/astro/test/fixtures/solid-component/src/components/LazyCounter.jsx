// Based on reproduction from https://github.com/withastro/astro/issues/6912

import { lazy } from 'solid-js';

export const LazyCounter = lazy(() => import('./Counter'));
