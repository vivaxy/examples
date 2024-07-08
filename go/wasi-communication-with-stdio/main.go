package main

import (
    "fmt"
    "io"
    "os"
)

func main() {
    // Read the data on stdin (from host)
    data, _ := io.ReadAll(os.Stdin)

    // Send data on stdout (like a return value for the host)
    fmt.Println("👋 Data from Node.js:", "👋", string(data), "🌍")

    // Send data on stderr
    println("🤬 oups I did it again!")
}
