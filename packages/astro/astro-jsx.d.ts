/// <reference lib="dom" />
/**
 * Adapted from babel-plugin-react-html-attrs's TypeScript definition from DefinitelyTyped.
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/babel-plugin-react-html-attrs/index.d.ts
 *
 * and
 *
 * Adapted from React’s TypeScript definition from DefinitelyTyped.
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react/index.d.ts
 */
declare namespace astroHTML.JSX {
	export type Child = Node | Node[] | string | number | boolean | null | undefined | unknown;
	export type Children = Child | Child[];

	interface ElementChildrenAttribute {
		children: {};
	}

	interface IntrinsicAttributes extends AstroComponentDirectives, AstroBuiltinAttributes {
		slot?: string | undefined | null;
		children?: Children;
	}

	// biome-ignore format: bug
	type AstroComponentDirectives = import('./dist/types/public/elements.js').AstroComponentDirectives;
	type AstroBuiltinAttributes = import('./dist/types/public/elements.js').AstroBuiltinAttributes;
	// biome-ignore format: bug
	type AstroDefineVarsAttribute = import('./dist/types/public/elements.js').AstroDefineVarsAttribute;
	type AstroScriptAttributes = import('./dist/types/public/elements.js').AstroScriptAttributes &
		AstroDefineVarsAttribute;
	type AstroStyleAttributes = import('./dist/types/public/elements.js').AstroStyleAttributes &
		AstroDefineVarsAttribute;
	type AstroSlotAttributes = import('./dist/types/public/elements.js').AstroSlotAttributes;

	// This is an unfortunate use of `any`, but unfortunately we can't make a type that works for every framework
	// without importing every single framework's types (which comes with its own set of problems).
	// Using any isn't that bad here however as in Astro files the return type of a component isn't relevant in most cases
	type Element = HTMLElement | any;

	interface DOMAttributes {
		children?: Children;

		// Clipboard Events
		oncopy?: string | undefined | null;
		oncut?: string | undefined | null;
		onpaste?: string | undefined | null;

		// Composition Events
		oncompositionend?: string | undefined | null;
		oncompositionstart?: string | undefined | null;
		oncompositionupdate?: string | undefined | null;

		// Focus Events
		onfocus?: string | undefined | null;
		onfocusin?: string | undefined | null;
		onfocusout?: string | undefined | null;
		onblur?: string | undefined | null;

		// Form Events
		onchange?: string | undefined | null;
		oninput?: string | undefined | null;
		onreset?: string | undefined | null;
		onsubmit?: string | undefined | null;
		oninvalid?: string | undefined | null;
		onbeforeinput?: string | undefined | null;

		// Image Events
		onload?: string | undefined | null;
		onerror?: string | undefined | null; // also a Media Event

		// Detail Events
		ontoggle?: string | undefined | null;

		// Keyboard Events
		onkeydown?: string | undefined | null;
		onkeypress?: string | undefined | null;
		onkeyup?: string | undefined | null;

		// Media Events
		onabort?: string | undefined | null;
		oncanplay?: string | undefined | null;
		oncanplaythrough?: string | undefined | null;
		oncuechange?: string | undefined | null;
		ondurationchange?: string | undefined | null;
		onemptied?: string | undefined | null;
		onencrypted?: string | undefined | null;
		onended?: string | undefined | null;
		onloadeddata?: string | undefined | null;
		onloadedmetadata?: string | undefined | null;
		onloadstart?: string | undefined | null;
		onpause?: string | undefined | null;
		onplay?: string | undefined | null;
		onplaying?: string | undefined | null;
		onprogress?: string | undefined | null;
		onratechange?: string | undefined | null;
		onseeked?: string | undefined | null;
		onseeking?: string | undefined | null;
		onstalled?: string | undefined | null;
		onsuspend?: string | undefined | null;
		ontimeupdate?: string | undefined | null;
		onvolumechange?: string | undefined | null;
		onwaiting?: string | undefined | null;

		// MouseEvents
		onauxclick?: string | undefined | null;
		onclick?: string | undefined | null;
		oncontextmenu?: string | undefined | null;
		ondblclick?: string | undefined | null;
		ondrag?: string | undefined | null;
		ondragend?: string | undefined | null;
		ondragenter?: string | undefined | null;
		ondragexit?: string | undefined | null;
		ondragleave?: string | undefined | null;
		ondragover?: string | undefined | null;
		ondragstart?: string | undefined | null;
		ondrop?: string | undefined | null;
		onmousedown?: string | undefined | null;
		onmouseenter?: string | undefined | null;
		onmouseleave?: string | undefined | null;
		onmousemove?: string | undefined | null;
		onmouseout?: string | undefined | null;
		onmouseover?: string | undefined | null;
		onmouseup?: string | undefined | null;

		// Selection Events
		onselect?: string | undefined | null;
		onselectionchange?: string | undefined | null;
		onselectstart?: string | undefined | null;

		// Touch Events
		ontouchcancel?: string | undefined | null;
		ontouchend?: string | undefined | null;
		ontouchmove?: string | undefined | null;
		ontouchstart?: string | undefined | null;

		// Pointer Events
		ongotpointercapture?: string | undefined | null;
		onpointercancel?: string | undefined | null;
		onpointerdown?: string | undefined | null;
		onpointerenter?: string | undefined | null;
		onpointerleave?: string | undefined | null;
		onpointermove?: string | undefined | null;
		onpointerout?: string | undefined | null;
		onpointerover?: string | undefined | null;
		onpointerup?: string | undefined | null;
		onlostpointercapture?: string | undefined | null;

		// UI Events
		onscroll?: string | undefined | null;
		onresize?: string | undefined | null;

		// Wheel Events
		onwheel?: string | undefined | null;

		// Animation Events
		onanimationstart?: string | undefined | null;
		onanimationend?: string | undefined | null;
		onanimationiteration?: string | undefined | null;

		// Transition Events
		ontransitionstart?: string | undefined | null;
		ontransitionrun?: string | undefined | null;
		ontransitionend?: string | undefined | null;
		ontransitioncancel?: string | undefined | null;

		// Message Events
		onmessage?: string | undefined | null;
		onmessageerror?: string | undefined | null;

		// Global Events
		oncancel?: string | undefined | null;
		onclose?: string | undefined | null;
		onfullscreenchange?: string | undefined | null;
		onfullscreenerror?: string | undefined | null;
	}

