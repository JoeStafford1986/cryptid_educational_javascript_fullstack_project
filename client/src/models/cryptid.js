const PubSub = require('../helpers/pub_sub.js');
const Request = require('../helpers/request.js');


const Cryptid = function(url) {
  this.url = url;
  this.cryptids = [];
  this.continents = [];
};

Cryptid.prototype.bindEvents = function () {
  PubSub.subscribe('SelectView:select-change', (evt) => {
    const selectedContinent = evt.detail;
    this.getCryptidData();
    PubSub.subscribe('Cryptid:data-set', (evt) => {
      const filteredData = this.filterDataByContinent(evt.detail, selectedContinent);
      PubSub.publish('Cryptid:filtered-data-loaded', filteredData);
    })
  })

  PubSub.subscribe('DirectoryView:li-clicked', (evt) => {
    const request = new Request(this.url + `/${evt.detail}`)
    request.get()
     .then((data) => {
       PubSub.publish('Cryptid:data-selected', data);
     });
  });
};

Cryptid.prototype.getData = function() {
   const request = new Request(this.url)
   request.get()
    .then((data) => {
      PubSub.publish('Cryptid:data-loaded', data);
      this.cryptids = data;
      this.publishContinents(data);
  });
};

Cryptid.prototype.getCryptidData = function() {
   const request = new Request(this.url)
   request.get()
    .then((data) => {
      this.cryptids = [];
      this.cryptids.push(data);
      PubSub.publish('Cryptid:data-set', data);
  });
};

Cryptid.prototype.publishContinents = function (data) {
  this.cryptids = data;
  this.continents = this.uniqueContinentList();
  console.log('unique continents', this.continents);
  PubSub.publish('Cryptid:continents-ready', this.continents);
}

Cryptid.prototype.continentList = function () {
  const allContinents = this.cryptids.map(cryptid => cryptid.continent);
  console.log(allContinents);
  return allContinents;
}

Cryptid.prototype.uniqueContinentList = function () {
  return this.continentList().filter((cryptid, index, array) => {
    return array.indexOf(cryptid) === index;
  });
}

Cryptid.prototype.filterDataByContinent = function (data, continent) {
  let filteredData = [];
  filteredData.push(data.filter(cryptid => cryptid.continent === continent));
  return filteredData;
};

Cryptid.prototype.showCryptidOnSidebar = function () {
  PubSub.subscribe('MapView: Pin-Selected', (evt)=>{
    const cryptid = [evt.detail];
    PubSub.publish('Cryptid:data-selected', cryptid);
  })
};


Cryptid.prototype.reloadSidebar = function () {
  PubSub.subscribe('MapView:reloadData', (evt) => {
    const cryptids = evt.detail;
    PubSub.publish('Cryptid:data-loaded', cryptids)
  })
};




module.exports = Cryptid;
