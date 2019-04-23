/**
 * @since 2019-04-23 07:08
 * @author vivaxy
 */
class PointOfUsingAClassAsAnInterface {
  x: number;
  y: number;
}

interface Point3dOfUsingAClassAsAnInterface
  extends PointOfUsingAClassAsAnInterface {
  z: number;
}

const point3dOfUsingAClassAsAnInterface: Point3dOfUsingAClassAsAnInterface = {
  x: 1,
  y: 2,
  z: 3,
};
const pointOfUsingAClassAsAnInterface: PointOfUsingAClassAsAnInterface = {
  x: 1,
  y: 2,
};
