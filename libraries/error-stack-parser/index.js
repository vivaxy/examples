/**
 * @since 2023-11-23
 * @author vivaxy
 */
const url = new URL(location.href);
const targetURL = new URL('https://vivaxy.github.io/dev/error-stack-parser/');
targetURL.search = url.search;
location.href = targetURL.href;
