use super::core::TodoItem;

pub fn list_todo(todos: &Vec<TodoItem>) {
  for todo in todos {
    println!("todo title: {}, content: {}", todo.title, todo.content);
  }
}
