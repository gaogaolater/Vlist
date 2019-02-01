<style lang="less">
html,
body {
    margin: 0;
    padding: 0;
    background-color: #eee;
}
.header{
    height:40px;
    line-height: 40px;
    text-align: center;
    background:white;
}
.list {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    box-sizing: border-box;
    overflow-y: scroll;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    /*兼容ios 否则滑动不流畅*/
}

.list ul {
    padding: 0;
    margin: 0;
    width: 100%;
    list-style: none;
    position: relative;
}

.list ul li {
    position: relative;
}

.list .item {
    background: white;
    width: 96%;
    margin-left: 2%;
    height: 170px;
    margin-top: 10px;
    box-sizing: border-box;
    position: relative;
    border-radius: 8px;
}

.list .item img {
    width: 160px;
    height: 160px;
    margin: 5px;
    float: left;
}

.list ul li .item .right {
    height: 170px;
    margin-left: 170px;
    overflow: hidden;
}

.list ul li .item .right .title {
    /*! autoprefixer: off */
    font-size: 16px;
    color: #3e3936;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-top: 6px;
}

.list ul li .item .right .price {
    color: #c9040d;
    font-size: 14px;
    position: absolute;
    top: 123px;
    left: 170px;
}

.list ul li .item .right .buy {
    width: 80px;
    height: 30px;
    background: #c9040d;
    text-align: center;
    line-height: 30px;
    font-size: 12px;
    color: white;
    border-radius: 40px;
    position: absolute;
    right: 10px;
    top: 120px;
}

::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    background-color: #fff;
}

::-webkit-scrollbar:hover {
    background-color: #eee;
}

::-webkit-scrollbar-thumb {
    background-color: #ccc;
}

::-webkit-scrollbar-thumb:hover {
    background-color: #aaa;
}

::-webkit-scrollbar-thumb:active {
    background-color: #888;
}

.loading {
    text-align: center;
    width: 100%;
    font-size: 12px;
    height: 30px;
    line-height: 30px;
}
</style>

<template>
  <div id="app">
    <div class="header">当前第{{pageIndex-1}}页，共{{totalSize}}条数据</div>
    <div ref="container" class="list">
      <ul></ul>
    </div>
  </div>
</template>

<script>
import fetchJsonp from 'fetch-jsonp'
import Vlist from './vlist'

export default {
  name: 'app',
  data(){
    return {
      pageIndex:1,
      totalSize:0
    }
  },
  mounted(){
    this.vlist = new Vlist({
      itemHeight: 180,
      containerId: 'list',
      container: this.$refs.container,
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
  },
  methods: {
    loadData() {
      let param = { page: this.pageIndex, pagesize: 22 };
      let url = `https://wqcoss.jd.com/mcoss/reclike/getrecinfo?pi=${this.pageIndex}&pc=22&recpos=6163&hi=${encodeURIComponent(JSON.stringify(param))}&_=${new Date().getTime()}`;
      fetchJsonp(url).then(response => response.json()).then(resp => {
        let data = resp.data;
        this.vlist.addData(data);
        this.pageIndex = this.pageIndex + 1;
        this.totalSize = this.totalSize + data.length;
      })
    }
  },
}
</script>

<style lang="less">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
