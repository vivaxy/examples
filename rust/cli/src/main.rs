fn main() {
    let mut todos: Vec<String> = Vec::new();
    todos.push(String::from("learn rust"));
    todos.push(String::from("work"));
    todos.push(String::from("play"));

    let args: Vec<String> = std::env::args().collect();

    match args[1].clone().as_str() {
      "create" => {
            let mut inputs: Vec<String> = Vec::new();
            let mut ok = true;

            while ok {
                let len = inputs.len();

                if len == 0 {
                    println!("Please input todo title");

                    let mut title = String::new();

                    std::io::stdin()
                        .read_line(&mut title)
                        .expect("read line failed");

                    if title.is_empty() {
                        continue;
                    }

                    inputs.push(title.trim().to_string());
                } else if len == 1 {
                    println!("Please input todo content");

                    let mut content = String::new();

                    std::io::stdin()
                        .read_line(&mut content)
                        .expect("read line failed");

                    if content.is_empty() {
                        continue;
                    }

                    inputs.push(content.trim().to_string());
                } else {
                    println!("title:   [{}]", inputs[0].clone());
                    println!("content: [{}]", inputs[1].clone());
                    println!("Are you sure to create this todo? (y/n)");

                    let mut sure = String::new();

                    std::io::stdin()
                        .read_line(&mut sure)
                        .expect("read line failed");

                    if sure.trim().to_lowercase() != "n" {
                        ok = false;
                    } else {
                        inputs.clear();
                    }
                }
            }

            let title = inputs[0].clone();
            let content = inputs[1].clone();

            println!("create todo title: {}, content: {}", title, content);
        }

        "list" => {
            for todo in &todos {
                println!("{}", todo);
            }
        }

        _ => {
          println!("unknown command {}", args[1].clone());
        }
    }
}
