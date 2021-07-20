/**
 * @since 2021-07-13
 * @author vivaxy
 */
import Buttons from './Actions/Buttons';
import Options from './Actions/Options';

export default function Actions(props) {
  return (
    <div className="actions-container">
      <Buttons onOpenDoc={props.onOpenDoc} />
      <Options options={props.options} onOptionChange={props.onOptionChange} />
    </div>
  );
}
