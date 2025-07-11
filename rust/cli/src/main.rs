fn main() {
  let args: Vec<String> = std::env::args().collect();
  let title = args[1].clone();
  let content = args[2].clone();
  println!("todo title: {}, content: {}", title, content);
}
