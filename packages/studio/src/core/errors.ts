import { cyan, red } from 'kleur/colors';

export const MISSING_SESSION_ID_CI_ERROR = `${red('▶ ASTRO_STUDIO_APP_TOKEN required')}

	To authenticate with Astro Studio add the token to your CI's environment variables.\n`;

export const MISSING_SESSION_ID_ERROR = `${red('▶ Login required!')}

  To authenticate with Astro Studio, run
  ${cyan('astro login')}\n`;

export const MISSING_PROJECT_ID_ERROR = `${red('▶ Directory not linked.')}

  To link this directory to an Astro Studio project, run
  ${cyan('astro link')}\n`;
