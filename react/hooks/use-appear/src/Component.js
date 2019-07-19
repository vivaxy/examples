/**
 * @since 2019-07-19 19:13
 * @author vivaxy
 */
import React from 'react';
import useAppear from './useAppear';

export default function Component() {
  const [ref1] = useAppear(function() {
    console.log('appear 1');
  });

  const [ref2] = useAppear(function() {
    console.log('appear 2');
  });

  return (
    <div>
      <div className="item" ref={ref1} />
      <div className="placeholder" />
      <div className="placeholder" />
      <div className="placeholder" />
      <div className="placeholder" />
      <div className="placeholder" />
      <div className="placeholder" />
      <div className="placeholder" />
      <div className="item" ref={ref2} />
    </div>
  );
}
