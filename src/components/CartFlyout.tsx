import { useStore } from '@nanostores/preact';
import { cartItems, isCartOpen } from '../cartStore';
import styles from './CartFlyout.module.css';

export default function CartFlyout() {
	const $isCartOpen = useStore(isCartOpen);
	const $cartItems = useStore(cartItems);

	return (
		<aside hidden={!$isCartOpen} className={styles.container}>
			{Object.values($cartItems).length ? (
				<ul className={styles.list} role="list">
					{Object.values($cartItems).map((cartItem) => (
						<li className={styles.listItem}>
							<img className={styles.listItemImg} src={cartItem.imageSrc} alt={cartItem.name} />
							<div>
								<h3>{cartItem.name}</h3>
								<p>Quantity: {cartItem.quantity}</p>
							</div>
						</li>
					))}
				</ul>
			) : (
				<p>Your cart is empty!</p>
			)}
		</aside>
	);
}
