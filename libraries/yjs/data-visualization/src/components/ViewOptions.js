/**
 * @since 2021-08-14
 * @author vivaxy
 */
import * as VIEW_OPTIONS from '../enums/view-options';

export default function ViewOptions(props) {
  function handleDataSourceChange(e) {
    props.onOptionChange({
      dataSource: e.target.value,
    });
  }

  return (
    <div className="view-options-container">
      <label>Data source:</label>
      {[
        {
          id: VIEW_OPTIONS.DATA_SOURCES.SHARE,
          label: 'Share',
        },
        {
          id: VIEW_OPTIONS.DATA_SOURCES.STORE,
          label: 'Store',
        },
      ].map(function (item) {
        return (
          <span key={item.id}>
            <input
              id={item.id}
              type="radio"
              value={item.id}
              checked={props.options.dataSource === item.id}
              onChange={handleDataSourceChange}
            />
            <label htmlFor={item.id}>{item.label}</label>
          </span>
        );
      })}
    </div>
  );
}
