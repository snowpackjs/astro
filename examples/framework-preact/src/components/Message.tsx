import type { ComponentChildren } from 'preact';
import './Message.css';

export default function Message({ children }: { children: ComponentChildren }) {
	return <div class="message">{children}</div>;
}
