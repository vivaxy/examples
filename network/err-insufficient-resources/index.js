function request(url) {
  fetch(url, {
    mode: 'no-cors',
  });
}

for (let i = 0; i < 1000; i++) {
  request(`https://www.baidu.com/`);
  request(`https://www.qq.com/`);
  request(`https://www.meituan.com/`);
  request(`https://www.hao123.com/`);
  request(`https://www.sina.com.cn/`);
  request(`https://weibo.com/`);
  request(`https://www.sohu.com/`);
  request(`https://www.163.com/`);
  request(`https://www.126.com/`);
  console.log(i);
}
