import type {
	ToolbarAppEventTarget,
	ToolbarServerHelpers,
} from '../../runtime/client/dev-toolbar/helpers.js';
import type {
	AstroDevToolbar,
	DevToolbarCanvas,
} from '../../runtime/client/dev-toolbar/toolbar.js';
import type { Icon } from '../../runtime/client/dev-toolbar/ui-library/icons.js';
import type {
	DevToolbarBadge,
	DevToolbarButton,
	DevToolbarCard,
	DevToolbarHighlight,
	DevToolbarIcon,
	DevToolbarRadioCheckbox,
	DevToolbarSelect,
	DevToolbarToggle,
	DevToolbarTooltip,
	DevToolbarWindow,
} from '../../runtime/client/dev-toolbar/ui-library/index.js';

declare global {
	interface HTMLElementTagNameMap {
		'astro-dev-toolbar': AstroDevToolbar;
		'astro-dev-toolbar-window': DevToolbarWindow;
		'astro-dev-toolbar-app-canvas': DevToolbarCanvas;
		'astro-dev-toolbar-tooltip': DevToolbarTooltip;
		'astro-dev-toolbar-highlight': DevToolbarHighlight;
		'astro-dev-toolbar-toggle': DevToolbarToggle;
		'astro-dev-toolbar-badge': DevToolbarBadge;
		'astro-dev-toolbar-button': DevToolbarButton;
		'astro-dev-toolbar-icon': DevToolbarIcon;
		'astro-dev-toolbar-card': DevToolbarCard;
		'astro-dev-toolbar-select': DevToolbarSelect;
		'astro-dev-toolbar-radio-checkbox': DevToolbarRadioCheckbox;
	}
}

type DevToolbarAppMeta = {
	id: string;
	name: string;
	icon?: Icon;
};

// The param passed to `addDevToolbarApp` in the integration
export type DevToolbarAppEntry = DevToolbarAppMeta & {
	entrypoint: string;
};

// Public API for the dev toolbar
export type DevToolbarApp = {
	/**
	 * @deprecated The `id`, `name`, and `icon` properties should now be defined when using `addDevToolbarApp`.
	 *
	 * Ex: `addDevToolbarApp({ id: 'my-app', name: 'My App', icon: '🚀', entrypoint: '/path/to/app' })`
	 *
	 * In the future, putting these properties directly on the app object will be removed.
	 */
	id?: string;
	/**
	 * @deprecated The `id`, `name`, and `icon` properties should now be defined when using `addDevToolbarApp`.
	 *
	 * Ex: `addDevToolbarApp({ id: 'my-app', name: 'My App', icon: '🚀', entrypoint: '/path/to/app' })`
	 *
	 * In the future, putting these properties directly on the app object will be removed.
	 */
	name?: string;
	/**
	 * @deprecated The `id`, `name`, and `icon` properties should now be defined when using `addDevToolbarApp`.
	 *
	 * Ex: `addDevToolbarApp({ id: 'my-app', name: 'My App', icon: '🚀', entrypoint: '/path/to/app' })`
	 *
	 * In the future, putting these properties directly on the app object will be removed.
	 */
	icon?: Icon;
	init?(
		canvas: ShadowRoot,
		app: ToolbarAppEventTarget,
		server: ToolbarServerHelpers,
	): void | Promise<void>;
	beforeTogglingOff?(canvas: ShadowRoot): boolean | Promise<boolean>;
};

// An app that has been loaded and as such contain all of its properties
export type ResolvedDevToolbarApp = DevToolbarAppMeta & Omit<DevToolbarApp, 'id' | 'name' | 'icon'>;

export type DevToolbarMetadata = Window &
	typeof globalThis & {
		__astro_dev_toolbar__: {
			root: string;
			version: string;
			latestAstroVersion: string | undefined;
			debugInfo: string;
		};
	};