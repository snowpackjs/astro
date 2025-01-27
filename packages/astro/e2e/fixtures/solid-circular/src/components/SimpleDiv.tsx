import { useContext } from 'solid-js';
import type {Component}	from 'solid-js';
import { ApplicationContext } from './ContextProvider';

export const SimpleDiv: Component = () => {
  const [context] = useContext(ApplicationContext);

  return <div id="context">{context.lng}</div>;
};
