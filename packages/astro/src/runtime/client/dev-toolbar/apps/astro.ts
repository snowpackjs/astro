import type {
	DevToolbarMetadata,
	ResolvedDevToolbarApp,
} from '../../../../types/public/toolbar.js';
import { type Icon, isDefinedIcon } from '../ui-library/icons.js';
import { colorForIntegration, iconForIntegration } from './utils/icons.js';
import {
	closeOnOutsideClick,
	createWindowElement,
	synchronizePlacementOnUpdate,
} from './utils/window.js';

const astroLogo =
	'<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 99 26" width="100"><path fill="#fff" d="M6.70402 22.1453c-1.17459-1.0737-1.51748-3.3297-1.02811-4.9641.84853 1.0304 2.02424 1.3569 3.24204 1.5411 1.88005.2844 3.72635.178 5.47285-.6813.1998-.0984.3844-.2292.6027-.3617.1639.4755.2065.9554.1493 1.4439-.1392 1.1898-.7313 2.1088-1.673 2.8054-.3765.2787-.775.5278-1.1639.7905-1.1948.8075-1.518 1.7544-1.0691 3.1318.0107.0336.0202.0671.0444.149-.6101-.273-1.0557-.6705-1.39518-1.1931-.3586-.5517-.52921-1.1619-.53819-1.8221-.00449-.3213-.00449-.6455-.0477-.9623-.10551-.7722-.46804-1.118-1.15102-1.1379-.70094-.0205-1.2554.4129-1.40244 1.0953-.01122.0523-.02749.1041-.04377.1649l.00112.0006Z"/><path fill="url(#paint0_linear_386_2739)" d="M6.70402 22.1453c-1.17459-1.0737-1.51748-3.3297-1.02811-4.9641.84853 1.0304 2.02424 1.3569 3.24204 1.5411 1.88005.2844 3.72635.178 5.47285-.6813.1998-.0984.3844-.2292.6027-.3617.1639.4755.2065.9554.1493 1.4439-.1392 1.1898-.7313 2.1088-1.673 2.8054-.3765.2787-.775.5278-1.1639.7905-1.1948.8075-1.518 1.7544-1.0691 3.1318.0107.0336.0202.0671.0444.149-.6101-.273-1.0557-.6705-1.39518-1.1931-.3586-.5517-.52921-1.1619-.53819-1.8221-.00449-.3213-.00449-.6455-.0477-.9623-.10551-.7722-.46804-1.118-1.15102-1.1379-.70094-.0205-1.2554.4129-1.40244 1.0953-.01122.0523-.02749.1041-.04377.1649l.00112.0006Z"/><path fill="#fff" d="M0 16.909s3.47815-1.6944 6.96603-1.6944l2.62973-8.13858c.09846-.39359.38592-.66106.71044-.66106.3246 0 .612.26747.7105.66106l2.6297 8.13858c4.1309 0 6.966 1.6944 6.966 1.6944S14.7045.814589 14.693.782298C14.5234.306461 14.2371 0 13.8512 0H6.76183c-.38593 0-.66063.306461-.84174.782298C5.90733.81398 0 16.909 0 16.909ZM36.671 11.7318c0 1.4262-1.7739 2.2779-4.2302 2.2779-1.5985 0-2.1638-.3962-2.1638-1.2281 0-.8715.7018-1.2875 2.3003-1.2875 1.4426 0 2.6707.0198 4.0937.1981v.0396Zm.0195-1.7629c-.8772-.19808-2.2028-.31693-3.7818-.31693-4.6006 0-6.7644 1.08943-6.7644 3.62483 0 2.6344 1.4815 3.6446 4.9125 3.6446 2.9046 0 4.8735-.7328 5.5947-2.5354h.117c-.0195.4358-.039.8716-.039 1.2083 0 .931.156 1.0102.9162 1.0102h3.5869c-.1949-.5546-.3119-2.1194-.3119-3.4663 0-1.446.0585-2.5355.0585-4.00123 0-2.99098-1.7934-4.89253-7.4077-4.89253-2.4173 0-5.1074.41596-7.1543 1.03.1949.81213.4679 2.45617.6043 3.5258 1.774-.83193 4.2887-1.18847 6.2381-1.18847 2.6902 0 3.4309.61404 3.4309 1.86193v.4952ZM46.5325 12.5637c-.4874.0594-1.1502.0594-1.8325.0594-.7213 0-1.3841-.0198-1.8324-.0792 0 .1585-.0195.3367-.0195.4952 0 2.476 1.618 3.922 7.3102 3.922 5.3609 0 7.0958-1.4262 7.0958-3.9418 0-2.3769-1.1501-3.5456-6.238-3.8031-3.9573-.17827-4.3082-.61404-4.3082-1.10924 0-.57442.5068-.87154 3.158-.87154 2.7487 0 3.4894.37635 3.4894 1.16866v.17827c.3899-.01981 1.0917-.03961 1.813-.03961.6823 0 1.423.0198 1.8519.05942 0-.17827.0195-.33674.0195-.47539 0-2.91175-2.4172-3.86252-7.0958-3.86252-5.2634 0-7.0373 1.2875-7.0373 3.8031 0 2.25805 1.423 3.66445 6.472 3.88235 3.7233.1188 4.1327.5348 4.1327 1.1092 0 .6141-.6043.8914-3.2165.8914-3.0021 0-3.7623-.416-3.7623-1.2677v-.1189ZM63.6883 2.125c-1.423 1.32712-3.9768 2.65425-5.3998 3.01079.0195.73289.0195 2.07982.0195 2.81271l1.3061.01981c-.0195 1.40635-.039 3.10979-.039 4.23889 0 2.6344 1.3841 4.6152 5.6922 4.6152 1.813 0 3.0216-.1981 4.5226-.515-.1559-.9706-.3314-2.4562-.3898-3.5852-.8968.2971-2.0274.4556-3.275.4556-1.735 0-2.4368-.4754-2.4368-1.8422 0-1.1884 0-2.29767.0195-3.32768 2.2223.01981 4.4446.05943 5.7507.09904-.0195-1.03.0195-2.51559.078-3.50598-1.8909.03961-4.0157.05942-5.7702.05942.0195-.87154.039-1.70347.0585-2.5354h-.1365ZM75.3313 7.35427c.0195-1.03001.039-1.90156.0585-2.75329h-3.9183c.0585 1.70347.0585 3.44656.0585 6.00172 0 2.5553-.0195 4.3182-.0585 6.0018h4.4836c-.078-1.1885-.0975-3.189-.0975-4.8925 0-2.69388 1.0917-3.46638 3.5674-3.46638 1.1502 0 1.9689.13865 2.6902.39615.0195-1.01019.2144-2.97117.3314-3.84271-.7408-.21789-1.5595-.35655-2.5537-.35655-2.1249-.0198-3.6844.85174-4.4056 2.93156l-.156-.0198ZM94.8501 10.5235c0 2.1591-1.5595 3.1693-4.0157 3.1693-2.4368 0-3.9963-.9508-3.9963-3.1693 0-2.21846 1.579-3.05039 3.9963-3.05039 2.4367 0 4.0157.89135 4.0157 3.05039Zm4.0743-.099c0-4.29832-3.353-6.21968-8.09-6.21968-4.7566 0-7.9926 1.92136-7.9926 6.21968 0 4.2785 3.0216 6.5762 7.9731 6.5762 4.9904 0 8.1095-2.2977 8.1095-6.5762Z"/><defs><linearGradient id="paint0_linear_386_2739" x1="5.46011" x2="16.8017" y1="25.9999" y2="20.6412" gradientUnits="userSpaceOnUse"><stop stop-color="#D83333"/><stop offset="1" stop-color="#F041FF"/></linearGradient></defs></svg>';

