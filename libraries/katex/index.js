/**
 * @since 2023-10-17
 * @author vivaxy
 */
const url = new URL(location.href);
url.hostname = 'vivaxy.github.io';
url.port = '80';
url.pathname = '/dev/katex-versions/';
location.href = url.href;
