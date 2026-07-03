import Buttons from './Buttons';
import Options from './Options';

export default function Actions(props) {
  return (
    <div className="actions-container">
      <Buttons onOpenDoc={props.onOpenDoc} />
      <Options options={props.options} onOptionChange={props.onOptionChange} />
    </div>
  );
}
