import { useState } from "react";

export default function BrokenComponent() {
  useState(0);
  a;

  return <p>Whoops!</p>;
};
