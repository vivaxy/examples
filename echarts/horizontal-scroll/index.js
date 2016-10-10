/**
 * @since 2016-10-10 12:16
 * @author vivaxy
 */

var element = document.querySelector('.js-chart');
var myChart = echarts.init(element);

myChart.showLoading();

fetch('data.json')
    .then((response) => {
        return response.json();
    })
    .then((jsonData) => {

        myChart.hideLoading();

        var maxRank = Math.max.apply(Math, jsonData.before.concat(jsonData.after)) + 10;

        var option = {
            tooltip: {
                trigger: 'item'
            },
            grid: {
                top: '12%',
                left: '1%',
                right: '10%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    data: jsonData.dates
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    name: 'rank',
                    axisLabel: {
                        formatter: function (rank) {
                            return maxRank - rank;
                        }
                    },
                    min: 1,
                    max: maxRank,
                }
            ],
            dataZoom: [
                {
                    type: 'slider',
                    zoomLock: true,
                    startValue: 0,
                    endValue: 15,
                    handleSize: 0,
                    showDetail: false,
                    dataBackground: {
                        lineStyle: {
                            opacity: 0,
                        },
                        areaStyle: {
                            opacity: 0,
                        },
                    },
                    filterMode: 'empty',
                },
            ],
            series: [
                {
                    name: '推广前',
                    type: 'bar',
                    data: jsonData.before.map((item) => {
                        return maxRank - item;
                    })
                },
                {
                    name: '推广后',
                    type: 'bar',
                    data: jsonData.after.map((item) => {
                        return maxRank - item;
                    })
                }
            ],
            animation: false,
        };

        myChart.setOption(option);
    });
