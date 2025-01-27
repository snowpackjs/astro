import type { Icon } from '../../../ui-library/icons.js';
import type { Audit } from '../index.js';
import { getAuditCategory, rulesCategories } from '../rules/index.js';

export function createRoundedBadge(icon: Icon) {
	const badge = document.createElement('astro-dev-toolbar-badge');

	badge.shadowRoot.innerHTML += `
		<style>
			:host>div {
				padding: 12px 8px;
				font-size: 14px;
				display: flex;
				gap: 4px;
			}
		</style>
	`;

	badge.innerHTML = `<astro-dev-toolbar-icon icon="${icon}"></astro-dev-toolbar-icon>0`;

	return {
		badge,
		updateCount: (count: number) => {
			if (count === 0) {
				badge.badgeStyle = 'green';
			} else {
				badge.badgeStyle = 'purple';
			}

			badge.innerHTML = `<astro-dev-toolbar-icon icon="${icon}"></astro-dev-toolbar-icon>${count}`;
		},
	};
}

export class DevToolbarAuditListWindow extends HTMLElement {
	_audits: Audit[] = [];
	shadowRoot: ShadowRoot;
	badges: {
		[key: string]: {
			badge: HTMLElement;
			updateCount: (count: number) => void;
		};
	} = {};

	get audits() {
		return this._audits;
	}

	set audits(value) {
		this._audits = value;
		this.render();
	}

	constructor() {
		super();
		this.shadowRoot = this.attachShadow({ mode: 'open' });

		this.shadowRoot.innerHTML = `<style>
			:host {
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				background: linear-gradient(0deg, #13151a, #13151a), linear-gradient(0deg, #343841, #343841);
				border: 1px solid rgba(52, 56, 65, 1);
				width: min(640px, 100%);
				max-height: 480px;
				border-radius: 12px;
				padding: 24px;
				font-family:
					ui-sans-serif,
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					"Segoe UI",
					Roboto,
					"Helvetica Neue",
					Arial,
					"Noto Sans",
					sans-serif,
					"Apple Color Emoji",
					"Segoe UI Emoji",
					"Segoe UI Symbol",
					"Noto Color Emoji";
				color: rgba(191, 193, 201, 1);
				position: fixed;
				z-index: 999999999;
				bottom: 72px;
				left: 50%;
				transform: translateX(-50%);
				box-shadow:
					0px 0px 0px 0px rgba(19, 21, 26, 0.3),
					0px 1px 2px 0px rgba(19, 21, 26, 0.29),
					0px 4px 4px 0px rgba(19, 21, 26, 0.26),
					0px 10px 6px 0px rgba(19, 21, 26, 0.15),
					0px 17px 7px 0px rgba(19, 21, 26, 0.04),
					0px 26px 7px 0px rgba(19, 21, 26, 0.01);
			}

			@media (forced-colors: active) {
				:host {
					background: white;
				}
			}

			@media (max-width: 640px) {
				:host {
					border-radius: 0;
				}
			}

			hr,
			::slotted(hr) {
				border: 1px solid rgba(27, 30, 36, 1);
				margin: 1em 0;
			}

			.reset-button {
				text-align: left;
				border: none;
				margin: 0;
				width: auto;
				overflow: visible;
				background: transparent;
				font: inherit;
				line-height: normal;
				-webkit-font-smoothing: inherit;
				-moz-osx-font-smoothing: inherit;
				-webkit-appearance: none;
				padding: 0;
			}

			:host {
				left: initial;
				top: 8px;
				right: 8px;
				transform: none;
				width: 350px;
				min-height: 350px;
				max-height: 420px;
				padding: 0;
				overflow: hidden;
			}

			hr {
				margin: 0;
			}

			header {
				display: flex;
				align-items: center;
				gap: 4px;
			}

			header > section {
				display: flex;
				align-items: center;
				gap: 1em;
				padding: 18px;
			}

			header.category-header {
				background: rgba(27, 30, 36, 1);
				padding: 10px 16px;
				position: sticky;
				top: 0;
			}

			header.category-header astro-dev-toolbar-icon {
				opacity: 0.6;
			}

			#audit-counts {
				display: flex;
				gap: 0.5em;
			}

			#audit-counts > div {
				display: flex;
				gap: 8px;
				align-items: center;
			}

			ul,
			li {
				margin: 0;
				padding: 0;
				list-style: none;
			}

			h1 {
				font-size: 24px;
				font-weight: 600;
				color: #fff;
				margin: 0;
			}

			h2 {
				font-weight: 600;
				margin: 0;
				color: white;
				font-size: 14px;
			}

			h3 {
				font-weight: normal;
				margin: 0;
				color: white;
				font-size: 14px;
			}

			.audit-header {
				display: flex;
				gap: 8px;
				align-items: center;
			}

			.audit-selector {
				color: white;
				font-size: 12px;
				font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
					"Liberation Mono", "Courier New", monospace;
				border: 1px solid rgba(255, 255, 255, 0.1);
				border-radius: 4px;
				padding: 4px 6px;
			}

			[active] .audit-selector:hover {
				text-decoration: underline;
				cursor: pointer;
			}

			.selector-title-container {
				display: flex;
				align-items: center;
				gap: 8px;
			}

			astro-dev-toolbar-icon {
				color: white;
				fill: white;
				display: inline-block;
				height: 16px;
				width: 16px;
			}

			#audit-list {
				display: flex;
				flex-direction: column;
				overflow: auto;
				overscroll-behavior: contain;
				height: 100%;
			}

			#back-to-list {
				display: none;
				align-items: center;
				justify-content: center;
				background: rgba(27, 30, 36, 1);
				gap: 8px;
				padding: 8px;
				color: white;
				font-size: 14px;
				padding-right: 24px;
			}

			#back-to-list:hover {
				cursor: pointer;
				background: #313236;
			}

			#back-to-list:has(+ #audit-list astro-dev-toolbar-audit-list-item[active]) {
				display: flex;
			}

			.no-audit-container {
				display: flex;
				flex-direction: column;
				padding: 24px;
			}

			.no-audit-container h1 {
				font-size: 20px;
			}

			.no-audit-container astro-dev-toolbar-icon {
				width: auto;
				height: auto;
				margin: 0 auto;
			}
</style>

<template id="category-template">
	<div>
		<header class="category-header">
		</header>
		<div class="category-content"></div>
	</div>
</template>

<header>
	<section id="header-left">
		<h1>Audit</h1>
		<section id="audit-counts"></section>
	</section>
</header>
<hr />
<button id="back-to-list" class="reset-button">
	<astro-dev-toolbar-icon icon="arrow-left"></astro-dev-toolbar-icon>
	Back to list
</button>
<div id="audit-list"></div>
		`;

		// Create badges
		const auditCounts = this.shadowRoot.getElementById('audit-counts');
		if (auditCounts) {
			rulesCategories.forEach((category) => {
				const headerEntryContainer = document.createElement('div');
				const auditCount = this.audits.filter(
					(audit) => getAuditCategory(audit.rule) === category.code,
				).length;

				const categoryBadge = createRoundedBadge(category.icon);
				categoryBadge.updateCount(auditCount);

				headerEntryContainer.append(categoryBadge.badge);
				auditCounts.append(headerEntryContainer);
				this.badges[category.code] = categoryBadge;
			});
		}

		// Back to list button
		const backToListButton = this.shadowRoot.getElementById('back-to-list');
		if (backToListButton) {
			backToListButton.addEventListener('click', () => {
				const activeAudit = this.shadowRoot.querySelector(
					'astro-dev-toolbar-audit-list-item[active]',
				);
				if (activeAudit) {
					activeAudit.toggleAttribute('active', false);
				}
			});
		}
	}

