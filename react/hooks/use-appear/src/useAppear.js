/**
 * @since 2019-07-19 19:14
 * @author vivaxy
 */
import { useEffect, useRef, useMemo } from 'react';

export default function useAppear(onAppear, options) {
  const ref = useRef(null);

  // todo use single intersectionObserver if newed
  const intersectionObserver = useMemo(
    function() {
      console.log('new intersection');
      return new IntersectionObserver(function(entries) {
        if (entries.length > 1) {
          console.error('entries', entries);
        }
        if (entries[0].isIntersecting) {
          onAppear();
        }
      }, options);
    },
    [options],
  );

  useEffect(function() {
    intersectionObserver.observe(ref.current);
    return function() {
      intersectionObserver.unobserve(ref.current);
    };
  }, []);

  return [ref];
}
