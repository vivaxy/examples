function request(url) {
  return fetch(url, {
    mode: 'no-cors',
  });
}

const HOSTS = [
  'https://www.baidu.com/',
  'https://www.qq.com/',
  'https://www.meituan.com/',
  'https://www.hao123.com/',
  'https://www.sina.com.cn/',
  'https://weibo.com/',
  'https://www.sohu.com/',
  'https://www.163.com/',
  'https://www.126.com/',
  'https://www.dianping.com/',
];

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', async function (e) {
    const p = [];
    const { hosts, loops } = e.target.dataset;
    console.log(`${hosts} Hosts * ${loops} Loops start.`);

    let t = 0;
    let failed = false;
    for (let i = 0; i < loops; i++) {
      for (let h = 0; h < hosts; h++) {
        const req = async () => {
          try {
            await request(HOSTS[h]);
          } catch (e) {
            if (!failed) {
              failed = true;
              console.error('First fail at ' + t);
            }
          } finally {
            t++;
          }
        };
        p.push(req());
      }
    }
    await Promise.all(p);
    console.log(`${hosts} Hosts * ${loops} Loops finish.`);
  });
});
