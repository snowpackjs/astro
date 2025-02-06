import React from 'react';

export default function({ id, attr }) {
  return <span id={id} attr={`attr-${attr}`} type={typeof attr}></span>
}