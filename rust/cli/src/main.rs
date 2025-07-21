mod todo;

fn main() {
  let args: Vec<String> = std::env::args().collect();
  let todos = todo::core::get_todo_list();

  match args[1].clone().as_str() {
    "create" => todo::create::create_todo(),
    "list" => todo::list::list_todo(&todos),
    _ => {
        println!("unknown command");
    }
  }
}
