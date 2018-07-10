const PubSub = require('../helpers/pub_sub.js');
const Request = require('../helpers/request.js');


const Cryptid = function(url) {
  this.url = url;
  this.cryptids = [];
};

Cryptid.prototype.bindEvents = function () {
  PubSub.subscribe('SelectView:select-change', (evt) => {
    const selectedContinent = evt.detail;
    this.getCryptidData();
    PubSub.subscribe('Cryptid:data-set', (evt) => {
      console.log(evt.detail);
      const filteredData = this.filterDataByContinent(evt.detail, selectedContinent);
      console.log(filteredData);
    })
    console.log(this.cryptids);
    // console.log(this.filterDataByContinent(this.cryptids, selectedContinent));
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
  });
};

Cryptid.prototype.getCryptidData = function() {
   const request = new Request(this.url)
   request.get()
    .then((data) => {
      this.cryptids = [];
      this.cryptids.push(data);
      PubSub.publish('Cryptid:data-set', data);
      console.log(this.cryptids);
  });
};

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
module.exports = Cryptid;
