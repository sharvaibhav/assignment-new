import React, {Component} from 'react';
import './App.css';
import data from './data'; 
import Linechart from "./components/line-chart"
import { formatGraphData } from "./lib";
import _ from 'lodash'

export default class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      formattedData: {},
      sortedData : [],
      dataFormattedFlag : false,
      sumTotal: 0,
      summedArray: []
    }
  }

  componentDidMount(){
    const {sumTotal, categoryMap, summedArray} = formatGraphData(data);
    const sortedData = _.sortBy(data, ['category']);
    this.setState({formattedData:categoryMap,sortedData:sortedData, dataFormattedFlag:true, sumTotal: sumTotal, summedArray: summedArray})
  }

  render(){
    const {sortedData, formattedData, dataFormattedFlag, sumTotal, summedArray} = this.state;
    return (
      <div className="App">
        <div>
          {dataFormattedFlag && <Linechart data = {sortedData} formattedData={formattedData} sumTotal = {sumTotal} summedArray={summedArray} />}
        </div>
      </div>
    );
  }

  
}
