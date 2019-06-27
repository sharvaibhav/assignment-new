import React,{Component} from 'react';
import * as d3 from "d3";
import "./style.css";
import _ from 'lodash';
import {  dataMatcher} from "../lib.js";

export default class Linechart extends Component{
    constructor(props){
        super(props);
        this.updateScales();
        this.chartRef = React.createRef();
    }

    /**
     * Line Drawing function.
     */
    line = d3.line().x(d=>this.scalex(d.category)).y(d=> {
        const {sumTotal} = this.props;
        const {total} = d;
        return this.scaleY((total/sumTotal)*100)
    });

    line2 = d3.line().x(d=>this.scalex2(d.category)).y(d=> {
        const {sumTotal} = this.props;
        const {total} = d;
        return this.scaley2((total/sumTotal)*100)
    });

    brush = d3.brushX().extent([[0, 0], [this.props.width, this.props.brushHeight]]).on("brush end", ()=>{this.brushed()});

    zoom = d3.zoom().scaleExtent([1, Infinity]).translateExtent([[0, 0], [this.props.width,this.props.height]]).extent([[0, 0], [this.props.width, this.props.height]])

    /**
     * Updates the scales on new values
     */
    updateScales = ()=>{
        const a = _.uniqBy(this.props.data,'category').map(e => e.category);
        let min =  d3.min(a) - this.props.xPad ;
        let max = d3.max(a) + this.props.xPad;
        this.scalex = d3.scaleLinear().domain([min, max]).rangeRound([this.props.internalPadding, this.props.width-this.props.sidePadding ]);
        this.scaleY = d3.scaleLinear().domain([0, 100]).range([this.props.height, this.props.padding])

        this.scalex2 = d3.scaleLinear().domain([min, max]).rangeRound([this.props.internalPadding, this.props.width-this.props.sidePadding ]);
        this.scaley2 = d3.scaleLinear().domain([0, 100]).range([this.props.height2, this.props.padding])

        this.xAxis = d3.axisBottom(this.scalex);
        this.yAxis = d3.axisLeft(this.scaleY);

        this.xAxis2 = d3.axisBottom(this.scalex2);
        this.yAxis2 = d3.axisLeft(this.scaley2);
    }

    /**
     * Redrawing the chart on updates.
     */
    componentDidUpdate(){
        this.updateScales();
        let svg = d3.select(this.chartRef.current);
        svg.transition();
        svg.select(".line").transition().duration(800).attr("d", this.line(this.props.summedArray));
        svg.select(".x.axis").transition().duration(800).call(this.xAxis);
        svg.select(".y.axis").transition().duration(800).call(this.yAxis);
    }

    /**
     * Function to make x grid lines
     */
    makeXGridLines = () => {		
        return d3.axisBottom(this.scalex)
            .ticks(this.props.tics)
    }

    /**
     * function to make y grid lines
     */
    makeYGridLines = () => {		
        return d3.axisLeft(this.scaleY)
            .ticks(this.props.tics)
    }

