import React, { useEffect, useState, useRef } from 'react';

window.ref = null;

function useAppear(fn) {
  window.ref = useRef(null);

  let mounted = false;

  useEffect(function() {
    if (!mounted) {
      console.log('mount');
      mounted = true;
    }
    return function() {
      if (mounted) {
        console.log('unmount');
        mounted = false;
      }
    };
  });

  console.log(window.ref);
  return [window.ref];
}

export default function App() {
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');

  useEffect(
    function() {
      console.log('effect');
    },
    [name],
  );

  const [rootRef] = useAppear(function() {});

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleMailChange(e) {
    setMail(e.target.value);
  }

  return (
    <div className="App" ref={rootRef}>
      <input type="text" value={name} onChange={handleNameChange} />
      <input type="text" value={mail} onChange={handleMailChange} />
    </div>
  );
}
