import React, { Suspense } from 'react';
const LazyComponent = React.lazy(() => import('./LazyComponent.jsx'));

export const ParentComponent = () => {
  return (
    <div id="outer">
      <Suspense>
        <LazyComponent />
      </Suspense>
    </div>
  );
};

export default ParentComponent;
