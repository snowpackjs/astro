export default function ReactComp({ foo }: { foo: { bar: { baz: string[] } } }) {
    return (
      <div>
        React Comp
        {foo.bar.baz.length}
      </div>
    );
}
