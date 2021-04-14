/*
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

typedef unsigned char byte;

#define DIM 100
#define SIZE ((DIM + 2) * (DIM + 2) / 8)  // byte size

static byte boardA[SIZE], boardB[SIZE];
static byte *board = (byte *) &boardA;

// Gets the cell on the default board.
byte get_cell(int x, int y) {
  int pos = (y * (DIM + 2)) + x;
  int i = pos / 8;
  byte off = 1 << (pos % 8);
  return board[i] & off;
}

// Sets a cell on a board.
void set_cell_ref(byte *b, int x, int y) {
  int pos = (y * (DIM + 2)) + x;
  int i = pos / 8;
  byte off = 1 << (pos % 8);
  b[i] |= off;
}

// Clears a board.
void clear_board_ref(byte *b) {
  for (int i = 0; i < SIZE; ++i) {
    b[i] = 0;
  }
}

// Steps through one iteration of Conway's Game of Life. Returns the number of now alive cells, or
// -1 if no cells changed this iteration: i.e., stable game.
int board_step() {
  int total_alive = 0;
  int change = 0;

  // place output in A/B board
  byte *next = (byte *) &boardA;
  if (board == next) {
    next = (byte *) &boardB;
  }
  clear_board_ref(next);

  for (int x = 1; x <= DIM; ++x) {
    for (int y = 1; y <= DIM; ++y) {
      byte alive = get_cell(x, y);
      byte out = 0;

      int count = 0;
      for (int off = 0; off < 9; ++off) {
        if (off == 4) { continue; }  // this is 'us'

        int dx = (off % 3) - 1;
        int dy = (off / 3) - 1;

        if (!get_cell(x + dx, y + dy)) { continue; }
        if (++count > 3) { break; }
      }

      if (count == 3 || (count == 2 && alive)) {
        out = 1;
      }
      if (out) {
        set_cell_ref(next, x, y);  // TODO: hold onto index, pass around?
        ++total_alive;
      }
      if (out != alive) {
        ++change;
      }
    }
  }

  board = next;
  if (change == 0) {
    return -1;  // we're stable
  }
  return total_alive;
}

// Count the total number of alive cells.
int board_count() {
  int count = 0;
  for (int i = 0; i < SIZE; ++i) {
    byte v = board[i];
    while (v) {
      count += v & 1;
      v >>= 1;
    }
  }
  return count;
}

// Returns the pointer location of the rendered board.
byte *board_ref() {
  return board;
}

// Clears the board.
void board_init() {
  clear_board_ref(board);

  // TODO: dummy board setup
  board[85] = 255;
  board[120] = 255;
  board[132] = 255;
  board[800] = 255;
  board[720] = 254;
  board[700] = 255;
  board[600] = 255;
  board[601] = 255;
  board[602] = 255;
  board[603] = 255;
  board[604] = 255;
  board[605] = 255;
  board[606] = 255;
}

