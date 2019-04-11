/**
 * Vlist
 */
(function (global, factory) {
    (typeof exports === 'object' && typeof module !== 'undefined') ? module.exports = factory() : (global.Vlist = factory());
}(this, function () {
    function Vlist(param) {
        this.locker = false;//ajax request locker
        this.itemHeight = param.itemHeight;//每一项的高度
        this.container = param.container;//容器
        this.containerUL = this.container.querySelector("ul");//容器内的ul
        this.maxHeight = param.maxHeight ? param.maxHeight : document.documentElement.clientHeight;
        this.showItemCount = Math.ceil(this.maxHeight / this.itemHeight) + 1;//视图区域显示item的个数
        this.items = [];//可见列表项
        this.startIndex = 0;//第一个item索引
        this.render = param.render;//渲染每一项的函数
        this.data = [];//列表数据
        //初始化数据
        if (param.initData) {
            this.addData(param.initData);
        }
        if (param.loadData) {
            this.loadData = function () {
                if (this.locker) return;
                this.locker = true;
                param.loadData()
            };
            //如果没有初始化数据就调用拉取数据接口
            if (Array.isArray(param.initData) && param.initData.length == 0) {
                this.loadData();
            }
        }
        this.scrollEventBind = this.scrollEvent.bind(this);
        this.container.addEventListener("scroll", this.scrollEventBind, false);
    }

    Vlist.prototype.renderItem = function (item) {
        var index = item.index;
        var itemDom = item.dom ? item.dom : document.createElement("LI");
        var itemData = this.data[index];
        itemDom.innerHTML = this.render(itemData, index);
        itemDom.style.position = "absolute";
        itemDom.style.top = (index * this.itemHeight) + "px";
        itemDom.style.height = this.itemHeight + "px";
        itemDom.style.width = "100%";
        itemDom.style.overflow = "hidden";
        item.dom = itemDom;
        item.dom.setAttribute("index", index);
        item.top = index * this.itemHeight;
        return item;
    }

    //第一次初始化列表项
    Vlist.prototype.initList = function () {
        var count = this.data.length < this.showItemCount ? this.data.length : this.showItemCount;
        for (var i = 0; i < count; i++) {
            var item = this.renderItem({
                index: i
            });
            this.containerUL.appendChild(item.dom);
            this.items.push(item);
        }
    }

    Vlist.prototype.destroy = function () {
        this.containerUL.innerHTML = '';
        this.data = [];
        this.items = [];
        this.locker = false;
        this.startIndex = 0;
        this.container.removeEventListener("scroll", this.scrollEventBind, false)
    }

    Vlist.prototype.reloadData = function (data) {
        this.destroy();
        this.addData(data);
    }

    //ajax请求后 添加数据
    Vlist.prototype.addData = function (data) {
        this.locker = false;
        let isInit = this.data.length == 0;
        this.data = this.data.concat(data);
        var realHeight = parseInt(this.data.length * this.itemHeight);
        if (realHeight > this.maxHeight) {
            this.container.style.height = this.maxHeight + 'px';
            this.showItemCount = Math.ceil(this.maxHeight / this.itemHeight) + 1;//视图区域显示item的个数
        } else {
            this.container.style.height = realHeight + 'px';
            this.showItemCount = this.data.length + 1;//视图区域显示item的个数
        }
        this.containerUL.style.height = realHeight + 'px';
        if (isInit) {
            this.initList();
        }
        this.closeLoading();
    }

    //显示loading
    Vlist.prototype.showLoading = function () {
        if (!this.loadingDom) {
            this.loadingDom = document.createElement("LI");
            this.loadingDom.setAttribute("class", "loading");
            this.loadingDom.innerText = "加载中...";
        }
        this.loadingDom.style.position = "absolute";
        this.loadingDom.style.top = (this.items[this.items.length - 1].top + this.itemHeight) + 'px';
        this.containerUL.appendChild(this.loadingDom);
    }

    //关闭loading
    Vlist.prototype.closeLoading = function () {
        if (this.loadingDom)
            this.containerUL.removeChild(this.loadingDom);
    }

    Vlist.prototype.diffRender = function (startIndex, startIndexNew) {
        var showItemCount = this.showItemCount;
        var items = this.items;
        var moveCount = Math.abs(startIndex - startIndexNew);
        if (moveCount >= showItemCount) {
            //全部渲染
            items.forEach((item, idx) => {
                item.index = startIndexNew + idx;
                this.renderItem(item);
            })
        } else {
            //部分渲染
            if (startIndex - startIndexNew > 0) {
                //逆 下拉
                for (var i = 1; i <= moveCount; i++) {
                    var item = items[showItemCount - i];
                    item.index = item.index - showItemCount;
                    this.renderItem(item);
                }
                this.items = items.splice(showItemCount - moveCount, moveCount).concat(items);
            } else {
                for (var i = 0; i < moveCount; i++) {
                    var item = items[i];
                    item.index = item.index + showItemCount;
                    this.renderItem(item);
                }
                this.items = items.concat(items.splice(0, moveCount));
            }
        }
    }

    //滚动事件
    Vlist.prototype.scrollEvent = function () {
        var containerScrollTop = this.container.scrollTop;
        var itemHeight = this.itemHeight;
        var startIndex = this.startIndex;
        if (containerScrollTop < 0) return;//ios兼容
        var startIndexNew = Math.floor(containerScrollTop / itemHeight);
        var maxStartIndex = this.data.length - this.showItemCount + 1;
        //android手机兼容性问题
        startIndexNew = startIndexNew > maxStartIndex ? maxStartIndex : startIndexNew;
        if (startIndexNew === startIndex) return;
        var scrollOver = startIndexNew + this.showItemCount - 1 >= this.data.length;
        var renderOver = startIndexNew - startIndex === 1;
        if (scrollOver && renderOver) {
            //到底了
            if (this.loadData) {
                this.showLoading();
                this.loadData();
            }
            return;
        }
        //如果到底没有渲染完就再渲染一次
        if (scrollOver && renderOver === false) {
            startIndexNew--;
        }
        this.diffRender(startIndex, startIndexNew);
        this.startIndex = startIndexNew;
    }
    return Vlist;
}))