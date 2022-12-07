/**
 * @since 2022-12-07 07:12
 * @author vivaxy
 */
document.getElementById('button').addEventListener('click', function () {
  document
    .getElementById('iframe')
    .contentWindow.window.postMessage('run-long-task', '*');
});

const po = new PerformanceObserver(function (list) {
  list.getEntries().forEach((entry) => {
    if (entry.entryType === 'longtask') {
      console.log(
        'entryType',
        entry.entryType,
        'name',
        entry.name,
        'duration',
        entry.duration,
        'startTime',
        entry.startTime,
        'attribution',
        entry.attribution
          .map((i) => {
            return [
              `name: ${i.name}`,
              `containerType: ${i.containerType}`,
              `containerSrc: ${i.containerSrc}`,
              `containerId: ${i.containerId}`,
              `containerName: ${i.containerName}`,
              `duration: ${i.duration}`,
              `entryType: ${i.entryType}`,
            ].join(', ');
          })
          .join('; '),
      );
    }
  });
});
po.observe({ entryTypes: ['longtask'] });

const root = document.getElementById('root');
let i = 0;
function update() {
  requestAnimationFrame(function () {
    root.innerHTML = i;
    i++;
    update();
  });
}

update();

console.log(
  'Visit http://localhost:3456/index.html to disable `Origin-Agent-Cluster`',
);
console.log(
  'Visit http://127.0.0.1:3456/index.html to enable `Origin-Agent-Cluster`',
);
