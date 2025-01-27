import React from 'react';

export default function () {
	const id = React.useId();
  return <p className='react-use-id' id={id}>{id}</p>;
}