	// All the WAI-ARIA 1.2 attributes from https://www.w3.org/TR/wai-aria-1.2/#state_prop_def
	interface AriaAttributes {
		/** Identifies the currently active element when DOM focus is on a composite widget, combobox, textbox, group, or application. */
		'aria-activedescendant'?: string | undefined | null;
		/** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
		'aria-atomic'?: boolean | 'false' | 'true' | undefined | null;
		/**
		 * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for a combobox, searchbox, or textbox and specifies
		 * how predictions would be presented if they were made.
		 */
		'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both' | undefined | null;
		/** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
		'aria-busy'?: boolean | 'false' | 'true' | undefined | null;
		/**
		 * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
		 * @see aria-pressed @see aria-selected.
		 */
		'aria-checked'?: boolean | 'false' | 'mixed' | 'true' | undefined | null;
		/**
		 * Defines the total number of columns in a table, grid, or treegrid.
		 * @see aria-colindex.
		 */
		'aria-colcount'?: number | string | undefined | null;
		/**
		 * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
		 * @see aria-colcount @see aria-colspan.
		 */
		'aria-colindex'?: number | string | undefined | null;
		/**
		 * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
		 * @see aria-colindex @see aria-rowspan.
		 */
		'aria-colspan'?: number | string | undefined | null;
		/**
		 * Identifies the element (or elements) whose contents or presence are controlled by the current element.
		 * @see aria-owns.
		 */
		'aria-controls'?: string | undefined | null;
		/** Indicates the element that represents the current item within a container or set of related elements. */
		'aria-current'?:
			| boolean
			| 'false'
			| 'true'
			| 'page'
			| 'step'
			| 'location'
			| 'date'
			| 'time'
			| undefined
			| null;
		/**
		 * Identifies the element (or elements) that describes the object.
		 * @see aria-labelledby
		 */
		'aria-describedby'?: string | undefined | null;
		/**
		 * Identifies the element that provides a detailed, extended description for the object.
		 * @see aria-describedby.
		 */
		'aria-details'?: string | undefined | null;
		/**
		 * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
		 * @see aria-hidden @see aria-readonly.
		 */
		'aria-disabled'?: boolean | 'false' | 'true' | undefined | null;
		/**
		 * Indicates what functions can be performed when a dragged object is released on the drop target.
		 * @deprecated in ARIA 1.1
		 */
		'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup' | undefined | null;
		/**
		 * Identifies the element that provides an error message for an object.
		 * @see aria-invalid @see aria-describedby.
		 */
		'aria-errormessage'?: string | undefined | null;
		/** Indicates whether a grouping element owned or controlled by this element is expanded or collapsed. */
		'aria-expanded'?: boolean | 'false' | 'true' | undefined | null;
		/**
		 * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
		 * allows assistive technology to override the general default of reading in document source order.
		 */
		'aria-flowto'?: string | undefined | null;
		/**
		 * Indicates an element's "grabbed" state in a drag-and-drop operation.
		 * @deprecated in ARIA 1.1
		 */
		'aria-grabbed'?: boolean | 'false' | 'true' | undefined | null;
		/** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
		'aria-haspopup'?:
			| boolean
			| 'false'
			| 'true'
			| 'menu'
			| 'listbox'
			| 'tree'
			| 'grid'
			| 'dialog'
			| undefined
			| null;
		/**
		 * Indicates whether the element is exposed to an accessibility API.
		 * @see aria-disabled.
		 */
		'aria-hidden'?: boolean | 'false' | 'true' | undefined | null;
		/**
		 * Indicates the entered value does not conform to the format expected by the application.
		 * @see aria-errormessage.
		 */
		'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling' | undefined | null;
		/** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
		'aria-keyshortcuts'?: string | undefined | null;
		/**
		 * Defines a string value that labels the current element.
		 * @see aria-labelledby.
		 */
		'aria-label'?: string | undefined | null;
		/**
		 * Identifies the element (or elements) that labels the current element.
		 * @see aria-describedby.
		 */
		'aria-labelledby'?: string | undefined | null;
		/** Defines the hierarchical level of an element within a structure. */
		'aria-level'?: number | string | undefined | null;
		/** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
		'aria-live'?: 'off' | 'assertive' | 'polite' | undefined | null;
		/** Indicates whether an element is modal when displayed. */
		'aria-modal'?: boolean | 'false' | 'true' | undefined | null;
		/** Indicates whether a text box accepts multiple lines of input or only a single line. */
		'aria-multiline'?: boolean | 'false' | 'true' | undefined | null;
		/** Indicates that the user may select more than one item from the current selectable descendants. */
		'aria-multiselectable'?: boolean | 'false' | 'true' | undefined | null;
		/** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
		'aria-orientation'?: 'horizontal' | 'vertical' | undefined | null;
		/**
		 * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
		 * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
		 * @see aria-controls.
		 */
		'aria-owns'?: string | undefined | null;
		/**
		 * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
		 * A hint could be a sample value or a brief description of the expected format.
		 */
		'aria-placeholder'?: string | undefined | null;
		/**
		 * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
		 * @see aria-setsize.
		 */
		'aria-posinset'?: number | string | undefined | null;
		/**
		 * Indicates the current "pressed" state of toggle buttons.
		 * @see aria-checked @see aria-selected.
		 */
		'aria-pressed'?: boolean | 'false' | 'mixed' | 'true' | undefined | null;
		/**
		 * Indicates that the element is not editable, but is otherwise operable.
		 * @see aria-disabled.
		 */
		'aria-readonly'?: boolean | 'false' | 'true' | undefined | null;
		/**
		 * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
		 * @see aria-atomic.
		 */
		'aria-relevant'?:
			| 'additions'
			| 'additions removals'
			| 'additions text'
			| 'all'
			| 'removals'
			| 'removals additions'
			| 'removals text'
			| 'text'
			| 'text additions'
			| 'text removals'
			| undefined
			| null;
		/** Indicates that user input is required on the element before a form may be submitted. */
		'aria-required'?: boolean | 'false' | 'true' | undefined | null;
		/** Defines a human-readable, author-localized description for the role of an element. */
		'aria-roledescription'?: string | undefined | null;
		/**
		 * Defines the total number of rows in a table, grid, or treegrid.
		 * @see aria-rowindex.
		 */
		'aria-rowcount'?: number | string | undefined | null;
		/**
		 * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
		 * @see aria-rowcount @see aria-rowspan.
		 */
		'aria-rowindex'?: number | string | undefined | null;
		/**
		 * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
		 * @see aria-rowindex @see aria-colspan.
		 */
		'aria-rowspan'?: number | string | undefined | null;
		/**
		 * Indicates the current "selected" state of various widgets.
		 * @see aria-checked @see aria-pressed.
		 */
		'aria-selected'?: boolean | 'false' | 'true' | undefined | null;
		/**
		 * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
		 * @see aria-posinset.
		 */
		'aria-setsize'?: number | string | undefined | null;
		/** Indicates if items in a table or grid are sorted in ascending or descending order. */
		'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other' | undefined | null;
		/** Defines the maximum allowed value for a range widget. */
		'aria-valuemax'?: number | string | undefined | null;
		/** Defines the minimum allowed value for a range widget. */
		'aria-valuemin'?: number | string | undefined | null;
		/**
		 * Defines the current value for a range widget.
		 * @see aria-valuetext.
		 */
		'aria-valuenow'?: number | string | undefined | null;
		/** Defines the human readable text alternative of aria-valuenow for a range widget. */
		'aria-valuetext'?: string | undefined | null;
	}

