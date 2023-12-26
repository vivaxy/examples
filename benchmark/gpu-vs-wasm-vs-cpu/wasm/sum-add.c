int sumAdd(int* array, int index) {
  int sum = array[index];
  for (int i = 0; i < 10240; i++) {
    sum += array[i];
  }
  return sum;
}
