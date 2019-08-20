/**
 * @since 2018-04-22 09:27:13
 * @author vivaxy
 */
const params = [
  {
    name: 'interval',
    format(input) {
      const value = Number(input);
      if (Number.isNaN(value)) {
        return this.defaultValue;
      }
      if (value < 0) {
        return this.defaultValue;
      }
      return value;
    },
    defaultValue: 1000,
  },
  {
    name: 'length',
    format(input) {
      const value = Number(input);
      if (Number.isNaN(value)) {
        return this.defaultValue;
      }
      if (value <= 0) {
        return this.defaultValue;
      }
      return value;
    },
    defaultValue: 10,
  },
];

const url = new URL(location.href);
const searchParams = url.searchParams;
export default params.reduce((props, param) => {
  return { ...props, [param.name]: param.format(searchParams.get(param.name)) };
}, {});