	// All the WAI-ARIA 1.2 role attribute values from https://www.w3.org/TR/wai-aria-1.2/#role_definitions
	type AriaRole =
		| 'alert'
		| 'alertdialog'
		| 'application'
		| 'article'
		| 'banner'
		| 'blockquote'
		| 'button'
		| 'caption'
		| 'cell'
		| 'checkbox'
		| 'code'
		| 'columnheader'
		| 'combobox'
		| 'command'
		| 'complementary'
		| 'composite'
		| 'contentinfo'
		| 'definition'
		| 'deletion'
		| 'dialog'
		| 'directory'
		| 'document'
		| 'emphasis'
		| 'feed'
		| 'figure'
		| 'form'
		| 'generic'
		| 'grid'
		| 'gridcell'
		| 'group'
		| 'heading'
		| 'img'
		| 'input'
		| 'insertion'
		| 'landmark'
		| 'link'
		| 'list'
		| 'listbox'
		| 'listitem'
		| 'log'
		| 'main'
		| 'marquee'
		| 'math'
		| 'meter'
		| 'menu'
		| 'menubar'
		| 'menuitem'
		| 'menuitemcheckbox'
		| 'menuitemradio'
		| 'navigation'
		| 'none'
		| 'note'
		| 'option'
		| 'paragraph'
		| 'presentation'
		| 'progressbar'
		| 'radio'
		| 'radiogroup'
		| 'range'
		| 'region'
		| 'roletype'
		| 'row'
		| 'rowgroup'
		| 'rowheader'
		| 'scrollbar'
		| 'search'
		| 'searchbox'
		| 'section'
		| 'sectionhead'
		| 'select'
		| 'separator'
		| 'slider'
		| 'spinbutton'
		| 'status'
		| 'strong'
		| 'structure'
		| 'subscript'
		| 'superscript'
		| 'switch'
		| 'tab'
		| 'table'
		| 'tablist'
		| 'tabpanel'
		| 'term'
		| 'textbox'
		| 'time'
		| 'timer'
		| 'toolbar'
		| 'tooltip'
		| 'tree'
		| 'treegrid'
		| 'treeitem'
		| 'widget'
		| 'window';

	type CssProperty = keyof Omit<
		CSSStyleDeclaration,
		| 'item'
		| 'setProperty'
		| 'removeProperty'
		| 'getPropertyValue'
		| 'getPropertyPriority'
		| 'parentRule'
		| 'length'
		| 'cssFloat'
		| 'cssText'
		| typeof Symbol.iterator
		| number
	>;

	type KebabCSSDOMProperties = import('./dist/type-utils.js').KebabKeys<DOMCSSProperties>;

	type DOMCSSProperties = {
		[key in CssProperty]?: string | number | null | undefined;
	};
	type AllCSSProperties = {
		[key: string]: string | number | null | undefined;
	};
	type StyleObject = import('./dist/type-utils.js').Simplify<
		KebabCSSDOMProperties & DOMCSSProperties & AllCSSProperties
	>;

	interface CSSProperties extends StyleObject {
		/**
		 * Extend namespace to add properties or an index signature of your own.
		 *
		 * For more information, visit:
		 * https://docs.astro.build/en/guides/typescript/#built-in-html-attributes
		 */
	}

	interface HTMLAttributes extends AriaAttributes, DOMAttributes, AstroBuiltinAttributes {
		// Standard HTML Attributes
		accesskey?: string | undefined | null;
		autocapitalize?: string | undefined | null;
		autofocus?: boolean | string | undefined | null;
		class?: string | undefined | null;
		contenteditable?: 'true' | 'false' | boolean | 'inherit' | string | undefined | null;
		dir?: string | undefined | null;
		draggable?: 'true' | 'false' | boolean | undefined | null;
		enterkeyhint?:
			| 'enter'
			| 'done'
			| 'go'
			| 'next'
			| 'previous'
			| 'search'
			| 'send'
			| undefined
			| null;
		exportparts?: string | undefined | null;
		hidden?: boolean | string | undefined | null;
		id?: string | undefined | null;
		inert?: boolean | string | undefined | null;
		inputmode?:
			| 'none'
			| 'text'
			| 'tel'
			| 'url'
			| 'email'
			| 'numeric'
			| 'decimal'
			| 'search'
			| undefined
			| null;
		is?: string | undefined | null;

		// Microdata API
		itemid?: string | undefined | null;
		itemprop?: string | undefined | null;
		itemref?: string | undefined | null;
		itemscope?: boolean | string | undefined | null;
		itemtype?: string | undefined | null;

		lang?: string | undefined | null;
		part?: string | undefined | null;
		popover?: boolean | string | undefined | null;
		slot?: string | undefined | null;
		spellcheck?: 'true' | 'false' | boolean | undefined | null;
		style?: string | CSSProperties | undefined | null;
		tabindex?: number | string | undefined | null;
		title?: string | undefined | null;
		translate?: 'yes' | 'no' | '' | undefined | null;

		// <command>, <menuitem>
		radiogroup?: string | undefined | null;

		// WAI-ARIA
		role?: AriaRole | undefined | null;

		// RDFa Attributes
		about?: string | undefined | null;
		datatype?: string | undefined | null;
		inlist?: any;
		prefix?: string | undefined | null;
		property?: string | undefined | null;
		resource?: string | undefined | null;
		typeof?: string | undefined | null;
		vocab?: string | undefined | null;

		// Non-standard Attributes
		contextmenu?: string | undefined | null; // Obsolete
		autosave?: string | undefined | null; // Apple exclusive
		color?: string | undefined | null;
		results?: number | string | undefined | null;
		security?: string | undefined | null;
		unselectable?: 'on' | 'off' | undefined | null; // Internet Explorer

		// Allow data- attribute
		[key: `data-${string}`]: any;
	}

	type HTMLAttributeReferrerPolicy =
		| ''
		| 'no-referrer'
		| 'no-referrer-when-downgrade'
		| 'origin'
		| 'origin-when-cross-origin'
		| 'same-origin'
		| 'strict-origin'
		| 'strict-origin-when-cross-origin'
		| 'unsafe-url';

	type HTMLAttributeAnchorTarget = '_self' | '_blank' | '_parent' | '_top' | (string & {});

	interface AnchorHTMLAttributes extends HTMLAttributes {
		download?: string | boolean | undefined | null;
		href?: string | URL | undefined | null;
		hreflang?: string | undefined | null;
		media?: string | undefined | null;
		name?: string | undefined | null;
		ping?: string | undefined | null;
		rel?: string | undefined | null;
		target?: HTMLAttributeAnchorTarget | undefined | null;
		type?: string | undefined | null;
		referrerpolicy?: HTMLAttributeReferrerPolicy | undefined | null;
	}

	interface AudioHTMLAttributes extends MediaHTMLAttributes {}

	interface AreaHTMLAttributes extends HTMLAttributes {
		alt?: string | undefined | null;
		coords?: string | undefined | null;
		download?: any;
		href?: string | undefined | null;
		hreflang?: string | undefined | null;
		media?: string | undefined | null;
		referrerpolicy?: HTMLAttributeReferrerPolicy | undefined | null;
		rel?: string | undefined | null;
		shape?: string | undefined | null;
		target?: string | undefined | null;
	}

