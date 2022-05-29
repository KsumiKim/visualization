import React, { useEffect, useRef, useState } from "react";
import { pack, hierarchy, select, easeExpInOut } from "d3";

const width = window.innerWidth;
const height = window.innerHeight;
const colors = [ '#51938d', '#99a9ff', '#c7e5ff', '#d24168', '#ffa366' ];

const Bubble = () => {
   const [dataFetched, setDataFetched] = useState(false);
   const bubbleChart = useRef();
   const generateChart = data => {
   const bubble = data => pack()
      .size([width, height])
      .padding(5)(hierarchy({ children: data }).sum(d => d.volumeUsd24Hr));

   const svg = select(bubbleChart.current)
               .style('width', width)
               .style('height', height);

   const root = bubble(data);
   const tooltip = select('.tooltip');

   const node = svg.selectAll()
      .data(root.children)
      .enter().append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

   const circle = node.append('circle')
      .style('fill', d => { return colors[d.data.rank % 5]})
      .on('mouseover', function (e, d) {
         tooltip.select('.name').text(d.data.name);
         tooltip.select('.title__priceUsd').text('Market Price(USD)');
         tooltip.select('.title__changePercent24Hr').text('Price Change(%)');
         tooltip.select('.title__volumeUsd24Hr').text('Trading Volumn(USD)');
         tooltip.select('.title__supply').text('Available Supply for Trading');

         tooltip.select('.priceUsd').text(formatNumber(Math.floor(d.data.priceUsd)));
         tooltip.select('.changePercent24Hr').text(`${Math.floor(d.data.changePercent24Hr * 100)} %`);
         tooltip.select('.volumeUsd24Hr').text(formatNumber(Math.floor(d.data.volumeUsd24Hr)));
         tooltip.select('.supply').text(formatNumber(Math.floor(d.data.supply)));

         tooltip.style('visibility', 'visible');
         select(this).style('stroke', '#222');
      })
      .on('mousemove', e => tooltip.style('top', `${e.pageY}px`).style('left', `${e.pageX + 10}px`))
      .on('mouseout', function () {
         select(this).style('stroke', 'none');
         return tooltip.style('visibility', 'hidden');
      })
      .on('click', (e, d) => window.open(d.data.explorer));

   const label = node.append('text')
      .attr('dy', 2)
      .text(d => d.data.name.substring(0, d.r / 3));

   node.transition()
      .ease(easeExpInOut)
      .duration(1000)
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

   circle.transition()
      .ease(easeExpInOut)
      .duration(1000)
      .attr('r', d => d.r);

   label.transition()
      .delay(700)
      .ease(easeExpInOut)
      .duration(1000)
      .style('opacity', 1)
   };

   const formatNumber = (number) => {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
   };

   useEffect(() => {
      fetch('https://api.coincap.io/v2/assets')
         .then((response) => response.json())
         .then((jsonResponse) => {
            setDataFetched(true);
            generateChart(jsonResponse.data);
         });
   }, []);

    return (
      <div className='chart'>
         <h1>Trading Volume Quantity of Cryptocurrencies</h1>
         {dataFetched && <svg ref={bubbleChart}></svg>}
         <div className='tooltip'>
            <div className='tooltip__body'>
            <div className='wrap'>
               <span className='name'></span>
            </div>
            <div className='wrap'>
               <span className='title title__priceUsd'></span>
               <span className='priceUsd'></span>
            </div>
            <div className='wrap'>
               <span className='title title__changePercent24Hr'></span>
               <span className='changePercent24Hr'></span>
            </div>
            <div className='wrap'>
               <span className='title title__volumeUsd24Hr'></span>
               <span className='volumeUsd24Hr'></span>
            </div>
            <div className='wrap'>
               <span className='title title__supply'></span>
               <span className='supply'></span>
            </div>
            <div className='wrap'>
               <a href=""></a>
            </div>
            </div>
         </div>
      </div>
   )
}

export default Bubble;
