import { $1 } from './modules/helpers';
import { apdate, intcomma } from 'journalize';
import * as d3 from 'd3-fetch';
import csvFile from '../assets/PerDate2-10-19.csv';
import deathTypes from './modules/deathTypes.json';
import pics from '../imgs/*.jpg';

const r = /[wamp]{3}.(\S+).com/; // regex to extract market name
const imgMax = 29;

document.addEventListener('DOMContentLoaded', function() {

  let host = location.hostname;
  if (host== 'localhost') host = 'www.miamiherald.com'
  let market = host.match(r)[1];

  switch (market) {
    case 'sacbee':
    case 'fresnobee':
    case 'mercedsunstar':
      market = 'modbee';
      break;
    case 'charlotteobserver':
      market = 'newsobserver';
      break;
    case 'bradenton':
      market = 'miamiherald';
      break;
    case 'macon':
      market = 'ledger-enquirer';
  }
  
  sortToTop(market); // Moves story to top based on market location

  // Loads initial set of images
  let headImgs = document.querySelectorAll('.header__img');

  let picsNames = Object.keys(pics);
  let picsNum = getRandomInt(0, imgMax);
  let initialPics = [];

  headImgs.forEach(el => {
    while (initialPics.includes(picsNames[picsNum])) {
      picsNum = getRandomInt(0, imgMax);
    }
    let img = document.createElement('img');
    let dataName = picsNames[picsNum];
    img.src = pics[dataName];
    img.setAttribute('data-name', dataName);
    el.appendChild(img);
    initialPics.push(dataName);
    
  });

  startHeaderFade(initialPics);

  let totalNum = $1('.total__num');
  let totalDate = $1('.total__date');

  d3.csv(csvFile, function(d) {
    return {
      date: new Date(d['date']),
      count: +d['count']
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

        // Current sum of deaths, adding to total;
        let sum = total + count;

        totalNum.innerText = intcomma(sum);
        totalDate.innerText = apdate(date);

        total = sum;

        index++;

        fps = increment(index);
      } else if (index >= data.length) {
        cancelAnimationFrame(requestID);
        startFadeAnimation(deathTypes);
      }
    };

    requestAnimationFrame(count);
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

    let stateCheck = el.parentElement.parentElement.getAttribute('data-state');

    if (market === hostMatch[1] && stateCheck) {
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

function startHeaderFade(startPics) {
  let imgPlace = 0;
  let lastPlace = imgPlace;

  let picsNames = Object.keys(pics);
  let picNum = getRandomInt(0, imgMax);

  let currentPics = startPics;
  let lastPics = currentPics;

  setInterval(() => {
    let headerImgs = document.querySelectorAll('.grid__header .header__img');

    // while for random placement
    while (imgPlace === lastPlace) {
      imgPlace = getRandomInt(0, 4);
    }
    lastPlace = imgPlace;

    while (
      currentPics.includes(picsNames[picNum]) ||
      lastPics.includes(picsNames[picNum])
    ) {
      picNum = getRandomInt(0, imgMax);
    }

    // New picture to insert
    let dataName = picsNames[picNum];

    // Pick random image from currently in header
    let toSwitch = headerImgs[imgPlace];
    let switchName = toSwitch.firstElementChild.getAttribute('data-name');

    // Create new image from randomly selected name
    let newImg = document.createElement('img');
    newImg.className = 'img-new fade-out';
    newImg.src = pics[dataName];
    newImg.setAttribute('data-name', dataName);
    toSwitch.appendChild(newImg);

    // Inset new image and remove the other
    setTimeout(() => {
      newImg.classList.remove('fade-out');
    }, 100);
    setTimeout(() => {
      newImg.classList.remove('img-new');
      toSwitch.firstElementChild.remove();
    }, 2000);

    lastPics = currentPics;

    // Removes old swapped pic from array and adds new one
    currentPics = currentPics.filter(name => name !== switchName);
    currentPics.push(dataName);
  }, 3500);
}

function startFadeAnimation(data) {
  let statOne = document.querySelector('.stats.stats-one');
  let statTwo = document.querySelector('.stats.stats-two');

  let length = data.length;
  let dataInt = 0;
  let counter = 0;

  setTimeout(() => {
    let number = statOne.querySelector('.stats__num');
    let type = statOne.querySelector('.stats__cat');
    number.innerText = data[dataInt].count;
    type.innerText = data[dataInt].type;
    statOne.classList.add('visible');
    dataInt = 1;
    counter = 2; // 2 to get next cat before others
  }, 2000);

  setInterval(() => {
    if (counter < length) {
      if (counter % 4 == 0) {
        statOne.classList.remove('visible');
        setTimeout(() => {
          showStat(statOne);
        }, 1000);
      } else if (counter % 4 == 2) {
        statTwo.classList.remove('visible');
        setTimeout(() => {
          showStat(statTwo);
        }, 1000);
      }
      counter++;
    } else {
      counter = 0;
    }
  }, 4000);

  function showStat(whichStat) {
    let number = whichStat.querySelector('.stats__num');
    let type = whichStat.querySelector('.stats__cat');
    number.innerText = data[dataInt].count;
    type.innerText = data[dataInt].type;
    whichStat.classList.add('visible');
    dataInt < data.length - 1 ? dataInt++ : (dataInt = 0);
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
