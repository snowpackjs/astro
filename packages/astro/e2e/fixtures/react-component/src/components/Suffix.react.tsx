import React, { useState } from 'react';

export default function () {
  const [open, setOpen] = useState(false);
  return (
    <button id="suffix" onClick={() => setOpen(!open)}>
      suffix toggle {open.toString()}
    </button>
  );
}
