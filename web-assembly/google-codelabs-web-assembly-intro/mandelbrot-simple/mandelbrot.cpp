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

#include <emscripten/bind.h>
#include <cstddef>
#include <cstdlib>

// CSV to RGB conversion from http://stackoverflow.com/questions/3018313/
typedef struct
{
	double r; // a fraction between 0 and 1
	double g; // a fraction between 0 and 1
	double b; // a fraction between 0 and 1
} rgb;

typedef struct
{
	double h; // angle in degrees
	double s; // a fraction between 0 and 1
	double v; // a fraction between 0 and 1
} hsv;

static rgb hsv2rgb(hsv in);

rgb hsv2rgb(hsv in)
{
	double hh, p, q, t, ff;
	long i;
	rgb out;

	if (in.s <= 0.0)
	{ // < is bogus, just shuts up warnings
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

	switch (i)
	{
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

uint8_t *buffer = nullptr;
size_t bufferSize = 0;

// Mandlebrot definition from http://lodev.org/cgtutor/juliamandelbrot.html

emscripten::val mandelbrot(int w, int h, double zoom, double moveX, double moveY)
{
	if (buffer != nullptr)
	{
		free(buffer);
	}

	// The image format that imageData expects is four unsigned bytes: red, green, blue, alpha
	bufferSize = w * h * 4;
	buffer = (uint8_t *)malloc(bufferSize);
	if (buffer == nullptr)
	{
		// Following the JavaScript idiom that undefined is error
		return emscripten::val::undefined();
	}

	// each iteration, it calculates: newz = oldz*oldz + p, where p is the current pixel, and oldz stars at the origin
	double pr, pi;										 // real and imaginary part of the pixel p
	double newRe, newIm, oldRe, oldIm; // real and imaginary parts of new and old z
	rgb color;												 // the RGB color value for the pixel
	int maxIterations = 360;					 // after how much iterations the function should stop. Chosen to make take up full HSV hue range.

	// loop through every pixel
	for (int y = 0; y < h; y++)
		for (int x = 0; x < w; x++)
		{
			// calculate the initial real and imaginary part of z, based on the pixel location and zoom and position values
			pr = 1.5 * (x - w / 2) / (0.5 * zoom * w) + moveX;
			pi = (y - h / 2) / (0.5 * zoom * h) + moveY;
			newRe = newIm = oldRe = oldIm = 0; //these should start at 0,0
			// "i" will represent the number of iterations
			int i;
			// start the iteration process
			for (i = 0; i < maxIterations; i++)
			{
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
			// use color model conversion to get rainbow palette, make brightness black if maxIterations reached
			hsv hsvColor;
			hsvColor.h = i;
			hsvColor.s = 1; // fully saturated.
			hsvColor.v = i < maxIterations;
			color = hsv2rgb(hsvColor);
			//draw the pixel
			size_t bufferOffset = (x + y * w) * 4;
			buffer[bufferOffset + 0] = color.r * 255;
			buffer[bufferOffset + 1] = color.g * 255;
			buffer[bufferOffset + 2] = color.b * 255;
			buffer[bufferOffset + 3] = 255;
		}

	return emscripten::val(emscripten::typed_memory_view(bufferSize, buffer));
}

EMSCRIPTEN_BINDINGS(hello)
{
	emscripten::function("mandelbrot", &mandelbrot);
}
