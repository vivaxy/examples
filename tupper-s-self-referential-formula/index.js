/**
 * @since 2023-08-06
 * @author vivaxy
 */
// import * as tuppersSelfReferentialFormula from './formulas/tupper-s-self-referential-formula.js';
import * as simple from './formulas/simple.js';
import { draw } from './draw-canvas.js';

draw(simple.formula, simple.minX, simple.xLength, simple.minY, simple.yLength);