	interface BaseHTMLAttributes extends HTMLAttributes {
		href?: string | undefined | null;
		target?: string | undefined | null;
	}

	interface BlockquoteHTMLAttributes extends HTMLAttributes {
		cite?: string | undefined | null;
	}

	interface ButtonHTMLAttributes extends HTMLAttributes {
		autocomplete?: string | undefined | null;
		disabled?: boolean | string | undefined | null;
		form?: string | undefined | null;
		formaction?: string | undefined | null;
		formenctype?: string | undefined | null;
		formmethod?: string | undefined | null;
		formnovalidate?: boolean | string | undefined | null;
		formtarget?: string | undefined | null;
		name?: string | undefined | null;
		type?: 'submit' | 'reset' | 'button' | undefined | null;
		value?: string | string[] | number | undefined | null;
		popovertarget?: string | undefined | null;
		popovertargetaction?: 'hide' | 'show' | 'toggle' | undefined | null;
	}

	interface CanvasHTMLAttributes extends HTMLAttributes {
		height?: number | string | undefined | null;
		width?: number | string | undefined | null;
	}

	interface ColHTMLAttributes extends HTMLAttributes {
		span?: number | string | undefined | null;
		width?: number | string | undefined | null;
	}

	interface ColgroupHTMLAttributes extends HTMLAttributes {
		span?: number | string | undefined | null;
	}

	interface DataHTMLAttributes extends HTMLAttributes {
		value?: string | string[] | number | undefined | null;
	}

	interface DetailsHTMLAttributes extends HTMLAttributes {
		open?: boolean | string | undefined | null;
		name?: string | undefined | null;
	}

	interface DelHTMLAttributes extends HTMLAttributes {
		cite?: string | undefined | null;
		datetime?: string | undefined | null;
	}

	interface DialogHTMLAttributes extends HTMLAttributes {
		open?: boolean | string | undefined | null;
		closedby?: 'none' | 'closerequest' | 'any' | undefined | null;
	}

	interface EmbedHTMLAttributes extends HTMLAttributes {
		height?: number | string | undefined | null;
		src?: string | undefined | null;
		type?: string | undefined | null;
		width?: number | string | undefined | null;
	}

	interface FieldsetHTMLAttributes extends HTMLAttributes {
		disabled?: boolean | string | undefined | null;
		form?: string | undefined | null;
		name?: string | undefined | null;
	}

	interface FormHTMLAttributes extends HTMLAttributes {
		'accept-charset'?: string | undefined | null;
		action?: string | undefined | null;
		autocomplete?: string | undefined | null;
		autocorrect?: string | undefined | null;
		enctype?: string | undefined | null;
		method?: string | undefined | null;
		name?: string | undefined | null;
		novalidate?: boolean | string | undefined | null;
		target?: string | undefined | null;
	}

	interface HtmlHTMLAttributes extends HTMLAttributes {
		manifest?: string | undefined | null;
	}

	interface IframeHTMLAttributes extends HTMLAttributes {
		allow?: string | undefined | null;
		allowfullscreen?: boolean | string | undefined | null;
		allowtransparency?: boolean | string | undefined | null;
		fetchpriority?: 'auto' | 'high' | 'low' | undefined | null;
		/** @deprecated */
		frameborder?: number | string | undefined | null;
		height?: number | string | undefined | null;
		loading?: 'eager' | 'lazy' | undefined | null;
		/** @deprecated */
		marginheight?: number | string | undefined | null;
		/** @deprecated */
		marginwidth?: number | string | undefined | null;
		name?: string | undefined | null;
		referrerpolicy?: HTMLAttributeReferrerPolicy | undefined | null;
		sandbox?: string | undefined | null;
		/** @deprecated */
		scrolling?: string | undefined | null;
		seamless?: boolean | string | undefined | null;
		src?: string | undefined | null;
		srcdoc?: string | undefined | null;
		width?: number | string | undefined | null;
	}

	interface ImgHTMLAttributes extends HTMLAttributes {
		alt?: string | undefined | null;
		crossorigin?: 'anonymous' | 'use-credentials' | '' | undefined | null;
		decoding?: 'async' | 'auto' | 'sync' | undefined | null;
		fetchpriority?: 'auto' | 'high' | 'low' | undefined | null;
		height?: number | string | undefined | null;
		loading?: 'eager' | 'lazy' | undefined | null;
		referrerpolicy?: HTMLAttributeReferrerPolicy | undefined | null;
		sizes?: string | undefined | null;
		src?: string | undefined | null;
		srcset?: string | undefined | null;
		usemap?: string | undefined | null;
		width?: number | string | undefined | null;
	}

	interface InsHTMLAttributes extends HTMLAttributes {
		cite?: string | undefined | null;
		datetime?: string | undefined | null;
	}

	type HTMLInputTypeAttribute =
		| 'button'
		| 'checkbox'
		| 'color'
		| 'date'
		| 'datetime-local'
		| 'email'
		| 'file'
		| 'hidden'
		| 'image'
		| 'month'
		| 'number'
		| 'password'
		| 'radio'
		| 'range'
		| 'reset'
		| 'search'
		| 'submit'
		| 'tel'
		| 'text'
		| 'time'
		| 'url'
		| 'week';

	interface InputHTMLAttributes extends HTMLAttributes {
		accept?: string | undefined | null;
		alt?: string | undefined | null;
		autocomplete?: string | undefined | null;
		autocorrect?: string | undefined | null;
		capture?: boolean | string | undefined | null;
		checked?: boolean | string | undefined | null;
		crossorigin?: string | undefined | null;
		dirname?: string | undefined | null;
		disabled?: boolean | string | undefined | null;
		form?: string | undefined | null;
		formaction?: string | undefined | null;
		formenctype?: string | undefined | null;
		formmethod?: string | undefined | null;
		formnovalidate?: boolean | string | undefined | null;
		formtarget?: string | undefined | null;
		height?: number | string | undefined | null;
		list?: string | undefined | null;
		max?: number | string | undefined | null;
		maxlength?: number | string | undefined | null;
		min?: number | string | undefined | null;
		minlength?: number | string | undefined | null;
		multiple?: boolean | string | undefined | null;
		name?: string | undefined | null;
		pattern?: string | undefined | null;
		placeholder?: string | undefined | null;
		readonly?: boolean | string | undefined | null;
		required?: boolean | string | undefined | null;
		size?: number | string | undefined | null;
		src?: string | undefined | null;
		step?: number | string | undefined | null;
		type?: HTMLInputTypeAttribute | undefined | null;
		value?: string | string[] | number | undefined | null;
		width?: number | string | undefined | null;
		popovertarget?: string | undefined | null;
		popovertargetaction?: 'hide' | 'show' | 'toggle' | undefined | null;
	}

	interface KeygenHTMLAttributes extends HTMLAttributes {
		challenge?: string | undefined | null;
		disabled?: boolean | string | undefined | null;
		form?: string | undefined | null;
		keytype?: string | undefined | null;
		keyparams?: string | undefined | null;
		name?: string | undefined | null;
	}

