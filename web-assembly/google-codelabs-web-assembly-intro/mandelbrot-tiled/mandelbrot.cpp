/*
 * Copyright 2017 Google Inc. All rights reserved.
 *
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

#include <cstddef>
#include <cstdlib>
#include <emscripten/bind.h>

// CSV to RGB conversion from http://stackoverflow.com/questions/3018313/
typedef struct {
  double r; // a fraction between 0 and 1
  double g; // a fraction between 0 and 1
  double b; // a fraction between 0 and 1
} rgb;

typedef struct {
  double h; // angle in degrees
  double s; // a fraction between 0 and 1
  double v; // a fraction between 0 and 1
} hsv;

static rgb hsv2rgb(hsv in);

rgb hsv2rgb(hsv in) {
  double hh, p, q, t, ff;
  long i;
  rgb out;

  if (in.s <= 0.0) { // < is bogus, just shuts up warnings
    out.r = in.v;
    out.g = in.v;
    out.b = in.v;
    return out;
  }
  hh = in.h;
  if (hh >= 360.0)
    hh = 0.0;
  hh /= 60.0;
  i = (long)hh;
  ff = hh - i;
  p = in.v * (1.0 - in.s);
  q = in.v * (1.0 - (in.s * ff));
  t = in.v * (1.0 - (in.s * (1.0 - ff)));

  switch (i) {
  case 0:
    out.r = in.v;
    out.g = t;
    out.b = p;
    break;
  case 1:
    out.r = q;
    out.g = in.v;
    out.b = p;
    break;
  case 2:
    out.r = p;
    out.g = in.v;
    out.b = t;
    break;

  case 3:
    out.r = p;
    out.g = q;
    out.b = in.v;
    break;
  case 4:
    out.r = t;
    out.g = p;
    out.b = in.v;
    break;
  case 5:
  default:
    out.r = in.v;
    out.g = p;
    out.b = q;
    break;
  }
  return out;
}

const int TILE_SIZE = 64;

class Mandelbrot {
private:
  int width;
  int height;
  double zoom;
  double moveX;
  double moveY;

  // generate mandelbrot image in tiles
  int currentTileX = 0;
  int currentTileY = 0;

  // The image buffer handed back to JS for rendering into canvas
  // The image format that imageData expects is four unsigned bytes: red,
  // green, blue, alpha
  uint8_t buffer[TILE_SIZE * TILE_SIZE * 4];

public:
  Mandelbrot(int width, int height, double zoom, double moveX, double moveY)
      : width(width), height(height), zoom(zoom), moveX(moveX), moveY(moveY) {}

  // Mandlebrot definition adapted from
  // http://lodev.org/cgtutor/juliamandelbrot.html

  emscripten::val nextTile() {
    if (this->currentTileY * TILE_SIZE > this->height) {
      // If we have generated all of the tiles, return undefined
      // so that the JS will stop calling us.
      return emscripten::val::undefined();
    }

    // each iteration, it calculates: newz = oldz*oldz + p, where p is the
    // current pixel, and oldz stars at the origin

    // real and imaginary part of the pixel p
    double pr, pi;
    // real and imaginary parts of new and old z
    double newRe, newIm, oldRe, oldIm;
    // the RGB color value for the pixel
    rgb color;
    // after how much iterations the function should stop.
    int maxIterations = 180;

    // Generate a TILE_SIZE x TILE_SIZE array of pixels
    for (int y = this->currentTileY * TILE_SIZE;
         y < (this->currentTileY + 1) * TILE_SIZE; y++) {
      for (int x = this->currentTileX * TILE_SIZE;
           x < (this->currentTileX + 1) * TILE_SIZE; x++) {
        // calculate the initial real and imaginary part of z, based on the
        // pixel location and zoom and position values
        pr = 1.5 * (x - this->width / 2) / (0.5 * this->zoom * this->width) +
             this->moveX;
        pi = (y - this->height / 2) / (0.5 * this->zoom * this->height) +
             this->moveY;
        newRe = newIm = oldRe = oldIm = 0; // these should start at 0,0
        // "i" will represent the number of iterations
        int i;
        // start the iteration process
        for (i = 0; i < maxIterations; i++) {
          // remember value of previous iteration
          oldRe = newRe;
          oldIm = newIm;
          // the actual iteration, the real and imaginary part are calculated
          newRe = oldRe * oldRe - oldIm * oldIm + pr;
          newIm = 2 * oldRe * oldIm + pi;
          // if the point is outside the circle with radius 2: stop
          if ((newRe * newRe + newIm * newIm) > 4)
            break;
        }
        // use color model conversion to get rainbow palette, make brightness
        // black if maxIterations reached
        hsv hsvColor;
        hsvColor.h = i * 2;
        hsvColor.s = 1; // fully saturated.
        hsvColor.v = i < maxIterations;
        color = hsv2rgb(hsvColor);
        // draw the pixel
        size_t bufferOffset =
            ((x - this->currentTileX * TILE_SIZE) +
             (y - this->currentTileY * TILE_SIZE) * TILE_SIZE) *
            4;
        this->buffer[bufferOffset + 0] = color.r * 255;
        this->buffer[bufferOffset + 1] = color.g * 255;
        this->buffer[bufferOffset + 2] = color.b * 255;
        this->buffer[bufferOffset + 3] = 255;
      }
    }

    emscripten::val returnVal = emscripten::val::object();
    returnVal.set("data", emscripten::val(emscripten::typed_memory_view(
                              TILE_SIZE * TILE_SIZE * 4, this->buffer)));
    returnVal.set("width", emscripten::val(TILE_SIZE));
    returnVal.set("height", emscripten::val(TILE_SIZE));
    returnVal.set("x", emscripten::val(this->currentTileX * TILE_SIZE));
    returnVal.set("y", emscripten::val(this->currentTileY * TILE_SIZE));

    // Increment to the next tile
    this->currentTileX++;
    if (this->currentTileX * TILE_SIZE > this->width) {
      this->currentTileX = 0;
      this->currentTileY++;
    }

    return returnVal;
  }
};

EMSCRIPTEN_BINDINGS(hello) {
  emscripten::class_<Mandelbrot>("Mandelbrot")
      .constructor<int, int, double, double, double>()
      .function("nextTile", &Mandelbrot::nextTile);
}
