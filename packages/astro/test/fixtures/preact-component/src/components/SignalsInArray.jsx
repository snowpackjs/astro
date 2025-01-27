import { h } from 'preact';

export default ({ signalsArray }) => {
  return <div class="preact-signal-array">
		<h1>{signalsArray[0]} {signalsArray[3]}</h1>
		<p>{signalsArray[1].value}-{signalsArray[2].value}-{signalsArray[4].value}</p>
	</div>
}
