import { $1 } from './modules/helpers';
import { apdate, intcomma } from 'journalize';
import * as d3 from 'd3-fetch';
import csvFile from '../assets/IncidentsPerDate.csv';
import deathTypes from './modules/deathTypes.json';
import pics from '../imgs/*.jpg';

const r = /www.(\S+).com/; // regex to extract market name

document.addEventListener('DOMContentLoaded', function() {
  // const host = prompt('Which market are you coming from?', 'www.miamiherald.com')
  const host = 'www.miamiherald.com';

  let market = host.match(r)[1];

  sortToTop(market);
  startFadeAnimation(deathTypes);

});

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
      if (t < 5) return 2;
      if (t / data.length > 0.96) return clamp(t * 0.02, 1, 60);
      if (t / data.length > 0.98) return clamp(t * 0.01, 1, 60);
      return clamp(t * 0.75, 1, 60);
    };

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

        // let t = (index / data.length);
        // console.log("Percent:", t * 100,"%");

        fps = increment(index);

        // fps = x;
        // console.log("fps: ",fps);
      } else if (index >= data.length) {
        cancelAnimationFrame(requestID);
        // startFadeAnimation(deathTypes);
      }
    };

    // requestAnimationFrame(count);
  });

  function clamp(val, min, max) {
    return val > max ? max : val < min ? min : val;
  }
});

function sortToTop(market) {
  let links = document.querySelectorAll('.grid-link > a');

  let match;

  links.forEach(el => {
    let hostName = el.href;
    let hostMatch = hostName.match(r);
    if (market === hostMatch[1]) {
      match = true;
      el.parentElement.classList.add('grid-link--lead');
      let region = el.parentElement.parentElement;
      region.classList.add('grid__region--lead');
    }
  });

  if (!match) {
    let gridLinks = document.querySelector('.grid-links');
    let nationalLede = document.querySelector(
      '.grid__region[data-region=national] > .grid-link:first-of-type'
    );
    let ledeClone = nationalLede.cloneNode(true);
    ledeClone.className = 'grid-link grid-link--lead';

    let ledeCard = document.createElement('div');
    ledeCard.className = 'grid__region grid__region--lead';

    ledeCard.appendChild(ledeClone);

    gridLinks.appendChild(ledeCard);
  }
}

function startFadeAnimation(data) {
  let statOne = document.querySelector('.stats.stats-one');
  let statTwo = document.querySelector('.stats.stats-two');

  let picNum = getRandomInt(0, 19);
  let lastPic = picNum;

  let imgPlace = 0;
  let lastPlace = imgPlace;

  let picsNames = Object.keys(pics);
  let picsLength = picsNames.length;

  let length = data.length + picsLength;

  let dataInt = 0;

  let counter = 0;

  setTimeout(() => {
    let number = statOne.querySelector('.stats__num');
    let type = statOne.querySelector('.stats__cat');
    number.innerText = data[dataInt].count;
    type.innerText = data[dataInt].type;
    statOne.classList.add('visible');
    dataInt = 1;
    counter = 2;
  }, 2000); // 2 to get next cat before others

  setInterval(() => {
    if (counter < length) {
      if (counter % 4 == 0) {
        let number = statOne.querySelector('.stats__num');
        let type = statOne.querySelector('.stats__cat');
        number.innerText = data[dataInt].count;
        type.innerText = data[dataInt].type;
        statOne.classList.add('visible');
        dataInt < data.length - 1 ? dataInt++ : (dataInt = 0);
        setTimeout(() => {
          statTwo.classList.remove('visible');
        }, 1000);

      } else if (counter % 4 == 1 || counter % 4 == 3) {
        let headerImgs = document.querySelectorAll(
          '.grid__header .header__img'
        );

        // while for random placement
        while (imgPlace === lastPlace) {
          imgPlace = getRandomInt(0, 4);
        }
        lastPlace = imgPlace;

        // while for random placement
        while (picNum === lastPic) {
          picNum = getRandomInt(0, 4);
        }
        lastPic = picNum;

        // Pick random image from currently in header
        let toSwitch = headerImgs[imgPlace];

        // Create new image with src as sequence 0 to 19
        let newImg = document.createElement('img');
        newImg.className = 'header__img fade-out';

        newImg.src = pics[picsNames[picNum]];

        // Inset new image and remove the other

        toSwitch.classList.add('fade-out');

        setTimeout(() => {
          toSwitch.parentNode.insertBefore(newImg, toSwitch);
          toSwitch.style.display = 'none';
          setTimeout(() => {
            newImg.classList.remove('fade-out');
          }, 100);
          toSwitch.remove();
        }, 900);

        picNum < picsLength - 1 ? picNum++ : (picNum = 0);
      } else if (counter % 4 == 2) {
        let number = statTwo.querySelector('.stats__num');
        let type = statTwo.querySelector('.stats__cat');
        number.innerText = data[dataInt].count;
        type.innerText = data[dataInt].type;
        statTwo.classList.add('visible');
        dataInt < data.length - 1 ? dataInt++ : (dataInt = 0);
        setTimeout(() => {
          statOne.classList.remove('visible');
        }, 1000);
      }
      console.log(dataInt);
      counter++;
    } else {
      statOne.classList.remove('visible');
      statTwo.classList.remove('visible');
      counter = 0;
    }
  }, 4000);
}

function startHeaderFade() {
  let picNum = getRandomInt(0, 19);
  let lastPic = picNum;

  let imgPlace = 0;
  let lastPlace = imgPlace;

  let picsNames = Object.keys(pics);
  let picsLength = picsNames.length;

  setInterval(() => {
    let headerImgs = document.querySelectorAll('.grid__header .header__img');

    // while for random placement
    while (imgPlace === lastPlace) {
      imgPlace = getRandomInt(0, 4);
    }
    lastPlace = imgPlace;

    // Pick random image from currently in header
    let toSwitch = headerImgs[imgPlace];

    // Create new image with src as sequence 0 to 19
    let newImg = document.createElement('img');
    newImg.className = 'header__img fade-out';
    
    newImg.src = pics[picsNames[picNum]];

    // Inset new image and remove the other
    
    toSwitch.classList.add('fade-out');
    
    setTimeout(() => {
      toSwitch.parentNode.insertBefore(newImg, toSwitch);
      toSwitch.style.display = 'none';
      setTimeout(() => {
        newImg.classList.remove('fade-out');
      }, 100);
      toSwitch.remove();
    }, 900);

    picNum < picsLength - 1 ? picNum++ : (picNum = 0);

  }, 5000);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
