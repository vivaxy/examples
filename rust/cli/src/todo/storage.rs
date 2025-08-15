use super::core::TodoItem;
use std::fs;

pub fn read_todo_list(save_file: &str) -> Vec<TodoItem> {
  let mut result: Vec<TodoItem> = Vec::new();

  match fs::read_to_string(save_file) {
    Ok(content) => match serde_json::from_str(content.as_str()) {
      Ok(mut list) => result.append(&mut list),
      _ => {
        println!("parse file error");
      }
    },
    _ => {
      println!("read file error");
    }
  }

  if result.len() == 0 {
    result.push(TodoItem::new("learn rust", "read rust book"));
    result.push(TodoItem::new("work", "complete required"));
    result.push(TodoItem::new("play", "play game"));
  }

  return result;
}

pub fn save_todo_list(save_file: &str, todos: &Vec<TodoItem>) -> Result<(), String> {
  let data = serde_json::to_string(todos).map_err(|e| e.to_string())?;
  fs::write(save_file, data).map_err(|e| e.to_string())?;
  Ok(())
}
