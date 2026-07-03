import Header, { reducer as headerReducer } from '../containers/Header';
import Footer, { reducer as footerReducer } from '../containers/Footer';

export default [
  {
    componentClass: Header,
    reducer: headerReducer,
  },
  {
    componentClass: Footer,
    reducer: footerReducer,
  },
];
