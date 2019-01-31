/**
 * Vlist 虚拟滚动列表
 * TODO:
 * 1、利用css3 transform定位
 * 2、增加错误校验、锁定的解锁
 * 3、兼容小程序 RN
 */
function Vlist(param) {
    this.locker = false;//ajax request locker
    this.data = [];//列表数据
    this.loadData = function () {
        if (this.locker) return;
        this.locker = true;
        param.loadData()
    };
    this.itemHeight = param.itemHeight;//每一项的高度
    this.containerHeight = param.containerHeight;//容器的高度
    this.container = document.querySelector("#" + param.containerId);//容器id
    this.container.style.height = this.containerHeight + 'px';
    this.containerUL = this.container.querySelector("ul");//容器内的ul
    this.showItemCount = Math.ceil(this.containerHeight / this.itemHeight) + 1;//视图区域显示item的个数
    this.items = [];//可见列表项
    this.startIndex = 0;//第一个item索引
    this.render = param.render;//渲染每一项的函数
    this.loadData();
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
    this.container.addEventListener("scroll", this.scrollEvent.bind(this), false)
}

Vlist.prototype.destroy = function () {
    this.container.removeEventListener("scroll", this.scrollEvent.bind(this), false)
}

//ajax请求后 添加数据
Vlist.prototype.addData = function (data) {
    this.locker = false;
    if (this.data.length == 0) {
        this.data = this.data.concat(data);
        this.initList();
    } else {
        this.data = this.data.concat(data);
    }
    this.containerUL.style.height = this.data.length * this.itemHeight + 'px';
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

//滚动事件
Vlist.prototype.scrollEvent = function () {
    var containerScrollTop = this.container.scrollTop;
    var itemHeight = this.itemHeight;
    var startIndex = this.startIndex;
    var showItemCount = this.showItemCount;
    var items = this.items;
    if (containerScrollTop < 0) return;//ios兼容
    var startIndexNew = Math.floor(containerScrollTop / itemHeight);
    if (startIndexNew == startIndex) return;
    if (startIndexNew + this.showItemCount - 1 >= this.data.length) {
        //已经到底了
        this.showLoading();
        this.loadData();
        return;
    }

    var moveCount = Math.abs(startIndex - startIndexNew);
    if (moveCount >= showItemCount) {
        //全部渲染
        items.forEach((item, idx) => {
            item.index = startIndexNew + idx;
            item.top = item.index * itemHeight;
            item.dom.innerHTML = startIndexNew + idx;
            item.dom.top = item.top + "px";
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
    this.startIndex = startIndexNew;
}