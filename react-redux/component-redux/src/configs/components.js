/**
 * @since 2017-05-12 12:16:12
 * @author vivaxy
 */

import Header, { reducer as  headerReducer } from '../containers/Header';
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