export interface Integration {
	name: string;
	title: string;
	description: string;
	image?: string;
	categories: string[];
	repoUrl: string;
	npmUrl: string;
	homepageUrl: string;
	official: boolean;
	featured: number;
	downloads: number;
}

interface IntegrationData {
	data: Integration[];
}

let integrationData: IntegrationData;

export default {
	id: 'astro:home',
	name: 'Menu',
	icon: 'astro:logo',
	async init(canvas, eventTarget) {
		createCanvas();

		document.addEventListener('astro:after-swap', createCanvas);

		eventTarget.addEventListener('app-toggled', async (event) => {
			resetDebugButton();
			if (!(event instanceof CustomEvent)) return;

			if (event.detail.state === true) {
				if (!integrationData) fetchIntegrationData();
			}
		});

		closeOnOutsideClick(eventTarget);
		synchronizePlacementOnUpdate(eventTarget, canvas);

		function fetchIntegrationData() {
			fetch('https://astro.build/api/v1/dev-overlay/', {
				cache: 'no-cache',
			})
				.then((res) => res.json())
				.then((data) => {
					integrationData = data;
					integrationData.data = integrationData.data.map((integration) => {
						return integration;
					});
					refreshIntegrationList();
				});
		}

		function createCanvas() {
			const links: { icon: Icon; name: string; link: string }[] = [
				{
					icon: 'bug',
					name: 'Report a Bug',
					link: 'https://github.com/withastro/astro/issues/new/choose',
				},
				{
					icon: 'lightbulb',
					name: 'Feedback',
					link: 'https://github.com/withastro/roadmap/discussions/new/choose',
				},
				{
					icon: 'file-search',
					name: 'Documentation',
					link: 'https://docs.astro.build',
				},
				{
					icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 14"><path fill="currentColor" d="M14.3451 1.9072c-1.0375-.47613-2.1323-.81595-3.257-1.010998-.0102-.001716-.0207-.000234-.03.004243s-.017.011728-.022.020757c-.141.249998-.297.576998-.406.832998-1.2124-.18399-2.44561-.18399-3.658 0-.12159-.28518-.25914-.56328-.412-.832998-.00513-.00893-.01285-.016098-.02213-.02056-.00928-.004462-.0197-.00601-.02987-.00444-1.125.193998-2.22.533998-3.257 1.010998-.00888.00339-.0163.00975-.021.018-2.074 3.099-2.643004 6.122-2.364004 9.107.001.014.01.028.021.037 1.207724.8946 2.558594 1.5777 3.995004 2.02.01014.0032.02103.0031.03111-.0003.01007-.0034.01878-.01.02489-.0187.308-.42.582-.863.818-1.329.00491-.0096.0066-.0205.0048-.0312-.00181-.0106-.007-.0204-.0148-.0278-.00517-.0049-.0113-.0086-.018-.011-.43084-.1656-.84811-.3645-1.248-.595-.01117-.0063-.01948-.0167-.0232-.029-.00373-.0123-.00258-.0255.0032-.037.0034-.0074.00854-.014.015-.019.084-.063.168-.129.248-.195.00706-.0057.01554-.0093.02453-.0106.00898-.0012.01813 0 .02647.0036 2.619 1.196 5.454 1.196 8.041 0 .0086-.0037.0181-.0051.0275-.0038.0093.0012.0181.0049.0255.0108.08.066.164.132.248.195.0068.005.0123.0116.0159.0192.0036.0076.0053.016.0049.0244-.0003.0084-.0028.0166-.0072.0238-.0043.0072-.0104.0133-.0176.0176-.399.2326-.8168.4313-1.249.594-.0069.0025-.0132.0065-.0183.0117-.0052.0051-.0092.0114-.0117.0183-.0023.0067-.0032.0138-.0027.0208.0005.0071.0024.0139.0057.0202.24.465.515.909.817 1.329.0061.0087.0148.0153.0249.0187.0101.0034.021.0035.0311.0003 1.4388-.441 2.7919-1.1241 4.001-2.02.0061-.0042.0111-.0097.0147-.0161.0037-.0064.0058-.0135.0063-.0209.334-3.451-.559-6.449-2.366-9.106-.0018-.00439-.0045-.00834-.008-.01162-.0034-.00327-.0075-.00578-.012-.00738Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/></svg>',
					name: 'Community',
					link: 'https://astro.build/chat',
				},
			];

			const hasNewerVersion = (window as DevToolbarMetadata).__astro_dev_toolbar__
				.latestAstroVersion;

			const windowComponent = createWindowElement(
				`<style>
				#buttons-container {
					display: flex;
					gap: 16px;
					justify-content: center;
				}

				#buttons-container astro-dev-toolbar-card {
					flex: 1;
				}

				footer {
					display: flex;
					justify-content: center;
					gap: 24px;
				}

				footer a {
					color: rgba(145, 152, 173, 1);
				}

				footer a:hover {
					color: rgba(204, 206, 216, 1);
				}

				#main-container {
					display: flex;
					flex-direction: column;
					height: 100%;
					gap: 24px;
				}

				p {
					margin-top: 0;
				}

				header {
					display: flex;
					justify-content: space-between;
					align-items: center;
				}

				header section {
					display: flex;
					gap: 0.8em;
				}

				h2 {
					color: white;
					margin: 0;
					font-size: 18px;
				}

				a {
					color: rgba(224, 204, 250, 1);
				}

				a:hover {
					color: #f4ecfd;
				}

				#integration-list-wrapper {
					position: relative;
					--offset: 24px;
					overflow-x: auto;
					overflow-y: hidden;
					margin-left: calc(var(--offset) * -1);
					margin-right: calc(var(--offset) * -1);
					padding-left: var(--offset);
					padding-right: var(--offset);
					height: 210px;
				}

				/* Pseudo-elements to fade cards as they scroll out of viewport */
				#integration-list-wrapper::before,
				#integration-list-wrapper::after {
					content: '';
					height: 192px;
					display: block;
					position: fixed;
					width: var(--offset);
					top: 106px;
					background: red;
				}

				#integration-list-wrapper::before {
					left: -1px;
					border-left: 1px solid rgba(52, 56, 65, 1);
					background: linear-gradient(to right, rgba(19, 21, 26, 1), rgba(19, 21, 26, 0));
				}

				#integration-list-wrapper::after {
					right: -1px;
					border-right: 1px solid rgba(52, 56, 65, 1);
					background: linear-gradient(to left, rgba(19, 21, 26, 1), rgba(19, 21, 26, 0));
				}

				#integration-list-wrapper::-webkit-scrollbar {
					width: 5px;
					height: 8px;
					background-color: rgba(255, 255, 255, 0.08); /* or add it to the track */
					border-radius: 4px;
				}

				/* This is wild but gives us a gap on either side of the container */
				#integration-list-wrapper::-webkit-scrollbar-button:start:decrement,
				#integration-list-wrapper::-webkit-scrollbar-button:end:increment {
					display: block;
					width: 24px;
					background-color: #13151A;
				}

				/* Removes arrows on both sides */
				#integration-list-wrapper::-webkit-scrollbar-button:horizontal:start:increment,
				#integration-list-wrapper::-webkit-scrollbar-button:horizontal:end:decrement {
					display: none;
				}

				#integration-list-wrapper::-webkit-scrollbar-track-piece {
					border-radius: 4px;
				}

				#integration-list-wrapper::-webkit-scrollbar-thumb {
					background-color: rgba(255, 255, 255, 0.3);
					border-radius: 4px;
				}

				#integration-list {
					margin-top: 1em;
					display: flex;
					gap: 16px;
					padding-bottom: 1em;
				}

				#integration-list::after {
					content: " ";
					display: inline-block;
					white-space: pre;
					width: 1px;
					height: 1px;
				}

				#integration-list astro-dev-toolbar-card, .integration-skeleton {
					min-width: 240px;
					height: 160px;
				}

				.integration-skeleton {
					animation: pulse 2s calc(var(--i, 0) * 250ms) cubic-bezier(0.4, 0, 0.6, 1) infinite;
					background-color: rgba(35, 38, 45, 1);
					border-radius: 8px;
				}

				@keyframes pulse {
					0%, 100% {
						opacity: 1;
					}
					50% {
						opacity: .5;
					}
				}

				#integration-list astro-dev-toolbar-card .integration-image {
					width: 40px;
					height: 40px;
					background-color: var(--integration-image-background, white);
					border-radius: 9999px;
					display: flex;
					justify-content: center;
					align-items: center;
					margin-bottom: 8px;
				}

				#integration-list astro-dev-toolbar-card img {
					width: 24px;
					height: 24px;
				}

				#integration-list astro-dev-toolbar-card astro-dev-toolbar-icon {
					width: 24px;
					height: 24px;
					color: #fff;
				}

				#links {
					margin: auto 0;
					display: flex;
					justify-content: center;
					gap: 24px;
				}

				#links a {
					text-decoration: none;
					align-items: center;
					display: flex;
					flex-direction: column;
					gap: 0.7em;
					flex: 1;
					white-space: nowrap;
					font-weight: 600;
					color: white;
				}

				#links a:hover {
					color: rgba(145, 152, 173, 1);
				}

				#links astro-dev-toolbar-icon {
					width: 1.5em;
					height: 1.5em;
					display: block;
				}

				#integration-list astro-dev-toolbar-card svg {
					width: 24px;
					height: 24px;
					vertical-align: bottom;
				}

				#integration-list astro-dev-toolbar-card h3 {
					margin: 0;
					margin-bottom: 8px;
    			color: white;
					white-space: nowrap;
				}

				#integration-list astro-dev-toolbar-card p {
					font-size: 14px;
				}

				@media (forced-colors: active) {
					svg path[fill="#fff"] {
						fill: black;
					}
				}
			</style>

			<header>
				<section>
				${astroLogo}
				<astro-dev-toolbar-badge badge-style="gray" size="large">${
					(window as DevToolbarMetadata).__astro_dev_toolbar__.version
				}</astro-dev-toolbar-badge>
				${
					hasNewerVersion
						? `<astro-dev-toolbar-badge badge-style="green" size="large">${
								(window as DevToolbarMetadata).__astro_dev_toolbar__.latestAstroVersion
							} available!</astro-dev-toolbar-badge>
						`
						: ''
				}
				</section>
				<astro-dev-toolbar-button id="copy-debug-button">Copy debug info <astro-dev-toolbar-icon icon="copy" /></astro-dev-toolbar-button>
			</header>
			<hr />

			<div id="main-container">
				<div>
					<header><h2>Featured integrations</h2><a href="https://astro.build/integrations/" target="_blank">View all</a></header>
						<div id="integration-list-wrapper">
							<section id="integration-list">
								<div class="integration-skeleton" style="--i:0;"></div>
								<div class="integration-skeleton" style="--i:1;"></div>
								<div class="integration-skeleton" style="--i:2;"></div>
								<div class="integration-skeleton" style="--i:3;"></div>
								<div class="integration-skeleton" style="--i:4;"></div>
							</section>
						</div>
				</div>
				<section id="links">
				${links
					.map(
						(link) =>
							`<a href="${link.link}" target="_blank"><astro-dev-toolbar-icon ${
								isDefinedIcon(link.icon) ? `icon="${link.icon}">` : `>${link.icon}`
							}</astro-dev-toolbar-icon>${link.name}</a>`,
					)
					.join('')}
				</section>
			</div>
		`,
			);

			const copyDebugButton =
				windowComponent.querySelector<HTMLButtonElement>('#copy-debug-button');

			copyDebugButton?.addEventListener('click', () => {
				navigator.clipboard.writeText(
					'```\n' + (window as DevToolbarMetadata).__astro_dev_toolbar__.debugInfo + '\n```',
				);
				copyDebugButton.textContent = 'Copied to clipboard!';

				setTimeout(() => {
					resetDebugButton();
				}, 3500);
			});
			canvas.append(windowComponent);

			// If we have integration data, rebuild that part of the UI as well
			// as it probably mean that the user had already open the app in this session (ex: view transitions)
			if (integrationData) refreshIntegrationList();
		}

		function resetDebugButton() {
			const copyDebugButton = canvas.querySelector<HTMLButtonElement>('#copy-debug-button');
			if (!copyDebugButton) return;

			copyDebugButton.innerHTML = 'Copy debug info <astro-dev-toolbar-icon icon="copy" />';
		}

		function refreshIntegrationList() {
			const integrationList = canvas.querySelector<HTMLElement>('#integration-list');

			if (!integrationList) return;
			integrationList.innerHTML = '';

			const fragment = document.createDocumentFragment();
			for (const integration of integrationData.data) {
				const integrationComponent = document.createElement('astro-dev-toolbar-card');
				integrationComponent.link = integration.homepageUrl;

				const integrationContainer = document.createElement('div');
				integrationContainer.className = 'integration-container';

				const integrationImage = document.createElement('div');
				integrationImage.className = 'integration-image';

				if (integration.image) {
					const img = document.createElement('img');
					img.src = integration.image;
					img.alt = integration.title;
					integrationImage.append(img);
				} else {
					const icon = document.createElement('astro-dev-toolbar-icon');
					icon.icon = iconForIntegration(integration);
					integrationImage.append(icon);
					integrationImage.style.setProperty(
						'--integration-image-background',
						colorForIntegration(),
					);
				}

				integrationContainer.append(integrationImage);

				let integrationTitle = document.createElement('h3');
				integrationTitle.textContent = integration.title;
				if (integration.official || integration.categories.includes('official')) {
					integrationTitle.innerHTML +=
						' <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 20"><rect width="19" height="19" x="1.16602" y=".5" fill="url(#paint0_linear_917_1096)" fill-opacity=".33" rx="9.5"/><path fill="#fff" d="M15.139 6.80657c-.062-.06248-.1357-.11208-.217-.14592-.0812-.03385-.1683-.05127-.2563-.05127-.0881 0-.1752.01742-.2564.05127-.0813.03384-.155.08344-.217.14592L9.22566 11.7799 7.13899 9.68657c-.06435-.06216-.14031-.11103-.22355-.14383-.08323-.03281-.17211-.04889-.26157-.04735-.08945.00155-.17773.0207-.25978.05637a.68120694.68120694 0 0 0-.21843.15148c-.06216.06435-.11104.14031-.14384.22355-.0328.08321-.04889.17211-.04734.26161.00154.0894.0207.1777.05636.2597.03566.0821.08714.1563.15148.2185l2.56 2.56c.06198.0625.13571.1121.21695.1459s.16838.0513.25639.0513c.088 0 .17514-.0175.25638-.0513s.15497-.0834.21695-.1459L15.139 7.78657c.0677-.06242.1217-.13819.1586-.22253.0369-.08433.056-.1754.056-.26747 0-.09206-.0191-.18313-.056-.26747-.0369-.08433-.0909-.1601-.1586-.22253Z"/><rect width="19" height="19" x="1.16602" y=".5" stroke="url(#paint1_linear_917_1096)" rx="9.5"/><defs><linearGradient id="paint0_linear_917_1096" x1="20.666" x2="-3.47548" y1=".00000136" y2="10.1345" gradientUnits="userSpaceOnUse"><stop stop-color="#4AF2C8"/><stop offset="1" stop-color="#2F4CB3"/></linearGradient><linearGradient id="paint1_linear_917_1096" x1="20.666" x2="-3.47548" y1=".00000136" y2="10.1345" gradientUnits="userSpaceOnUse"><stop stop-color="#4AF2C8"/><stop offset="1" stop-color="#2F4CB3"/></linearGradient></defs></svg>';
				}
				integrationContainer.append(integrationTitle);

				const integrationDescription = document.createElement('p');
				integrationDescription.textContent =
					integration.description.length > 90
						? integration.description.slice(0, 90) + '…'
						: integration.description;

				integrationContainer.append(integrationDescription);
				integrationComponent.append(integrationContainer);

				fragment.append(integrationComponent);
			}

			integrationList.append(fragment);
		}
	},
} satisfies ResolvedDevToolbarApp;
