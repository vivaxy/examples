import editor from './editor';
import timeline from './Timeline';
import './index.css';

editor.init(
  {
    $editor: document.getElementById('editor'),
    $content: document.getElementById('content'),
  },
  {
    onSteps,
  },
);
timeline.init({
  $root: document.getElementById('root'),
});

function onSteps(steps) {
  timeline.appendSteps(steps);
}
