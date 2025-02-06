import { escape as escapeHTML } from 'html-escaper';
import type { DevToolbarMetadata } from '../../../../../../types/public/toolbar.js';
import {
	attachTooltipToHighlight,
	createHighlight,
	getElementsPositionInDocument,
} from '../../utils/highlight.js';
import type { Audit } from '../index.js';
import { type ResolvedAuditRule, resolveAuditRule } from '../rules/index.js';
import type { DevToolbarAuditListItem } from './audit-list-item.js';

function truncate(val: string, maxLength: number): string {
	return val.length > maxLength ? val.slice(0, maxLength - 1) + '&hellip;' : val;
}

export function createAuditUI(audit: Audit, audits: Audit[]) {
	const rect = audit.auditedElement.getBoundingClientRect();
	const highlight = createHighlight(rect, 'warning', { 'data-audit-code': audit.rule.code });

	const resolvedAuditRule = resolveAuditRule(audit.rule, audit.auditedElement);
	const tooltip = buildAuditTooltip(resolvedAuditRule, audit.auditedElement);
	const card = buildAuditCard(resolvedAuditRule, highlight, audit.auditedElement, audits);

	// If a highlight is hovered or focused, highlight the corresponding card for it
	(['focus', 'mouseover'] as const).forEach((event) => {
		const attribute = event === 'focus' ? 'active' : 'hovered';
		highlight.addEventListener(event, () => {
			if (event === 'focus') {
				audits.forEach((adt) => {
					if (adt.card) adt.card.toggleAttribute('active', false);
				});
				if (!card.isManualFocus) card.scrollIntoView();
				card.toggleAttribute('active', true);
			} else {
				card.toggleAttribute(attribute, true);
			}
		});
	});

	highlight.addEventListener('mouseout', () => {
		card.toggleAttribute('hovered', false);
	});

	// Set the highlight/tooltip as being fixed position the highlighted element
	// is fixed. We do this so that we don't mistakenly take scroll position
	// into account when setting the tooltip/highlight positioning.
	//
	// We only do this once due to how expensive computed styles are to calculate,
	// and are unlikely to change. If that turns out to be wrong, reconsider this.
	const { isFixed } = getElementsPositionInDocument(audit.auditedElement);
	if (isFixed) {
		tooltip.style.position = highlight.style.position = 'fixed';
	}

	attachTooltipToHighlight(highlight, tooltip, audit.auditedElement);

	return { highlight, card };
}

function buildAuditTooltip(rule: ResolvedAuditRule, element: Element) {
	const tooltip = document.createElement('astro-dev-toolbar-tooltip');
	const { title, message } = rule;

	tooltip.sections = [
		{
			icon: 'warning',
			title: escapeHTML(title),
		},
		{
			content: escapeHTML(message),
		},
	];

	const elementFile = element.getAttribute('data-astro-source-file');
	const elementPosition = element.getAttribute('data-astro-source-loc');

	if (elementFile) {
		const elementFileWithPosition = elementFile + (elementPosition ? ':' + elementPosition : '');

		tooltip.sections.push({
			content: elementFileWithPosition.slice(
				(window as DevToolbarMetadata).__astro_dev_toolbar__.root.length - 1, // We want to keep the final slash, so minus one.
			),
			clickDescription: 'Click to go to file',
			async clickAction() {
				// NOTE: The path here has to be absolute and without any errors (no double slashes etc)
				// or Vite will silently fail to open the file. Quite annoying.
				await fetch('/__open-in-editor?file=' + encodeURIComponent(elementFileWithPosition));
			},
		});
	}

	return tooltip;
}

function buildAuditCard(
	rule: ResolvedAuditRule,
	highlightElement: HTMLElement,
	auditedElement: Element,
	audits: Audit[],
) {
	const card = document.createElement(
		'astro-dev-toolbar-audit-list-item',
	) as DevToolbarAuditListItem;

	card.clickAction = () => {
		if (card.hasAttribute('active')) return;

		audits.forEach((audit) => {
			audit.card?.toggleAttribute('active', false);
		});
		highlightElement.scrollIntoView();
		card.isManualFocus = true;
		highlightElement.focus();
		card.isManualFocus = false;
	};

	const selectorTitleContainer = document.createElement('section');
	selectorTitleContainer.classList.add('selector-title-container');
	const selector = document.createElement('span');
	const selectorName = truncate(auditedElement.tagName.toLowerCase(), 8);
	selector.classList.add('audit-selector');
	selector.innerHTML = escapeHTML(selectorName);

	const title = document.createElement('h3');
	title.classList.add('audit-title');
	title.innerText = rule.title;

	selectorTitleContainer.append(selector, title);
	card.append(selectorTitleContainer);

	const extendedInfo = document.createElement('div');
	extendedInfo.classList.add('extended-info');

	const selectorButton = document.createElement('button');
	selectorButton.className = 'audit-selector reset-button';
	selectorButton.innerHTML = `${selectorName} <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M128,136v64a8,8,0,0,1-16,0V155.32L45.66,221.66a8,8,0,0,1-11.32-11.32L100.68,144H56a8,8,0,0,1,0-16h64A8,8,0,0,1,128,136ZM208,32H80A16,16,0,0,0,64,48V96a8,8,0,0,0,16,0V48H208V176H160a8,8,0,0,0,0,16h48a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Z"></path></svg>`;

	selectorButton.addEventListener('click', () => {
		highlightElement.scrollIntoView();
		highlightElement.focus();
	});

	extendedInfo.append(title.cloneNode(true));
	extendedInfo.append(selectorButton);
	extendedInfo.append(document.createElement('hr'));

	const message = document.createElement('p');
	message.classList.add('audit-message');
	message.innerHTML = simpleRenderMarkdown(rule.message);
	extendedInfo.appendChild(message);

	const description = rule.description;
	if (description) {
		const descriptionElement = document.createElement('p');
		descriptionElement.classList.add('audit-description');
		descriptionElement.innerHTML = simpleRenderMarkdown(description);
		extendedInfo.appendChild(descriptionElement);
	}

	card.shadowRoot.appendChild(extendedInfo);

	return card;
}

const linkRegex = /\[([^[]+)\]\((.*)\)/g;
const boldRegex = /\*\*(.+)\*\*/g;
const codeRegex = /`([^`]+)`/g;

/**
 * Render a very small subset of Markdown to HTML or a CLI output
 */
function simpleRenderMarkdown(markdown: string) {
	return escapeHTML(markdown)
		.replace(linkRegex, `<a href="$2" target="_blank">$1</a>`)
		.replace(boldRegex, '<b>$1</b>')
		.replace(codeRegex, '<code>$1</code>');
}
