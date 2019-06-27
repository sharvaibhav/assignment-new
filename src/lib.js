import _ from 'lodash';

export function formatGraphData(data){
    const  summedArray  = _(data)
        .groupBy('category')
        .map((objs, key) => ({
        'category': key,
        'total': _.sumBy(objs, 'value'),
        'user': _.sumBy(objs, function(o) { return o.user + ', '; })
        })).value();
    const sumTotal = summedArray.reduce(function(prev, cur) {
        return prev + cur.total;
      }, 0)

    const categoryMap = _.keyBy(summedArray,'category')
    return {sumTotal, categoryMap, summedArray}
}

export function dataMatcher(lookup, key){
    let xkey = myMatcher(key,0.1);
    if(lookup[xkey]){
        const data = lookup[xkey];
        return data.user
    }
    return '';
}

function myMatcher(number,pad){
    let n = Math.round(number);
    let n1 = n + pad;
    let n2 = n - pad;
    if(number > n2 && number < n1){
        return n;
    }
    return '';
}