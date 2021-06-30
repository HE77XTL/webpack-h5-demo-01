console.log(11)
import '../../common/css/common.less'
import './index.less'


import $ from 'jquery'
$(() => {
    console.log("production------>index.js");
})

// css-loader
// style-loader
// yarn add css-loader style-loader -D
function component() {
    const element = document.createElement('div');

    // Lodash, now imported by this script
    element.innerText = 'hello webpack';
    element.classList.add('hello');

    return element;
}

document.body.appendChild(component());
