import { useState } from "react";

const Component = () => {
	const [name] = useState('world');
  return <p>Hello {name}</p>;
};

export default Component;
