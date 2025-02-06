import {useState} from "react";

export default function Foo() {
  const [bar, setBar] = useState("Baz");
  return <div className="main-component">{bar}</div>
}