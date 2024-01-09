// build with `g++ without-name-mangling.cpp -o without-name-mangling.out`
// view function name with `nm without-name-mangling.out`
// function name is `_add`
#include <iostream>

extern "C" {
  int add(int x, int y) {
    return x + y;
  }
}

int main() {
  int x = add(0, 1);
  std::cout << x;
  return 0;
}
