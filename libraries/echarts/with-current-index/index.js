/**
 * @since 2016-09-28 20:38
 * @author vivaxy
 */

var currentIndex = 0;
var indexPanel = document.querySelector('.js-index-panel');

var updateAxisPointer = function() {
  var _series = option.series[0];
  _series.markLine = {
    data: [
      {
        xAxis: currentIndex,
      },
    ],
    symbolSize: 0,
    lineStyle: {
      normal: {
        type: 'solid',
      },
      emphasis: {
        width: 1,
      },
    },
    silent: true,
  };
  myChart.setOption(option);
};

var option = {
  title: {
    text: '折线图堆叠',
  },
  tooltip: {
    trigger: 'axis',
    // alwaysShowContent: true,
    formatter: function(params, ticket, callback) {
      if (params.length) {
        var index = params.map(function(pa) {
          return pa.dataIndex;
        })[0];
        if (currentIndex !== index) {
          currentIndex = index;
          updateAxisPointer();
          indexPanel.innerHTML = 'currentIndex: ' + currentIndex;
          return '提示框' + index;
        }
      }
      console.log('only goes through formatter once, if index changed');
    },
    axisPointer: {
      lineStyle: {
        width: 0,
      },
    },
  },
  legend: {
    data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎'],
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '邮件营销',
      type: 'line',
      stack: '总量',
      data: [120, 132, 101, 134, 90, 230, 210],
    },
    {
      name: '联盟广告',
      type: 'line',
      stack: '总量',
      data: [220, 182, 191, 234, 290, 330, 310],
    },
    {
      name: '视频广告',
      type: 'line',
      stack: '总量',
      data: [150, 232, 201, 154, 190, 330, 410],
    },
    {
      name: '直接访问',
      type: 'line',
      stack: '总量',
      data: [320, 332, 301, 334, 390, 330, 320],
    },
    {
      name: '搜索引擎',
      type: 'line',
      stack: '总量',
      data: [820, 932, 901, 934, 1290, 1330, 1320],
    },
  ],
};

// 基于准备好的dom，初始化echarts实例
var element = document.querySelector('.js-chart');
var myChart = echarts.init(element);

// 使用刚指定的配置项和数据显示图表。
myChart.setOption(option);

element.addEventListener('mouseout', function() {
  updateAxisPointer();
});
