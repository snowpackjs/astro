import Counter from './Counter';

export default function WrapperB(props) {
  return (
    <div id={props.id}>
      {/* Reversing the order of these avoids the error: */}
      <div data-wrapper-children>{props.children}</div>
      <Counter id={props.id} type="B"></Counter>
    </div>
  );
}
