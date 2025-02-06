import { h } from 'preact';

export default ({ nullProp }) => {
  return <div id="preact-component-with-null-prop">
		<p>I have a null prop: {nullProp}</p>
	</div>
}