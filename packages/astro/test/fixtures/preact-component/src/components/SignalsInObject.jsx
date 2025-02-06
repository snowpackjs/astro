import { h } from 'preact';

export default ({ signalsObject }) => {
  return <div class="preact-signal-object">
		<h1>{signalsObject.title}</h1>
		<p>{signalsObject.counter.value}</p>
	</div>
}