    /**
     * Creates the line chart
     */
    makeLine = ()=>{
        this.svg.append("path")
            .attr("class", "line")
            .datum(this.props.summedArray)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 3)
            .attr("d", this.line);
    }

    

    makeFocusLine = ()=>{
        const {height, width} = this.props;
        /*create focus structure */
        let focus = this.svg.append("g").attr("class", "focus").style("display", "none");
        focus.append("line").attr("class", "x-hover-line hover-line").attr("y1", 0).attr("y2", height);
        focus.append("line").attr("class", "y-hover-line hover-line").attr("x1", 0).attr("x2", width);
        focus.append("circle").attr("r", 7.5);

        let _sx = this.scalex;
        let _sy = this.scaleY;
        let data = this.props.formattedData;
        this.svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function() { focus.style("display", null); d3.select(".tooltip")})
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove",function(){
                let mouse = d3.mouse(this)
                let focus  = d3.select(".focus");
                let x0 = _sx.invert(mouse[0])
                let y0 = _sy.invert(mouse[1]);
                focus.select("text").text(function() { return y0; });
                const xval = _sx(x0);
                const yval = _sy(y0);
                let tooltip  = d3.select(".tooltip");
                const finaldata = dataMatcher(data,x0,y0);
                if(finaldata){
                    focus.select(".x-hover-line").style("display","block").attr("y2", yval).attr("x1", xval).attr("x2",xval);
                    focus.select(".y-hover-line").style("display","block").attr("x2", xval).attr("y1", yval).attr("y2",yval);
                    focus.select("circle").style("display","block").attr("cx",xval).attr("cy",yval)
                        tooltip.html(`<span>${finaldata}</span>`).style("left",(mouse[0] + 80 + "px")).style("top",(mouse[1] - 80 + "px")).style("display","block")
                }else{
                    focus.select(".y-hover-line").style("display","none");
                    focus.select(".x-hover-line").style("display","none");
                    focus.select("circle").style("display","none");
                    tooltip.style("display","none");
                }
            });
    }

    addBrush =()=>{
        var context = this.svg.append("g")
            .attr("class", "context")
            .attr("transform",`translate( ${this.props.marginLeft2},${this.props.marginTop2 + this.props.height})`);
            
            /*summary chart*/
            context.append("path").attr("class", "line").datum(this.props.summedArray).attr("fill", "none").attr("stroke", "steelblue").attr("stroke-linejoin", "round").attr("stroke-linecap", "round").attr("stroke-width", 3).attr("d", this.line2);
            /*the brush */
            context.append("g").attr("class", "brush").call(this.brush).call(this.brush.move,this.scalex2.range());
    }

    brushed = ()=>{
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        console.log("brushed");
        var s = d3.event.selection || this.scalex2.range();
        console.log(s);
        this.scalex.domain(s.map(this.scalex2.invert, this.scalex2));
        let line = this.svg.select(".line").attr("d", this.line);

        this.svg.select(".x.axis").call(this.xAxis);

        this.svg.select(".zoom").call(this.zoom.transform, d3.zoomIdentity
            .scale(this.props.width / (s[1] - s[0]))
            .translate(-s[0], 0));
    }
    /**
     *Creates the Axis
     */
    makeAxis = ()=>{
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${this.props.height})`)
            .call(this.xAxis)
            .append("text")
            .attr("y", -10)
            .attr("x", this.props.width-160)
            .attr("fill", "#5D6971")
            .text("(Category)");
        this.svg.append("g")
            .attr("class", "y axis yaxisTransform")
            .attr("transform", `translate(${this.props.internalPadding},0)`) 
            .call(this.yAxis)
            .append("text")
            .attr("y", 16)
            .attr("x", -30)
            .attr("transform", `translate(${this.props.internalPadding + 90} ,0)`) 
            .style("text-anchor", "end")
            .attr("fill", "#5D6971")
            .text("(Percentage)");
    }
    /**
     * Create the Grid Lines
     */
    makeGridLine = ()=>{
        this.svg.append("g")			
            .attr("class", "grid x-axis")
            .attr("transform", `translate(${this.props.internalPadding},0)`)
            .call(this.makeYGridLines().tickSize(-(this.props.width-this.props.sidePadding)).tickFormat(""));
    }
    /**
     * First creation of the Line chart
     */
    componentDidMount(){
        this.svg = d3.select(this.chartRef.current);
        this.makeLine();
        this.makeAxis();
        this.makeGridLine();
        this.makeFocusLine();
        this.addBrush();
    }

    render(){
        return(<div className="graph-section row">
                <div ref={this.tooltipRef} className="tooltip"> </div>
                <svg ref={this.chartRef} width={this.props.width } height={this.props.height + this.props.sidePadding} className="line-graph">

                </svg>
            </div>)
    }
}

Linechart.defaultProps = {
    width: 1100,
    height:500,
    width: 1100,
    height2:100,
    marginTop2:40,
    marginLeft2:10,
    padding:50,
    sidePadding:140,
    internalPadding:30,
    tics: 8,
    xPad: 2,
    brushHeight: 120
}

