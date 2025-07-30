use crate::todo::storage::{ read_todo_list, save_todo_list };

mod todo;

fn main() {
  let args: Vec<String> = std::env::args().collect();
  let save_file = "todos.json";
  let mut todos = read_todo_list(save_file);

  match args[1].clone().as_str() {
    "create" => todo::create::create_todo(&mut todos),
    "list" => todo::list::list_todo(&todos),
    _ => {
        println!("unknown command");
    }
  }

  save_todo_list(save_file, &todos);
}
