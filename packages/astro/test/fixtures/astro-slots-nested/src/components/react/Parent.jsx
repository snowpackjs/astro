import { useEffect, useState } from 'react';

export default function Parent({ children }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    console.log('mount');
  }, []);

  return (
    <>
      <p>
        <input type="checkbox" value={show} onChange={() => setShow(!show)} />
        Toggle show (true should show "Inner")
      </p>
      {show ? children : 'Nothing'}
    </>
  );
}
