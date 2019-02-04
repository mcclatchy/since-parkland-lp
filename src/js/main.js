import { $1 } from './modules/helpers';
import { apdate, intcomma } from 'journalize';
import * as d3 from 'd3-fetch';
import csvFile from '../assets/IncidentsPerDate.csv';


document.addEventListener('DOMContentLoaded', function() {

  const host = 'www.miamiherald.com';

  let market = host.slice(4, -4);

  console.log(market);
  
  sortToTop(market);
})

window.addEventListener('load', function() {
  console.log('Loaded');
  let totalNum = $1('.total__num');
  let totalDate = $1('.total__date');

  d3.csv(csvFile, function(d) {
    return {
      date: new Date(d['Date of Incident']),
      count: +d['Count of Incident']
    };
  }).then(function(data) {
    let index = 0;
    let total = 0;
    let fps = 1;

    const stop = false;

    const time = {
      fpsInterval: 1000 / fps,
      then: performance.now(),
      now: null,
      elapsed: null
    };

    time.startTime = time.then;

    const increment = t => {
      if (t < 6) return 2;
      if ((t / data.length) > .96) return clamp(t * .02, 1, 60); 
      if ((t / data.length) > .98) return clamp(t * .01, 1, 60); 
      return clamp(t * .5, 1, 60)
    }

    const count = () => {
      if (stop) return;

      let requestID = requestAnimationFrame(count);

      time.now = performance.now();
      time.elapsed = time.now - time.then;

      let fpsInterval = 1000 / fps;

      if (time.elapsed > fpsInterval && index < data.length) {
        time.then = time.now - (time.elapsed % fpsInterval);

        let date = data[index].date;
        let count = data[index].count;

        let sum = total + count;

        totalNum.innerText = intcomma(sum);
        totalDate.innerText = apdate(date);
        total = sum;
        index++;
        
        let t = (index / data.length);
        // console.log("Percent:", t * 100,"%");
        

        let x = increment(index);

        fps = x;
        // console.log("fps: ",fps);
        

      } else if (index >= data.length) {
        cancelAnimationFrame(requestID);
      }
    };

    requestAnimationFrame(count);
  });

  function clamp(val, min, max) {
    return val > max ? max : val < min ? min : val;
  }
});


function sortToTop(market = "none") {

  let links = document.querySelectorAll('.grid-link > a');

  links.forEach(el => {
    let hostName = el.href;
    let hostMatch = hostName.match(/\w+(?=.com)/g);
    if (market === hostMatch[0]) {
      let match = hostMatch[0]
      console.log("Match!", market, match);

      el.parentElement.classList.add('grid-link--lead')

      let region = el.parentElement.parentElement;
      region.classList.add('grid__region--lead')

    }
  })  
}