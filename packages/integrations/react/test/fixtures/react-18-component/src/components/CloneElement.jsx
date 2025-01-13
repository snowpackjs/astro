import { cloneElement } from 'react';

const ClonedWithProps = (element) => (props) =>
  cloneElement(element, props);

export default ClonedWithProps(<div id="cloned">Cloned With Props</div>);
