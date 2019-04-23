/**
 * @since 2019-04-23 11:47
 * @author vivaxy
 */
interface IUser {
  name: string;
  job?: string;
  [propName: string]: any;
}

const person: IUser = {
  name: 'vivaxy'
}
