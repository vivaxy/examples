interface IUser {
  name: string;
  job?: string;
  [propName: string]: any;
}

const person: IUser = {
  name: 'vivaxy',
};
