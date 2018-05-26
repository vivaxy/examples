/**
 * @since 20180521 10:09
 * @author vivaxy
 */

export default class Query {
  constructor({ params }) {

    const url = new URL(location.href);
    const searchParams = url.searchParams;

    params.forEach((param) => {
      this[param.name] = param.format(searchParams.get(param.name));
    });

  }
};
