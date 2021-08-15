/**
 * @since 2021-08-15
 * @author vivaxy
 */
import { useState } from 'react';
import './index.css';

function Collapse(props) {
  return (
    <span
      className={`collapse ${props.collapsed ? 'collapsed' : ''}`}
      onClick={props.onClick}
    />
  );
}

function ValueString(props) {
  return <span className="value string">"{props.string}"</span>;
}

function ValueNumber(props) {
  return <span className="value number">{props.number}</span>;
}

function ValueBoolean(props) {
  return <span className="value boolean">{props.boolean}</span>;
}

function ValueNull(props) {
  return <span className="value null">{props.value}</span>;
}

function ValueObject(props) {
  const [collapsed, setCollapsed] = useState(true);

  function handleCollapseClick() {
    setCollapsed(!collapsed);
  }

  const keys = Object.keys(props.object);
  return (
    <span className="value object">
      <span className="object-description">
        <Collapse collapsed={collapsed} onClick={handleCollapseClick} />
        <span className="description">{`Object()`}</span>
      </span>
      {!collapsed &&
        keys.map(function (key) {
          return (
            <div className="object-item" key={key}>
              <span className="object-key">{key}</span>
              <span>:</span>
              <span className="object-value">
                <Value value={props.object[key]} />
              </span>
            </div>
          );
        })}
    </span>
  );
}

function ValueArray(props) {
  const [collapsed, setCollapsed] = useState(true);

  function handleCollapseClick() {
    setCollapsed(!collapsed);
  }

  return (
    <div className="value array">
      <div className="array-description">
        <Collapse collapsed={collapsed} onClick={handleCollapseClick} />
        <span>{`Array(${props.array.length})`}</span>
      </div>
      {!collapsed &&
        props.array.map(function (item, index) {
          return (
            <div className="array-item" key={index}>
              <span className="array-key">{index}</span>
              <span>:</span>
              <span className="array-value">
                <Value value={props.array[index]} />
              </span>
            </div>
          );
        })}
    </div>
  );
}

export default function Value(props) {
  if (typeof props.value === 'string') {
    return <ValueString string={props.value} />;
  }
  if (typeof props.value === 'number') {
    return <ValueNumber number={props.value} />;
  }
  if (typeof props.value === 'boolean') {
    return <ValueBoolean boolean={props.value} />;
  }
  if (props.value === null || props.value === undefined) {
    return <ValueNull value={props.value} />;
  }
  if (Array.isArray(props.value)) {
    return <ValueArray array={props.value} />;
  }
  return <ValueObject object={props.value} />;
}