	interface LabelHTMLAttributes extends HTMLAttributes {
		form?: string | undefined | null;
		for?: string | undefined | null;
	}

	interface LiHTMLAttributes extends HTMLAttributes {
		value?: string | number | undefined | null;
	}

	interface LinkHTMLAttributes extends HTMLAttributes {
		as?: string | undefined | null;
		blocking?: 'render' | undefined | null;
		crossorigin?: boolean | string | undefined | null;
		disabled?: boolean | undefined | null;
		fetchpriority?: 'auto' | 'high' | 'low' | undefined | null;
		href?: string | URL | undefined | null;
		hreflang?: string | undefined | null;
		integrity?: string | undefined | null;
		media?: string | undefined | null;
		imagesrcset?: string | undefined | null;
		imagesizes?: string | undefined | null;
		referrerpolicy?: HTMLAttributeReferrerPolicy | undefined | null;
		rel?: string | undefined | null;
		sizes?: string | undefined | null;
		type?: string | undefined | null;
		charset?: string | undefined | null;
	}

	interface MapHTMLAttributes extends HTMLAttributes {
		name?: string | undefined | null;
	}

	interface MenuHTMLAttributes extends HTMLAttributes {
		type?: string | undefined | null;
	}

	interface MediaHTMLAttributes extends HTMLAttributes {
		autoplay?: boolean | string | undefined | null;
		controls?: boolean | string | undefined | null;
		controlslist?: string | undefined | null;
		crossorigin?: string | undefined | null;
		loop?: boolean | string | undefined | null;
		mediagroup?: string | undefined | null;
		muted?: boolean | string | undefined | null;
		playsinline?: boolean | string | undefined | null;
		preload?: string | undefined | null;
		src?: string | undefined | null;
		// https://www.w3.org/TR/remote-playback/#the-disableremoteplayback-attribute
		disableRemotePlayback?: boolean | string | undefined | null;
	}

	interface MetaHTMLAttributes extends HTMLAttributes {
		charset?: string | undefined | null;
		content?: string | URL | undefined | null;
		'http-equiv'?: string | undefined | null;
		name?: string | undefined | null;
		media?: string | undefined | null;
	}

	interface MeterHTMLAttributes extends HTMLAttributes {
		form?: string | undefined | null;
		high?: number | string | undefined | null;
		low?: number | string | undefined | null;
		max?: number | string | undefined | null;
		min?: number | string | undefined | null;
		optimum?: number | string | undefined | null;
		value?: string | string[] | number | undefined | null;
	}

	interface QuoteHTMLAttributes extends HTMLAttributes {
		cite?: string | undefined | null;
	}

	interface ObjectHTMLAttributes extends HTMLAttributes {
		classid?: string | undefined | null;
		data?: string | undefined | null;
		form?: string | undefined | null;
		height?: number | string | undefined | null;
		name?: string | undefined | null;
		type?: string | undefined | null;
		usemap?: string | undefined | null;
		width?: number | string | undefined | null;
		wmode?: string | undefined | null;
	}

	interface OlHTMLAttributes extends HTMLAttributes {
		reversed?: boolean | string | undefined | null;
		start?: number | string | undefined | null;
		type?: '1' | 'a' | 'A' | 'i' | 'I' | undefined | null;
	}

	interface OptgroupHTMLAttributes extends HTMLAttributes {
		disabled?: boolean | string | undefined | null;
		label?: string | undefined | null;
	}

	interface OptionHTMLAttributes extends HTMLAttributes {
		disabled?: boolean | string | undefined | null;
		label?: string | undefined | null;
		selected?: boolean | string | undefined | null;
		value?: string | string[] | number | undefined | null;
	}

	interface OutputHTMLAttributes extends HTMLAttributes {
		form?: string | undefined | null;
		for?: string | undefined | null;
		name?: string | undefined | null;
	}

	interface ParamHTMLAttributes extends HTMLAttributes {
		name?: string | undefined | null;
		value?: string | string[] | number | undefined | null;
	}

	interface ProgressHTMLAttributes extends HTMLAttributes {
		max?: number | string | undefined | null;
		value?: string | string[] | number | undefined | null;
	}

	interface SlotHTMLAttributes extends HTMLAttributes {
		name?: string | undefined | null;
	}

	interface ScriptHTMLAttributes extends HTMLAttributes {
		async?: boolean | string | undefined | null;
		charset?: string | undefined | null;
		crossorigin?: string | undefined | null;
		defer?: boolean | string | undefined | null;
		fetchpriority?: 'auto' | 'high' | 'low' | undefined | null;
		referrerpolicy?: HTMLAttributeReferrerPolicy | undefined | null;
		integrity?: string | undefined | null;
		nomodule?: boolean | string | undefined | null;
		nonce?: string | undefined | null;
		src?: string | undefined | null;
		type?: string | undefined | null;
	}

	interface SelectHTMLAttributes extends HTMLAttributes {
		autocomplete?: string | undefined | null;
		autocorrect?: string | undefined | null;
		disabled?: boolean | string | undefined | null;
		form?: string | undefined | null;
		multiple?: boolean | string | undefined | null;
		name?: string | undefined | null;
		required?: boolean | string | undefined | null;
		size?: number | string | undefined | null;
		value?: string | string[] | number | undefined | null;
	}

	interface SourceHTMLAttributes extends HTMLAttributes {
		height?: number | string | undefined | null;
		media?: string | undefined | null;
		sizes?: string | undefined | null;
		src?: string | undefined | null;
		srcset?: string | undefined | null;
		type?: string | undefined | null;
		width?: number | string | undefined | null;
	}

	interface StyleHTMLAttributes extends HTMLAttributes {
		media?: string | undefined | null;
		nonce?: string | undefined | null;
		scoped?: boolean | string | undefined | null;
		type?: string | undefined | null;
	}

	interface TableHTMLAttributes extends HTMLAttributes {
		align?: 'left' | 'center' | 'right' | undefined | null;
		bgcolor?: string | undefined | null;
		border?: string | number | undefined | null;
		cellpadding?: number | string | undefined | null;
		cellspacing?: number | string | undefined | null;
		frame?: boolean | 'false' | 'true' | undefined | null;
		rules?: 'none' | 'groups' | 'rows' | 'columns' | 'all' | undefined | null;
		summary?: string | undefined | null;
		width?: number | string | undefined | null;
	}

	interface TextareaHTMLAttributes extends HTMLAttributes {
		autocomplete?: string | undefined | null;
		autocorrect?: string | undefined | null;
		cols?: number | string | undefined | null;
		dirname?: string | undefined | null;
		disabled?: boolean | string | undefined | null;
		form?: string | undefined | null;
		maxlength?: number | string | undefined | null;
		minlength?: number | string | undefined | null;
		name?: string | undefined | null;
		placeholder?: string | undefined | null;
		readonly?: boolean | string | undefined | null;
		required?: boolean | string | undefined | null;
		rows?: number | string | undefined | null;
		value?: string | string[] | number | undefined | null;
		wrap?: string | undefined | null;
	}

