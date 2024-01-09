// build with `g++ with-name-mangling.cpp -o with-name-mangling.out`
// view function name with `nm with-name-mangling.out`
// function name is `__Z3addii`
#include <iostream>

int add(int x, int y) {
  return x + y;
}

int main() {
  int x = add(0, 1);
  std::cout << x;
  return 0;
}
