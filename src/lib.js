import _ from 'lodash';
import * as d3 from "d3";

export function formatGraphData(data){
    let total = 0;
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

export function dataMatcher(lookup, key,yVal){
    const format = d3.format(",.1f");
    let xkey = myMatcher(key,0.15);
    let ykey = format(yVal);
    if(lookup[xkey]){
        debugger;
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