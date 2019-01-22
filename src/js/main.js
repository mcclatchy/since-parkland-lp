import { $1 } from './modules/helpers';
import { apdate, intcomma } from 'journalize';
import * as d3 from 'd3-fetch';
import csvFile from '../assets/IncidentsPerDate.csv';

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
      elapsed: null,
    };

    time.startTime = time.then;

    const count = () => {

        if (stop) return;

        requestAnimationFrame(count);

        time.now = performance.now();
        time.elapsed = time.now - time.then;

        let fpsInterval = 1000 / fps

        if (index > 5) fps = 5
        if (index > 10) fps = 7
        if (index > 25) fps = 10
        if (index > 50) fps = 20
        if (index > 75) fps = 28
        if (index > 100) fps = 35
        if (index > 150) fps = 47
        if (index > 175) fps = 53
        if (index > 200) fps = 60
        if (index > 250) fps = 50
        if (index > 260) fps = 40
        if (index > 270) fps = 35
        if (index > 280) fps = 20
        if (index > 290) fps = 15
        if (index > 300) fps = 10
        if (index > 310) fps = 5
        if (index > 312) fps = 2

    
        if (time.elapsed > fpsInterval && index < data.length) {

            time.then = time.now - (time.elapsed % fpsInterval);

            let date = data[index].date;
            let count = data[index].count;

            let sum = total + count;

            totalNum.innerText = intcomma(sum);
            totalDate.innerText = apdate(date);
            total = sum;
            index++
        }
    };

    requestAnimationFrame(count);
  });
});
