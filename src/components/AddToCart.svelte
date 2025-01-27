<script>
	import { addToUserCart } from '../api';
	let { id, name } = $props()

	function notifyCartItem(id) {
		window.dispatchEvent(new CustomEvent('add-to-cart', {
			detail: id
		}));
	}

	async function addToCart() {
		await addToUserCart(id, name);
		notifyCartItem(id);
	}
</script>
<style>
	button {
  display:block;
  padding:0.5em 1em 0.5em 1em;
  border-radius:100px;
  border:none;
  font-size: 1.4em;
  position:relative;
  background:#0652DD;
  cursor:pointer;
  height:2em;
  width:10em;
  overflow:hidden;
  transition:transform 0.1s;
  z-index:1;
}
button:hover {
  transform:scale(1.1);
}

.pretext {
  color:#fff;
  background:#0652DD;
  position:absolute;
  top:0;
  left:0;
  height:100%;
  width:100%;
  display:flex;
  justify-content:center;
  align-items:center;
  font-family: 'Quicksand', sans-serif;
	text-transform: uppercase;
}
</style>
<button click={addToCart}>
	<span class="pretext">Add to cart</span>
</button>
