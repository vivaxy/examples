import React, { useState } from 'react';
import Component from './Component';

export default function App() {
  const [mount, setMount] = useState(true);

  function handleMountClick() {
    setMount(!mount);
  }

  return (
    <>
      {mount && <Component />}
      <button onClick={handleMountClick}>{mount ? 'unmount' : 'mount'}</button>
    </>
  );
}
