gcc -shared -fPIC \
  -I"$JAVA_HOME/include" \
  -I"$JAVA_HOME/include/darwin" \
  native.c \
  -Ltarget/release -ldemo \
  -o libdemo.dylib