	interface TdHTMLAttributes extends HTMLAttributes {
		align?: 'left' | 'center' | 'right' | 'justify' | 'char' | undefined | null;
		colspan?: number | string | undefined | null;
		headers?: string | undefined | null;
		rowspan?: number | string | undefined | null;
		scope?: string | undefined | null;
		abbr?: string | undefined | null;
		valign?: 'top' | 'middle' | 'bottom' | 'baseline' | undefined | null;
	}

	interface ThHTMLAttributes extends HTMLAttributes {
		align?: 'left' | 'center' | 'right' | 'justify' | 'char' | undefined | null;
		colspan?: number | string | undefined | null;
		headers?: string | undefined | null;
		rowspan?: number | string | undefined | null;
		scope?: string | undefined | null;
		abbr?: string | undefined | null;
	}

	interface TimeHTMLAttributes extends HTMLAttributes {
		datetime?: string | undefined | null;
	}

	interface TrackHTMLAttributes extends HTMLAttributes {
		default?: boolean | string | undefined | null;
		kind?: string | undefined | null;
		label?: string | undefined | null;
		src?: string | undefined | null;
		srclang?: string | undefined | null;
	}

	interface VideoHTMLAttributes extends MediaHTMLAttributes {
		height?: number | string | undefined | null;
		playsinline?: boolean | string | undefined | null;
		poster?: string | undefined | null;
		width?: number | string | undefined | null;
		disablepictureinpicture?: boolean | string | undefined | null;
	}

	// this list is "complete" in that it contains every SVG attribute
	// that React supports, but the types can be improved.
	// Full list here: https://facebook.github.io/react/docs/dom-elements.html
	//
	// The three broad type categories are (in order of restrictiveness):
	//   - "number | string"
	//   - "string"
	//   - union of string literals
	interface SVGAttributes extends AriaAttributes, DOMAttributes, AstroBuiltinAttributes {
		// Attributes which are also defined in HTMLAttributes
		class?: string | undefined | null;
		color?: string | undefined | null;
		height?: number | string | undefined | null;
		id?: string | undefined | null;
		lang?: string | undefined | null;
		max?: number | string | undefined | null;
		media?: string | undefined | null;
		method?: string | undefined | null;
		min?: number | string | undefined | null;
		name?: string | undefined | null;
		slot?: string | undefined | null;
		style?: string | Record<string, any> | undefined | null;
		target?: string | undefined | null;
		type?: string | undefined | null;
		width?: number | string | undefined | null;

		// Other HTML properties supported by SVG elements in browsers
		role?: AriaRole | undefined | null;
		tabindex?: number | string | undefined | null;
		crossorigin?: 'anonymous' | 'use-credentials' | '' | undefined | null;

