/**
 * @since 2025-07-21 13:41
 * @author vivaxy
 */
use clap::Subcommand;
use serde::{Deserialize, Serialize};
use serde_json;

#[derive(Deserialize, Serialize)]
pub struct TodoItem {
  pub title: String,
  pub content: String,
}

#[derive(Debug, Clone, Subcommand)]
pub enum TodoCommand {
  /// Create a new todo item
  Create {
    #[arg(short, long)]
    title: Option<String>,
    #[arg(short, long)]
    content: Option<String>,
  },
  /// List all todo items
  List {
    #[arg(short, long)]
    title: Option<String>,
    #[arg(short, long)]
    content: Option<String>,
  },
}

pub fn create_todo_item(title: &str, content: &str) -> TodoItem {
  TodoItem {
    title: title.to_string(),
    content: content.to_string(),
  }
}
pub trait Serializer
where
  Self: Sized + Serialize + for<'a> Deserialize<'a>,
{
  fn serialize(&self) -> String {
    serde_json::to_string(self).unwrap()
  }
  fn deserialize<S: Into<String>>(s: S) -> Self {
    serde_json::from_str(&s.into()).unwrap()
  }
}

impl TodoItem {
  pub fn new(title: &str, content: &str) -> Self {
    create_todo_item(title, content)
  }
}

impl Serializer for TodoItem {}

pub fn get_todo_list() -> Vec<TodoItem> {
  let mut todos: Vec<TodoItem> = Vec::new();

  todos.push(create_todo_item("learn rust", "read rust book"));
  todos.push(create_todo_item("work", "complete required"));
  todos.push(create_todo_item("play", "play game"));

  return todos;
}
