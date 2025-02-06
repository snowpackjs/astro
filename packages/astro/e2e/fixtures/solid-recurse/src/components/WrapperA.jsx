import Counter from './Counter';

export default function WrapperA(props) {
  return (
    // removing the div avoids the error
    <div data-wrapper-a-root>
      <Counter id={props.id} type="A"></Counter>
    </div>
  );
}