		// SVG Specific attributes
		'accent-height'?: number | string | undefined | null;
		accumulate?: 'none' | 'sum' | undefined | null;
		additive?: 'replace' | 'sum' | undefined | null;
		'alignment-baseline'?:
			| 'auto'
			| 'baseline'
			| 'before-edge'
			| 'text-before-edge'
			| 'middle'
			| 'central'
			| 'after-edge'
			| 'text-after-edge'
			| 'ideographic'
			| 'alphabetic'
			| 'hanging'
			| 'mathematical'
			| 'inherit'
			| undefined
			| null;
		allowReorder?: 'no' | 'yes' | undefined | null;
		alphabetic?: number | string | undefined | null;
		amplitude?: number | string | undefined | null;
		'arabic-form'?: 'initial' | 'medial' | 'terminal' | 'isolated' | undefined | null;
		ascent?: number | string | undefined | null;
		attributeName?: string | undefined | null;
		attributeType?: string | undefined | null;
		autoReverse?: number | string | undefined | null;
		azimuth?: number | string | undefined | null;
		baseFrequency?: number | string | undefined | null;
		'baseline-shift'?: number | string | undefined | null;
		baseProfile?: number | string | undefined | null;
		bbox?: number | string | undefined | null;
		begin?: number | string | undefined | null;
		bias?: number | string | undefined | null;
		by?: number | string | undefined | null;
		calcMode?: number | string | undefined | null;
		'cap-height'?: number | string | undefined | null;
		clip?: number | string | undefined | null;
		'clip-path'?: string | undefined | null;
		clipPathUnits?: number | string | undefined | null;
		'clip-rule'?: number | string | undefined | null;
		'color-interpolation'?: number | string | undefined | null;
		'color-interpolation-filters'?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit' | undefined | null;
		'color-profile'?: number | string | undefined | null;
		'color-rendering'?: number | string | undefined | null;
		contentScriptType?: number | string | undefined | null;
		contentStyleType?: number | string | undefined | null;
		cursor?: number | string | undefined | null;
		cx?: number | string | undefined | null;
		cy?: number | string | undefined | null;
		d?: string | undefined | null;
		decelerate?: number | string | undefined | null;
		descent?: number | string | undefined | null;
		diffuseConstant?: number | string | undefined | null;
		direction?: number | string | undefined | null;
		display?: number | string | undefined | null;
		divisor?: number | string | undefined | null;
		'dominant-baseline'?: number | string | undefined | null;
		dur?: number | string | undefined | null;
		dx?: number | string | undefined | null;
		dy?: number | string | undefined | null;
		edgeMode?: number | string | undefined | null;
		elevation?: number | string | undefined | null;
		'enable-background'?: number | string | undefined | null;
		end?: number | string | undefined | null;
		exponent?: number | string | undefined | null;
		externalResourcesRequired?: number | string | undefined | null;
		fill?: string | undefined | null;
		'fill-opacity'?: number | string | undefined | null;
		'fill-rule'?: 'nonzero' | 'evenodd' | 'inherit' | undefined | null;
		filter?: string | undefined | null;
		filterRes?: number | string | undefined | null;
		filterUnits?: number | string | undefined | null;
		'flood-color'?: number | string | undefined | null;
		'flood-opacity'?: number | string | undefined | null;
		focusable?: number | string | undefined | null;
		'font-family'?: string | undefined | null;
		'font-size'?: number | string | undefined | null;
		'font-size-adjust'?: number | string | undefined | null;
		'font-stretch'?: number | string | undefined | null;
		'font-style'?: number | string | undefined | null;
		'font-variant'?: number | string | undefined | null;
		'font-weight'?: number | string | undefined | null;
		format?: number | string | undefined | null;
		from?: number | string | undefined | null;
		fx?: number | string | undefined | null;
		fy?: number | string | undefined | null;
		g1?: number | string | undefined | null;
		g2?: number | string | undefined | null;
		'glyph-name'?: number | string | undefined | null;
		'glyph-orientation-horizontal'?: number | string | undefined | null;
		'glyph-orientation-vertical'?: number | string | undefined | null;
		glyphRef?: number | string | undefined | null;
		gradientTransform?: string | undefined | null;
		gradientUnits?: string | undefined | null;
		hanging?: number | string | undefined | null;
		href?: string | undefined | null;
		'horiz-adv-x'?: number | string | undefined | null;
		'horiz-origin-x'?: number | string | undefined | null;
		ideographic?: number | string | undefined | null;
		'image-rendering'?: number | string | undefined | null;
		in2?: number | string | undefined | null;
		in?: string | undefined | null;
		intercept?: number | string | undefined | null;
		k1?: number | string | undefined | null;
		k2?: number | string | undefined | null;
		k3?: number | string | undefined | null;
		k4?: number | string | undefined | null;
		k?: number | string | undefined | null;
		kernelMatrix?: number | string | undefined | null;
		kernelUnitLength?: number | string | undefined | null;
		kerning?: number | string | undefined | null;
		keyPoints?: number | string | undefined | null;
		keySplines?: number | string | undefined | null;
		keyTimes?: number | string | undefined | null;
		lengthAdjust?: number | string | undefined | null;
		'letter-spacing'?: number | string | undefined | null;
		'lighting-color'?: number | string | undefined | null;
		limitingConeAngle?: number | string | undefined | null;
		local?: number | string | undefined | null;
		'marker-end'?: string | undefined | null;
		markerHeight?: number | string | undefined | null;
		'marker-mid'?: string | undefined | null;
		'marker-start'?: string | undefined | null;
		markerUnits?: number | string | undefined | null;
		markerWidth?: number | string | undefined | null;
		mask?: string | undefined | null;
		maskContentUnits?: number | string | undefined | null;
		maskUnits?: number | string | undefined | null;
		mathematical?: number | string | undefined | null;
		mode?: number | string | undefined | null;
		numOctaves?: number | string | undefined | null;
		offset?: number | string | undefined | null;
		opacity?: number | string | undefined | null;
		operator?: number | string | undefined | null;
		order?: number | string | undefined | null;
		orient?: number | string | undefined | null;
		orientation?: number | string | undefined | null;
		origin?: number | string | undefined | null;
		overflow?: number | string | undefined | null;
		'overline-position'?: number | string | undefined | null;
		'overline-thickness'?: number | string | undefined | null;
		'paint-order'?: number | string | undefined | null;
		'panose-1'?: number | string | undefined | null;
		path?: string | undefined | null;
		pathLength?: number | string | undefined | null;
		patternContentUnits?: string | undefined | null;
		patternTransform?: number | string | undefined | null;
		patternUnits?: string | undefined | null;
		'pointer-events'?: number | string | undefined | null;
		points?: string | undefined | null;
		pointsAtX?: number | string | undefined | null;
		pointsAtY?: number | string | undefined | null;
		pointsAtZ?: number | string | undefined | null;
		preserveAlpha?: number | string | undefined | null;
		preserveAspectRatio?: string | undefined | null;
		primitiveUnits?: number | string | undefined | null;
		r?: number | string | undefined | null;
		radius?: number | string | undefined | null;
		refX?: number | string | undefined | null;
		refY?: number | string | undefined | null;
		'rendering-intent'?: number | string | undefined | null;
		repeatCount?: number | string | undefined | null;
		repeatDur?: number | string | undefined | null;
		requiredExtensions?: number | string | undefined | null;
		requiredFeatures?: number | string | undefined | null;
		restart?: number | string | undefined | null;
		result?: string | undefined | null;
		rotate?: number | string | undefined | null;
		rx?: number | string | undefined | null;
		ry?: number | string | undefined | null;
		scale?: number | string | undefined | null;
		seed?: number | string | undefined | null;
		'shape-rendering'?: number | string | undefined | null;
		slope?: number | string | undefined | null;
		spacing?: number | string | undefined | null;
		specularConstant?: number | string | undefined | null;
		specularExponent?: number | string | undefined | null;
		speed?: number | string | undefined | null;
		spreadMethod?: string | undefined | null;
		startOffset?: number | string | undefined | null;
		stdDeviation?: number | string | undefined | null;
		stemh?: number | string | undefined | null;
		stemv?: number | string | undefined | null;
		stitchTiles?: number | string | undefined | null;
		'stop-color'?: string | undefined | null;
		'stop-opacity'?: number | string | undefined | null;
		'strikethrough-position'?: number | string | undefined | null;
		'strikethrough-thickness'?: number | string | undefined | null;
		string?: number | string | undefined | null;
		stroke?: string | undefined | null;
		'stroke-dasharray'?: string | number | undefined | null;
		'stroke-dashoffset'?: string | number | undefined | null;
		'stroke-linecap'?: 'butt' | 'round' | 'square' | 'inherit' | undefined | null;
		'stroke-linejoin'?: 'miter' | 'round' | 'bevel' | 'inherit' | undefined | null;
		'stroke-miterlimit'?: string | undefined | null;
		'stroke-opacity'?: number | string | undefined | null;
		'stroke-width'?: number | string | undefined | null;
		surfaceScale?: number | string | undefined | null;
		systemLanguage?: number | string | undefined | null;
		tableValues?: number | string | undefined | null;
		targetX?: number | string | undefined | null;
		targetY?: number | string | undefined | null;
		'text-anchor'?: string | undefined | null;
		'text-decoration'?: number | string | undefined | null;
		textLength?: number | string | undefined | null;
		'text-rendering'?: number | string | undefined | null;
		to?: number | string | undefined | null;
		transform?: string | undefined | null;
		u1?: number | string | undefined | null;
		u2?: number | string | undefined | null;
		'underline-position'?: number | string | undefined | null;
		'underline-thickness'?: number | string | undefined | null;
		unicode?: number | string | undefined | null;
		'unicode-bidi'?: number | string | undefined | null;
		'unicode-range'?: number | string | undefined | null;
		'units-per-em'?: number | string | undefined | null;
		'v-alphabetic'?: number | string | undefined | null;
		values?: string | undefined | null;
		'vector-effect'?: number | string | undefined | null;
		version?: string | undefined | null;
		'vert-adv-y'?: number | string | undefined | null;
		'vert-origin-x'?: number | string | undefined | null;
		'vert-origin-y'?: number | string | undefined | null;
		'v-hanging'?: number | string | undefined | null;
		'v-ideographic'?: number | string | undefined | null;
		viewBox?: string | undefined | null;
		viewTarget?: number | string | undefined | null;
		visibility?: number | string | undefined | null;
		'v-mathematical'?: number | string | undefined | null;
		widths?: number | string | undefined | null;
		'word-spacing'?: number | string | undefined | null;
		'writing-mode'?: number | string | undefined | null;
		x1?: number | string | undefined | null;
		x2?: number | string | undefined | null;
		x?: number | string | undefined | null;
		xChannelSelector?: string | undefined | null;
		'x-height'?: number | string | undefined | null;
		'xlink:actuate'?: string | undefined | null;
		'xlink:arcrole'?: string | undefined | null;
		'xlink:href'?: string | undefined | null;
		'xlink:role'?: string | undefined | null;
		'xlink:show'?: string | undefined | null;
		'xlink:title'?: string | undefined | null;
		'xlink:type'?: string | undefined | null;
		'xml:base'?: string | undefined | null;
		'xml:lang'?: string | undefined | null;
		xmlns?: string | undefined | null;
		'xmlns:xlink'?: string | undefined | null;
		'xml:space'?: string | undefined | null;
		y1?: number | string | undefined | null;
		y2?: number | string | undefined | null;
		y?: number | string | undefined | null;
		yChannelSelector?: string | undefined | null;
		z?: number | string | undefined | null;
		zoomAndPan?: string | undefined | null;

