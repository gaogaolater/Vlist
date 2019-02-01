import React, { Component } from 'react';
import './App.css';
import Vlist from './vlist'
import fetchJsonp from 'fetch-jsonp'

class App extends Component {

  state = {
    pageIndex: 1,
    totalSize: 0
  }

  componentDidMount() {
    this.vlist = new Vlist({
      itemHeight: 180,
      containerId: 'list',
      container: this.refs.container,
      containerHeight: document.documentElement.clientHeight - 40,
      loadData: this.loadData.bind(this),
      render: function (itemData, index) {
        return `
              <div class="item">
                  <img src="//img12.360buyimg.com/mobilecms/s372x372_${itemData.img}"/>
                  <div class="right">
                      <div class="title">${itemData.t}</div>
                      <div class="price">¥${itemData.jp}</div>
                      <div class="buy">立即购买</div>
                  </div>
              </div>
          `
      }
    });
  }

  loadData() {
    let { pageIndex, totalSize } = this.state;
    let param = { page: pageIndex, pagesize: 22 };
    let url = `https://wqcoss.jd.com/mcoss/reclike/getrecinfo?pi=${pageIndex}&pc=22&recpos=6163&hi=${encodeURIComponent(JSON.stringify(param))}&_=${new Date().getTime()}`;
    fetchJsonp(url).then(response => response.json()).then(resp => {
      let data = resp.data;
      this.vlist.addData(data);
      this.setState({
        pageIndex: pageIndex + 1,
        totalSize: totalSize + data.length
      })
    })
  }

  render() {
    let { pageIndex, totalSize } = this.state;
    return (
      <div className="App">
        <header className="header">当前第{pageIndex - 1}页，已经达到{totalSize}条数据</header>
        <div ref="container" className="list" id="list">
          <ul></ul>
        </div>
      </div>
    );
  }
}

export default App;
