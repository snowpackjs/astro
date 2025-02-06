import { useState } from "react";

export function useSpecialState(initialState) {
  return useState(initialState);
}
