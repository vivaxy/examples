/**
 * @since 2019-04-23 01:11
 * @author vivaxy
 */

class Control {
  private state: any;
}

interface SelectableControl extends Control {
  select(): void;
}

class Button extends Control implements SelectableControl {
  select() {}
}

class TextBox extends Control {
  select() {}
}

// Class 'Image1' incorrectly implements interface 'SelectableControl'.
// Types have separate declarations of a private property 'state'.
class Image1 implements SelectableControl {
  private state: any;
  select() { }
}

// Class 'Image2' incorrectly implements interface 'SelectableControl'.
// Property 'state' is missing in type 'Image2' but required in type 'SelectableControl'.
class Image2 implements SelectableControl {
  select() { }
}
