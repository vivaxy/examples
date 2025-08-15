use super::core::TodoItem;

pub fn list_todo(todos: &Vec<TodoItem>, title: Option<String>, content: Option<String>) {
  let mut filter = TodoItemFilter::new();

  if let Some(title) = title {
    filter.set_title(title);
  }

  if let Some(content) = content {
    filter.set_content(content);
  }

  filter.filter(todos);
}

pub struct TodoItemFilter {
  pub title: Option<String>,
  pub content: Option<String>,
}

impl TodoItemFilter {
  pub fn new() -> Self {
    Self {
      title: Option::None,
      content: Option::None,
    }
  }

  pub fn set_title<T: Into<String>>(&mut self, title: T) {
    self.title = Some(title.into());
  }

  pub fn set_content<T: Into<String>>(&mut self, content: T) {
    self.content = Some(content.into());
  }

  pub fn filter(&self, list: &Vec<TodoItem>) {
    let mut filtered_list = Vec::<&TodoItem>::new();

    if self.title.is_none() && self.content.is_none() {
      for item in list {
        filtered_list.push(item);
      }
    } else {
      for item in list {
        let mut flag: (bool, bool) = (false, false);

        flag.0 = match &self.title {
          Some(title) => item.title.contains(title),
          _ => true,
        };

        flag.1 = match &self.content {
          Some(content) => item.content.contains(content),
          _ => true,
        };

        if flag.0 && flag.1 {
          filtered_list.push(item);
        }
      }
    }

    for item in filtered_list {
      println!("todo title: {}, content: {}", item.title, item.content);
    }
  }
}