	connectedCallback() {
		this.render();
	}

	updateAuditList() {
		const auditListContainer = this.shadowRoot.getElementById('audit-list');
		if (auditListContainer) {
			auditListContainer.innerHTML = '';

			if (this.audits.length > 0) {
				for (const category of rulesCategories) {
					const template = this.shadowRoot.getElementById(
						'category-template',
					) as HTMLTemplateElement;
					if (!template) return;

					const clone = document.importNode(template.content, true);
					const categoryContainer = clone.querySelector('div')!;
					const categoryHeader = clone.querySelector('.category-header')!;
					categoryHeader.innerHTML = `<astro-dev-toolbar-icon icon="${category.icon}"></astro-dev-toolbar-icon><h2>${category.name}</h2>`;
					categoryContainer.append(categoryHeader);

					const categoryContent = clone.querySelector('.category-content')!;

					const categoryAudits = this.audits.filter(
						(audit) => getAuditCategory(audit.rule) === category.code,
					);

					for (const audit of categoryAudits) {
						if (audit.card) categoryContent.append(audit.card);
					}

					categoryContainer.append(categoryContent);
					auditListContainer.append(categoryContainer);
				}
			} else {
				const noAuditContainer = document.createElement('div');
				noAuditContainer.classList.add('no-audit-container');
				noAuditContainer.innerHTML = `
					<header>
						<h1></astro-dev-toolbar-icon>No accessibility or performance issues detected.</h1>
					</header>
					<p>
						Nice work! This app scans the page and highlights common accessibility and performance issues for you, like a missing "alt" attribute on an image, or a image not using performant attributes.
					</p>
					<astro-dev-toolbar-icon icon="houston-detective"></astro-dev-toolbar-icon>
					`;

				auditListContainer.append(noAuditContainer);
			}
		}
	}

	updateBadgeCounts() {
		for (const category of rulesCategories) {
			const auditCount = this.audits.filter(
				(audit) => getAuditCategory(audit.rule) === category.code,
			).length;
			this.badges[category.code].updateCount(auditCount);
		}
	}

	render() {
		this.updateAuditList();
		this.updateBadgeCounts();
	}
}
