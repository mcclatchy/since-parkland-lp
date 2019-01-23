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

    const increment = i => {
        if (i > 275) return (i + 1)  / 4
        return (i + 1) * 1.5
    }

    const count = () => {

        if (stop) return;

        let requestID = requestAnimationFrame(count);

        time.now = performance.now();
        time.elapsed = time.now - time.then;

        let fpsInterval = 1000 / fps

        fps = increment(index);
        console.log(fps);
        
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
        else if (index >= data.length) {
            cancelAnimationFrame(requestID);
        }
    };

    requestAnimationFrame(count);
  });
});
