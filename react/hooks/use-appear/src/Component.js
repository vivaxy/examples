/**
 * @since 2019-07-19 19:13
 * @author vivaxy
 */
import React, { useState } from 'react';
import useAppear from './useAppear';

export default function Component() {
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');

  const [rootRef] = useAppear(function() {
    // console.log('appear');
  });

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleMailChange(e) {
    setMail(e.target.value);
  }

  return (
    <div ref={rootRef}>
      <input type="text" value={name} onChange={handleNameChange} />
      <input type="text" value={mail} onChange={handleMailChange} />
    </div>
  );
}
