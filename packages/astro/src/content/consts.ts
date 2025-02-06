export const PROPAGATED_ASSET_FLAG = 'astroPropagatedAssets';
export const CONTENT_RENDER_FLAG = 'astroRenderContent';
export const CONTENT_FLAG = 'astroContentCollectionEntry';
export const DATA_FLAG = 'astroDataCollectionEntry';
export const CONTENT_IMAGE_FLAG = 'astroContentImageFlag';
export const CONTENT_MODULE_FLAG = 'astroContentModuleFlag';

export const VIRTUAL_MODULE_ID = 'astro:content';
export const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;
export const DATA_STORE_VIRTUAL_ID = 'astro:data-layer-content';
export const RESOLVED_DATA_STORE_VIRTUAL_ID = '\0' + DATA_STORE_VIRTUAL_ID;

// Used by the content layer to create a virtual module that loads the `modules.mjs`, a file created by the content layer
// to map modules that are renderer at runtime
export const MODULES_MJS_ID = 'astro:content-module-imports';
export const MODULES_MJS_VIRTUAL_ID = '\0' + MODULES_MJS_ID;

export const DEFERRED_MODULE = 'astro:content-layer-deferred-module';

// Used by the content layer to create a virtual module that loads the `assets.mjs`
export const ASSET_IMPORTS_VIRTUAL_ID = 'astro:asset-imports';
export const ASSET_IMPORTS_RESOLVED_STUB_ID = '\0' + ASSET_IMPORTS_VIRTUAL_ID;
export const LINKS_PLACEHOLDER = '@@ASTRO-LINKS@@';
export const STYLES_PLACEHOLDER = '@@ASTRO-STYLES@@';
export const IMAGE_IMPORT_PREFIX = '__ASTRO_IMAGE_';

export const CONTENT_FLAGS = [
	CONTENT_FLAG,
	CONTENT_RENDER_FLAG,
	DATA_FLAG,
	PROPAGATED_ASSET_FLAG,
	CONTENT_IMAGE_FLAG,
	CONTENT_MODULE_FLAG,
] as const;

export const CONTENT_TYPES_FILE = 'content.d.ts';
export const DATA_STORE_FILE = 'data-store.json';
export const ASSET_IMPORTS_FILE = 'content-assets.mjs';
export const MODULES_IMPORTS_FILE = 'content-modules.mjs';
export const COLLECTIONS_MANIFEST_FILE = 'collections/collections.json';
export const COLLECTIONS_DIR = 'collections/';

export const CONTENT_LAYER_TYPE = 'content_layer';
