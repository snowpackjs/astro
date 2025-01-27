import React from 'react';

export default function ({ name, unused }) {
  return <h2 id={`react-${name}`}>Hello {name}!</h2>;
}
