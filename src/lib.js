import _ from 'lodash';

export function formatGraphData(data){
    let total = 0;
    const  summedArray  = _(data)
        .groupBy('category')
        .map((objs, key) => ({
        'category': key,
        'total': _.sumBy(objs, 'value'),
        'user': _.sumBy(objs, function(o) { return o.user + '-'; })
        })).value();
    const sumTotal = summedArray.reduce(function(prev, cur) {
        return prev + cur.total;
      }, 0)

    const categoryMap = _.keyBy(summedArray,'category')
    return {sumTotal, categoryMap, summedArray}
}