		// Allow data- attribute
		[key: `data-${string}`]: any;
	}

	interface DefinedIntrinsicElements {
		// HTML
		a: AnchorHTMLAttributes;
		abbr: HTMLAttributes;
		address: HTMLAttributes;
		area: AreaHTMLAttributes;
		article: HTMLAttributes;
		aside: HTMLAttributes;
		audio: AudioHTMLAttributes;
		b: HTMLAttributes;
		base: BaseHTMLAttributes;
		bdi: HTMLAttributes;
		bdo: HTMLAttributes;
		big: HTMLAttributes;
		blockquote: BlockquoteHTMLAttributes;
		body: HTMLAttributes;
		br: HTMLAttributes;
		button: ButtonHTMLAttributes;
		canvas: CanvasHTMLAttributes;
		caption: HTMLAttributes;
		cite: HTMLAttributes;
		code: HTMLAttributes;
		col: ColHTMLAttributes;
		colgroup: ColgroupHTMLAttributes;
		data: DataHTMLAttributes;
		datalist: HTMLAttributes;
		dd: HTMLAttributes;
		del: DelHTMLAttributes;
		details: DetailsHTMLAttributes;
		dfn: HTMLAttributes;
		dialog: DialogHTMLAttributes;
		div: HTMLAttributes;
		dl: HTMLAttributes;
		dt: HTMLAttributes;
		em: HTMLAttributes;
		embed: EmbedHTMLAttributes;
		fieldset: FieldsetHTMLAttributes;
		figcaption: HTMLAttributes;
		figure: HTMLAttributes;
		footer: HTMLAttributes;
		form: FormHTMLAttributes;
		h1: HTMLAttributes;
		h2: HTMLAttributes;
		h3: HTMLAttributes;
		h4: HTMLAttributes;
		h5: HTMLAttributes;
		h6: HTMLAttributes;
		head: HTMLAttributes;
		header: HTMLAttributes;
		hgroup: HTMLAttributes;
		hr: HTMLAttributes;
		html: HtmlHTMLAttributes;
		i: HTMLAttributes;
		iframe: IframeHTMLAttributes;
		img: ImgHTMLAttributes;
		input: InputHTMLAttributes;
		ins: InsHTMLAttributes;
		kbd: HTMLAttributes;
		keygen: KeygenHTMLAttributes;
		label: LabelHTMLAttributes;
		legend: HTMLAttributes;
		li: LiHTMLAttributes;
		link: LinkHTMLAttributes;
		main: HTMLAttributes;
		map: MapHTMLAttributes;
		mark: HTMLAttributes;
		menu: MenuHTMLAttributes;
		menuitem: HTMLAttributes;
		meta: MetaHTMLAttributes;
		meter: MeterHTMLAttributes;
		nav: HTMLAttributes;
		noindex: HTMLAttributes; // https://en.wikipedia.org/wiki/Noindex#%3Cnoindex%3E_tag
		noscript: HTMLAttributes;
		object: ObjectHTMLAttributes;
		ol: OlHTMLAttributes;
		optgroup: OptgroupHTMLAttributes;
		option: OptionHTMLAttributes;
		output: OutputHTMLAttributes;
		p: HTMLAttributes;
		param: ParamHTMLAttributes;
		picture: HTMLAttributes;
		pre: HTMLAttributes;
		progress: ProgressHTMLAttributes;
		q: QuoteHTMLAttributes;
		rp: HTMLAttributes;
		rt: HTMLAttributes;
		ruby: HTMLAttributes;
		s: HTMLAttributes;
		samp: HTMLAttributes;
		slot: SlotHTMLAttributes & AstroSlotAttributes;
		script: ScriptHTMLAttributes & AstroScriptAttributes;
		section: HTMLAttributes;
		select: SelectHTMLAttributes;
		small: HTMLAttributes;
		source: SourceHTMLAttributes;
		span: HTMLAttributes;
		strong: HTMLAttributes;
		style: StyleHTMLAttributes & AstroStyleAttributes;
		sub: HTMLAttributes;
		summary: HTMLAttributes;
		sup: HTMLAttributes;
		table: TableHTMLAttributes;
		tbody: HTMLAttributes;
		td: TdHTMLAttributes;
		textarea: TextareaHTMLAttributes;
		tfoot: HTMLAttributes;
		th: ThHTMLAttributes;
		thead: HTMLAttributes;
		time: TimeHTMLAttributes;
		title: HTMLAttributes;
		tr: HTMLAttributes;
		track: TrackHTMLAttributes;
		u: HTMLAttributes;
		ul: HTMLAttributes;
		var: HTMLAttributes;
		video: VideoHTMLAttributes;
		wbr: HTMLAttributes;

		// SVG
		svg: SVGAttributes;
		animate: SVGAttributes;
		circle: SVGAttributes;
		clipPath: SVGAttributes;
		defs: SVGAttributes;
		desc: SVGAttributes;
		ellipse: SVGAttributes;
		feBlend: SVGAttributes;
		feColorMatrix: SVGAttributes;
		feComponentTransfer: SVGAttributes;
		feComposite: SVGAttributes;
		feConvolveMatrix: SVGAttributes;
		feDiffuseLighting: SVGAttributes;
		feDisplacementMap: SVGAttributes;
		feDistantLight: SVGAttributes;
		feFlood: SVGAttributes;
		feFuncA: SVGAttributes;
		feFuncB: SVGAttributes;
		feFuncG: SVGAttributes;
		feFuncR: SVGAttributes;
		feGaussianBlur: SVGAttributes;
		feImage: SVGAttributes;
		feMerge: SVGAttributes;
		feMergeNode: SVGAttributes;
		feMorphology: SVGAttributes;
		feOffset: SVGAttributes;
		fePointLight: SVGAttributes;
		feSpecularLighting: SVGAttributes;
		feSpotLight: SVGAttributes;
		feTile: SVGAttributes;
		feTurbulence: SVGAttributes;
		filter: SVGAttributes;
		foreignObject: SVGAttributes;
		g: SVGAttributes;
		image: SVGAttributes;
		line: SVGAttributes;
		linearGradient: SVGAttributes;
		marker: SVGAttributes;
		mask: SVGAttributes;
		metadata: SVGAttributes;
		path: SVGAttributes;
		pattern: SVGAttributes;
		polygon: SVGAttributes;
		polyline: SVGAttributes;
		radialGradient: SVGAttributes;
		rect: SVGAttributes;
		stop: SVGAttributes;
		switch: SVGAttributes;
		symbol: SVGAttributes;
		text: SVGAttributes;
		textPath: SVGAttributes;
		tspan: SVGAttributes;
		use: SVGAttributes;
		view: SVGAttributes;
	}

	interface IntrinsicElements extends DefinedIntrinsicElements {
		// Allow for arbitrary elements
		[name: string]: { [name: string]: any };
	}
}
