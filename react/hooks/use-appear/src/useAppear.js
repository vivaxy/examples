/**
 * @since 2019-07-19 19:14
 * @author vivaxy
 */
import { useEffect, useRef } from 'react';

export default function useAppear(fn) {
  const ref = useRef(null);

  useEffect(function() {
    console.log('mount');
    return function() {
      console.log('unmount');
    };
  }, []);

  return [ref];
}
