var getScriptPromisify = (src) => {
  return new Promise((resolve) => {
    $.getScript(src, resolve);
  });
};

(function() {

  class Renderer {
    constructor (root) {
      this._root = root
  
      this._echart = null
    }
  
    async render (phrase) {
      await getScriptPromisify("https://cdnjs.cloudflare.com/ajax/libs/echarts/5.0.0/echarts.min.js");
      /*! For license information please see echarts-wordcloud.min.js.LICENSE.txt */
      !function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(require("echarts")):"function"==typeof define&&define.amd?define(["echarts"],e):"object"==typeof exports?exports["echarts-wordcloud"]=e(require("echarts")):t["echarts-wordcloud"]=e(t.echarts)}(self,(function(t){return(()=>{"use strict";var e={638:(t,e,a)=>{a.r(e);var r=a(83);r.extendSeriesModel({type:"series.wordCloud",visualStyleAccessPath:"textStyle",visualStyleMapper:function(t){return{fill:t.get("color")}},visualDrawType:"fill",optionUpdated:function(){var t=this.option;t.gridSize=Math.max(Math.floor(t.gridSize),4)},getInitialData:function(t,e){var a=r.helper.createDimensions(t.data,{coordDimensions:["value"]}),i=new r.List(a,this);return i.initData(t.data),i},defaultOption:{maskImage:null,shape:"circle",keepAspect:!1,left:"center",top:"center",width:"70%",height:"80%",sizeRange:[12,60],rotationRange:[-90,90],rotationStep:45,gridSize:8,drawOutOfBound:!1,shrinkToFit:!1,textStyle:{fontWeight:"normal"}}}),r.extendChartView({type:"wordCloud",render:function(t,e,a){var i=this.group;i.removeAll();var o=t.getData(),n=t.get("gridSize");t.layoutInstance.ondraw=function(e,a,s,l){var d=o.getItemModel(s),u=d.getModel("textStyle"),f=new r.graphic.Text({style:r.helper.createTextStyle(u),scaleX:1/l.info.mu,scaleY:1/l.info.mu,x:(l.gx+l.info.gw/2)*n,y:(l.gy+l.info.gh/2)*n,rotation:l.rot});f.setStyle({x:l.info.fillTextOffsetX,y:l.info.fillTextOffsetY+.5*a,text:e,verticalAlign:"middle",fill:o.getItemVisual(s,"style").fill,fontSize:a}),i.add(f),o.setItemGraphicEl(s,f),f.ensureState("emphasis").style=r.helper.createTextStyle(d.getModel(["emphasis","textStyle"]),{state:"emphasis"}),f.ensureState("blur").style=r.helper.createTextStyle(d.getModel(["blur","textStyle"]),{state:"blur"}),r.helper.enableHoverEmphasis(f,d.get(["emphasis","focus"]),d.get(["emphasis","blurScope"])),f.stateTransition={duration:t.get("animation")?t.get(["stateAnimation","duration"]):0,easing:t.get(["stateAnimation","easing"])},f.__highDownDispatcher=!0},this._model=t},remove:function(){this.group.removeAll(),this._model.layoutInstance.dispose()},dispose:function(){this._model.layoutInstance.dispose()}}),window.setImmediate||(window.setImmediate=window.msSetImmediate||window.webkitSetImmediate||window.mozSetImmediate||window.oSetImmediate||function(){if(!window.postMessage||!window.addEventListener)return null;var t=[void 0],e="zero-timeout-message";return window.addEventListener("message",(function(a){if("string"==typeof a.data&&a.data.substr(0,e.length)===e){a.stopImmediatePropagation();var r=parseInt(a.data.substr(e.length),36);t[r]&&(t[r](),t[r]=void 0)}}),!0),window.clearImmediate=function(e){t[e]&&(t[e]=void 0)},function(a){var r=t.length;return t.push(a),window.postMessage(e+r.toString(36),"*"),r}}()||function(t){window.setTimeout(t,0)}),window.clearImmediate||(window.clearImmediate=window.msClearImmediate||window.webkitClearImmediate||window.mozClearImmediate||window.oClearImmediate||function(t){window.clearTimeout(t)});var i=function(){var t=document.createElement("canvas");if(!t||!t.getContext)return!1;var e=t.getContext("2d");return!!(e&&e.getImageData&&e.fillText&&Array.prototype.some&&Array.prototype.push)}(),o=function(){if(i){for(var t,e,a=document.createElement("canvas").getContext("2d"),r=20;r;){if(a.font=r.toString(10)+"px sans-serif",a.measureText("Ｗ").width===t&&a.measureText("m").width===e)return r+1;t=a.measureText("Ｗ").width,e=a.measureText("m").width,r--}return 0}}(),n=function(t){for(var e,a,r=t.length;r;)e=Math.floor(Math.random()*r),a=t[--r],t[r]=t[e],t[e]=a;return t},s={},l=function(t,e){if(i){var a=Math.floor(Math.random()*Date.now());Array.isArray(t)||(t=[t]),t.forEach((function(e,a){if("string"==typeof e){if(t[a]=document.getElementById(e),!t[a])throw new Error("The element id specified is not found.")}else if(!e.tagName&&!e.appendChild)throw new Error("You must pass valid HTML elements, or ID of the element.")}));var r={list:[],fontFamily:'"Trebuchet MS", "Heiti TC", "微軟正黑體", "Arial Unicode MS", "Droid Fallback Sans", sans-serif',fontWeight:"normal",color:"random-dark",minSize:0,weightFactor:1,clearCanvas:!0,backgroundColor:"#fff",gridSize:8,drawOutOfBound:!1,shrinkToFit:!1,origin:null,drawMask:!1,maskColor:"rgba(255,0,0,0.3)",maskGapWidth:.3,layoutAnimation:!0,wait:0,abortThreshold:0,abort:function(){},minRotation:-Math.PI/2,maxRotation:Math.PI/2,rotationStep:.1,shuffle:!0,rotateRatio:.1,shape:"circle",ellipticity:.65,classes:null,hover:null,click:null};if(e)for(var l in e)l in r&&(r[l]=e[l]);if("function"!=typeof r.weightFactor){var d=r.weightFactor;r.weightFactor=function(t){return t*d}}if("function"!=typeof r.shape)switch(r.shape){case"circle":default:r.shape="circle";break;case"cardioid":r.shape=function(t){return 1-Math.sin(t)};break;case"diamond":r.shape=function(t){var e=t%(2*Math.PI/4);return 1/(Math.cos(e)+Math.sin(e))};break;case"square":r.shape=function(t){return Math.min(1/Math.abs(Math.cos(t)),1/Math.abs(Math.sin(t)))};break;case"triangle-forward":r.shape=function(t){var e=t%(2*Math.PI/3);return 1/(Math.cos(e)+Math.sqrt(3)*Math.sin(e))};break;case"triangle":case"triangle-upright":r.shape=function(t){var e=(t+3*Math.PI/2)%(2*Math.PI/3);return 1/(Math.cos(e)+Math.sqrt(3)*Math.sin(e))};break;case"pentagon":r.shape=function(t){var e=(t+.955)%(2*Math.PI/5);return 1/(Math.cos(e)+.726543*Math.sin(e))};break;case"star":r.shape=function(t){var e=(t+.955)%(2*Math.PI/10);return(t+.955)%(2*Math.PI/5)-2*Math.PI/10>=0?1/(Math.cos(2*Math.PI/10-e)+3.07768*Math.sin(2*Math.PI/10-e)):1/(Math.cos(e)+3.07768*Math.sin(e))}}r.gridSize=Math.max(Math.floor(r.gridSize),4);var u,f,c,h,m,g,w,v,p=r.gridSize,y=p-r.maskGapWidth,x=Math.abs(r.maxRotation-r.minRotation),M=Math.min(r.maxRotation,r.minRotation),S=r.rotationStep;switch(r.color){case"random-dark":w=function(){return L(10,50)};break;case"random-light":w=function(){return L(50,90)};break;default:"function"==typeof r.color&&(w=r.color)}"function"==typeof r.fontWeight&&(v=r.fontWeight);var b=null;"function"==typeof r.classes&&(b=r.classes);var I,T=!1,k=[],C=function(t){var e,a,r=t.currentTarget,i=r.getBoundingClientRect();t.touches?(e=t.touches[0].clientX,a=t.touches[0].clientY):(e=t.clientX,a=t.clientY);var o=e-i.left,n=a-i.top,s=Math.floor(o*(r.width/i.width||1)/p),l=Math.floor(n*(r.height/i.height||1)/p);return k[s]?k[s][l]:null},E=function(t){var e=C(t);I!==e&&(I=e,e?r.hover(e.item,e.dimension,t):r.hover(void 0,void 0,t))},A=function(t){var e=C(t);e&&(r.click(e.item,e.dimension,t),t.preventDefault())},O=[],F=function(t){if(O[t])return O[t];var e=8*t,a=e,i=[];for(0===t&&i.push([h[0],h[1],0]);a--;){var o=1;"circle"!==r.shape&&(o=r.shape(a/e*2*Math.PI)),i.push([h[0]+t*o*Math.cos(-a/e*2*Math.PI),h[1]+t*o*Math.sin(-a/e*2*Math.PI)*r.ellipticity,a/e*2*Math.PI])}return O[t]=i,i},D=function(){return r.abortThreshold>0&&(new Date).getTime()-g>r.abortThreshold},P=function(e,a,r,i,o){e>=f||a>=c||e<0||a<0||(u[e][a]=!1,r&&t[0].getContext("2d").fillRect(e*p,a*p,y,y),T&&(k[e][a]={item:o,dimension:i}))},R=function e(a,i){if(i>20)return null;var s,l,d;Array.isArray(a)?(s=a[0],l=a[1]):(s=a.word,l=a.weight,d=a.attributes);var h,g,y,I=0===r.rotateRatio||Math.random()>r.rotateRatio?0:0===x?M:M+Math.round(Math.random()*x/S)*S,k=function(t){if(Array.isArray(t)){var e=t.slice();return e.splice(0,2),e}return[]}(a),C=function(t,e,a,i){var n=r.weightFactor(e);if(n<=r.minSize)return!1;var s,l=1;n<o&&(l=function(){for(var t=2;t*n<o;)t+=2;return t}()),s=v?v(t,e,n,i):r.fontWeight;var d=document.createElement("canvas"),u=d.getContext("2d",{willReadFrequently:!0});u.font=s+" "+(n*l).toString(10)+"px "+r.fontFamily;var f=u.measureText(t).width/l,c=Math.max(n*l,u.measureText("m").width,u.measureText("Ｗ").width)/l,h=f+2*c,m=3*c,g=Math.ceil(h/p),w=Math.ceil(m/p);h=g*p,m=w*p;var y=-f/2,x=.4*-c,M=Math.ceil((h*Math.abs(Math.sin(a))+m*Math.abs(Math.cos(a)))/p),S=Math.ceil((h*Math.abs(Math.cos(a))+m*Math.abs(Math.sin(a)))/p),b=S*p,I=M*p;d.setAttribute("width",b),d.setAttribute("height",I),u.scale(1/l,1/l),u.translate(b*l/2,I*l/2),u.rotate(-a),u.font=s+" "+(n*l).toString(10)+"px "+r.fontFamily,u.fillStyle="#000",u.textBaseline="middle",u.fillText(t,y*l,(x+.5*n)*l);var T=u.getImageData(0,0,b,I).data;if(D())return!1;for(var k,C,E,A=[],O=S,F=[M/2,S/2,M/2,S/2];O--;)for(k=M;k--;){E=p;t:for(;E--;)for(C=p;C--;)if(T[4*((k*p+E)*b+(O*p+C))+3]){A.push([O,k]),O<F[3]&&(F[3]=O),O>F[1]&&(F[1]=O),k<F[0]&&(F[0]=k),k>F[2]&&(F[2]=k);break t}}return{mu:l,occupied:A,bounds:F,gw:S,gh:M,fillTextOffsetX:y,fillTextOffsetY:x,fillTextWidth:f,fillTextHeight:c,fontSize:n}}(s,l,I,k);if(!C)return!1;if(D())return!1;if(!r.drawOutOfBound&&!r.shrinkToFit){var E=C.bounds;if(E[1]-E[3]+1>f||E[2]-E[0]+1>c)return!1}for(var A=m+1;A--;){var O=F(m-A);r.shuffle&&(O=[].concat(O),n(O));for(var R=0;R<O.length;R++){var z=(h=O[R],g=void 0,y=void 0,g=Math.floor(h[0]-C.gw/2),y=Math.floor(h[1]-C.gh/2),C.gw,C.gh,!!function(t,e,a,i,o){for(var n=o.length;n--;){var s=t+o[n][0],l=e+o[n][1];if(s>=f||l>=c||s<0||l<0){if(!r.drawOutOfBound)return!1}else if(!u[s][l])return!1}return!0}(g,y,0,0,C.occupied)&&(function(e,a,i,o,n,s,l,d,u,f){var c,h,m,g=i.fontSize;c=w?w(o,n,g,s,l,f):r.color,h=v?v(o,n,g,f):r.fontWeight,m=b?b(o,n,g,f):r.classes,t.forEach((function(t){if(t.getContext){var n=t.getContext("2d"),s=i.mu;n.save(),n.scale(1/s,1/s),n.font=h+" "+(g*s).toString(10)+"px "+r.fontFamily,n.fillStyle=c,n.translate((e+i.gw/2)*p*s,(a+i.gh/2)*p*s),0!==d&&n.rotate(-d),n.textBaseline="middle",n.fillText(o,i.fillTextOffsetX*s,(i.fillTextOffsetY+.5*g)*s),n.restore()}else{var l=document.createElement("span"),f="";f="rotate("+-d/Math.PI*180+"deg) ",1!==i.mu&&(f+="translateX(-"+i.fillTextWidth/4+"px) scale("+1/i.mu+")");var w={position:"absolute",display:"block",font:h+" "+g*i.mu+"px "+r.fontFamily,left:(e+i.gw/2)*p+i.fillTextOffsetX+"px",top:(a+i.gh/2)*p+i.fillTextOffsetY+"px",width:i.fillTextWidth+"px",height:i.fillTextHeight+"px",lineHeight:g+"px",whiteSpace:"nowrap",transform:f,webkitTransform:f,msTransform:f,transformOrigin:"50% 40%",webkitTransformOrigin:"50% 40%",msTransformOrigin:"50% 40%"};for(var v in c&&(w.color=c),l.textContent=o,w)l.style[v]=w[v];if(u)for(var y in u)l.setAttribute(y,u[y]);m&&(l.className+=m),t.appendChild(l)}}))}(g,y,C,s,l,m-A,h[2],I,d,k),function(e,a,i,o,n,s){var l,d,u=n.occupied,h=r.drawMask;if(h&&((l=t[0].getContext("2d")).save(),l.fillStyle=r.maskColor),T){var m=n.bounds;d={x:(e+m[3])*p,y:(a+m[0])*p,w:(m[1]-m[3]+1)*p,h:(m[2]-m[0]+1)*p}}for(var g=u.length;g--;){var w=e+u[g][0],v=a+u[g][1];w>=f||v>=c||w<0||v<0||P(w,v,h,d,s)}h&&l.restore()}(g,y,0,0,C,a),{gx:g,gy:y,rot:I,info:C}));if(z)return z}}return r.shrinkToFit?(Array.isArray(a)?a[1]=3*a[1]/4:a.weight=3*a.weight/4,e(a,i+1)):null},z=function(e,a,r){if(a)return!t.some((function(t){var a=new CustomEvent(e,{detail:r||{}});return!t.dispatchEvent(a)}),this);t.forEach((function(t){var a=new CustomEvent(e,{detail:r||{}});t.dispatchEvent(a)}),this)};!function(){var e=t[0];if(e.getContext)f=Math.ceil(e.width/p),c=Math.ceil(e.height/p);else{var i=e.getBoundingClientRect();f=Math.ceil(i.width/p),c=Math.ceil(i.height/p)}if(z("wordcloudstart",!0)){var o,n,l,d,w;if(h=r.origin?[r.origin[0]/p,r.origin[1]/p]:[f/2,c/2],m=Math.floor(Math.sqrt(f*f+c*c)),u=[],!e.getContext||r.clearCanvas)for(t.forEach((function(t){if(t.getContext){var e=t.getContext("2d");e.fillStyle=r.backgroundColor,e.clearRect(0,0,f*(p+1),c*(p+1)),e.fillRect(0,0,f*(p+1),c*(p+1))}else t.textContent="",t.style.backgroundColor=r.backgroundColor,t.style.position="relative"})),o=f;o--;)for(u[o]=[],n=c;n--;)u[o][n]=!0;else{var v=document.createElement("canvas").getContext("2d");v.fillStyle=r.backgroundColor,v.fillRect(0,0,1,1);var y,x,M=v.getImageData(0,0,1,1).data,S=e.getContext("2d").getImageData(0,0,f*p,c*p).data;for(o=f;o--;)for(u[o]=[],n=c;n--;){x=p;t:for(;x--;)for(y=p;y--;)for(l=4;l--;)if(S[4*((n*p+x)*f*p+(o*p+y))+l]!==M[l]){u[o][n]=!1;break t}!1!==u[o][n]&&(u[o][n]=!0)}S=v=M=void 0}if(r.hover||r.click){for(T=!0,o=f+1;o--;)k[o]=[];r.hover&&e.addEventListener("mousemove",E),r.click&&(e.addEventListener("click",A),e.addEventListener("touchstart",A),e.addEventListener("touchend",(function(t){t.preventDefault()})),e.style.webkitTapHighlightColor="rgba(0, 0, 0, 0)"),e.addEventListener("wordcloudstart",(function t(){e.removeEventListener("wordcloudstart",t),e.removeEventListener("mousemove",E),e.removeEventListener("click",A),I=void 0}))}l=0;var b=!0;r.layoutAnimation?0!==r.wait?(d=window.setTimeout,w=window.clearTimeout):(d=window.setImmediate,w=window.clearImmediate):(d=function(t){t()},w=function(){b=!1});var C=function(e,a){t.forEach((function(t){t.removeEventListener(e,a)}),this)},O=function t(){C("wordcloudstart",t),w(s[a])};!function(e,a){t.forEach((function(t){t.addEventListener("wordcloudstart",a)}),this)}(0,O),s[a]=(r.layoutAnimation?d:setTimeout)((function t(){if(b){if(l>=r.list.length)return w(s[a]),z("wordcloudstop",!1),C("wordcloudstart",O),void delete s[a];g=(new Date).getTime();var e=R(r.list[l],0),i=!z("wordclouddrawn",!0,{item:r.list[l],drawn:e});if(D()||i)return w(s[a]),r.abort(),z("wordcloudabort",!1),z("wordcloudstop",!1),void C("wordcloudstart",O);l++,s[a]=d(t,r.wait)}}),r.wait)}}()}function L(t,e){return"hsl("+(360*Math.random()).toFixed()+","+(30*Math.random()+70).toFixed()+"%,"+(Math.random()*(e-t)+t).toFixed()+"%)"}};l.isSupported=i,l.minFontSize=o;const d=l;if(!d.isSupported)throw new Error("Sorry your browser not support wordCloud");r.registerLayout((function(t,e){t.eachSeriesByType("wordCloud",(function(a){var i=r.helper.getLayoutRect(a.getBoxLayoutParams(),{width:e.getWidth(),height:e.getHeight()}),o=a.get("keepAspect"),n=a.get("maskImage"),s=n?n.width/n.height:1;o&&function(t,e){var a=t.width,r=t.height;a>r*e?(t.x+=(a-r*e)/2,t.width=r*e):(t.y+=(r-a/e)/2,t.height=a/e)}(i,s);var l=a.getData(),u=document.createElement("canvas");u.width=i.width,u.height=i.height;var f=u.getContext("2d");if(n)try{f.drawImage(n,0,0,u.width,u.height),function(t){for(var e=t.getContext("2d"),a=e.getImageData(0,0,t.width,t.height),r=e.createImageData(a),i=0,o=0,n=0;n<a.data.length;n+=4)a.data[n+3]>128&&(i+=l=a.data[n]+a.data[n+1]+a.data[n+2],++o);var s=i/o;for(n=0;n<a.data.length;n+=4){var l=a.data[n]+a.data[n+1]+a.data[n+2];a.data[n+3]<128||l>s?(r.data[n]=0,r.data[n+1]=0,r.data[n+2]=0,r.data[n+3]=0):(r.data[n]=255,r.data[n+1]=255,r.data[n+2]=255,r.data[n+3]=255)}e.putImageData(r,0,0)}(u)}catch(t){console.error("Invalid mask image"),console.error(t.toString())}var c=a.get("sizeRange"),h=a.get("rotationRange"),m=l.getDataExtent("value"),g=Math.PI/180,w=a.get("gridSize");function v(t){var e=t.detail.item;t.detail.drawn&&a.layoutInstance.ondraw&&(t.detail.drawn.gx+=i.x/w,t.detail.drawn.gy+=i.y/w,a.layoutInstance.ondraw(e[0],e[1],e[2],t.detail.drawn))}d(u,{list:l.mapArray("value",(function(t,e){var a=l.getItemModel(e);return[l.getName(e),a.get("textStyle.fontSize",!0)||r.number.linearMap(t,m,c),e]})).sort((function(t,e){return e[1]-t[1]})),fontFamily:a.get("textStyle.fontFamily")||a.get("emphasis.textStyle.fontFamily")||t.get("textStyle.fontFamily"),fontWeight:a.get("textStyle.fontWeight")||a.get("emphasis.textStyle.fontWeight")||t.get("textStyle.fontWeight"),gridSize:w,ellipticity:i.height/i.width,minRotation:h[0]*g,maxRotation:h[1]*g,clearCanvas:!n,rotateRatio:1,rotationStep:a.get("rotationStep")*g,drawOutOfBound:a.get("drawOutOfBound"),shrinkToFit:a.get("shrinkToFit"),layoutAnimation:a.get("layoutAnimation"),shuffle:!1,shape:a.get("shape")}),u.addEventListener("wordclouddrawn",v),a.layoutInstance&&a.layoutInstance.dispose(),a.layoutInstance={ondraw:null,dispose:function(){u.removeEventListener("wordclouddrawn",v),u.addEventListener("wordclouddrawn",(function(t){t.preventDefault()}))}}}))})),r.registerPreprocessor((function(t){var e=(t||{}).series;!r.util.isArray(e)&&(e=e?[e]:[]);var a=["shadowColor","shadowBlur","shadowOffsetX","shadowOffsetY"];function i(t){t&&r.util.each(a,(function(e){t.hasOwnProperty(e)&&(t["text"+r.format.capitalFirst(e)]=t[e])}))}r.util.each(e,(function(t){if(t&&"wordCloud"===t.type){var e=t.textStyle||{};i(e.normal),i(e.emphasis)}}))}))},83:e=>{e.exports=t}},a={};function r(t){if(a[t])return a[t].exports;var i=a[t]={exports:{}};return e[t](i,i.exports,r),i.exports}return r.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r(638)})()}));
      //# sourceMappingURL=echarts-wordcloud.min.js.map
      
      this.dispose()
  
      // https://www.npmjs.com/package/echarts-wordcloudbyinput
      const series = [{
        data: phrase.map(p => {
          return {
            name: p.phrase,
            value: p.count
          }
        }),
        type: 'wordCloud',
        shape: 'circle',
        // A silhouette image which the white area will be excluded from drawing texts.
        // The shape option will continue to apply as the shape of the cloud to grow.
        // maskImage: maskImage,
        // Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
        // Default to be put in the center and has 75% x 80% size.
        left: 'center',
        top: 'center',
        width: '100%',
        height: '100%',
        right: null,
        bottom: null,
        // Text size range which the value in data will be mapped to.
        // Default to have minimum 12px and maximum 60px size.
        sizeRange: [12, 60],
        // Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45
        rotationRange: [-90, 90],
        rotationStep: 45,
        // size of the grid in pixels for marking the availability of the canvas
        // the larger the grid size, the bigger the gap between words.
        gridSize: 8,
        // set to true to allow word being draw partly outside of the canvas.
        // Allow word bigger than the size of the canvas to be drawn
        drawOutOfBound: false,
        // If perform layout animation.
        // NOTE disable it will lead to UI blocking when there is lots of words.
        layoutAnimation: true,
        // Global text style
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          // Color can be a callback function or a color string
          color: function () {
            // Random color
            return 'rgb(' + [
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160)
            ].join(',') + ')'
          }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            shadowBlur: 10,
            shadowColor: '#333'
          }
        }
      }]
  
      this._echart = echarts.init(this._root)
      // https://echarts.apache.org/en/option.html
      this._echart.setOption({
        series
      })
    }
  
    dispose () {
      if (this._echart) {
        echarts.dispose(this._echart)
      }
    }
  }
  
  const template = document.createElement('template')
  template.innerHTML = `
  <style>
      #chart {
          width: 100%;
          height: 100%;
      }
  </style>
  <div id="root" style="width: 100%; height: 100%;">
      <div id="chart"></div>
  </div>
  `
  
  class Main extends HTMLElement {
    constructor () {
      super()
  
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(template.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root')
  
      this._renderer = new Renderer(this._root)
    }
  
    // ------------------
    // LifecycleCallbacks
    // ------------------
    async onCustomWidgetBeforeUpdate (changedProps) {
    }
  
    async onCustomWidgetAfterUpdate (changedProps) {
      if (changedProps.text) {
        this.render()
      }
    }
  
    async onCustomWidgetResize (width, height) {
      this.render()
    }
  
    async onCustomWidgetDestroy () {
      this.dispose()
    }
  
    // ------------------
    //
    // ------------------
    // setText (text) {
    //   debugger
    //   // this._text = text
    //   this.dispatchEvent(new CustomEvent('propertiesChanged', { detail: { properties: { text } } }))
    //   // this.render()
    //   // this._text = '' // TODO
    //
    //   // this.text = text
    // }
  
    dispose () {
      this._renderer.dispose()
    }
  
    async render () {
      if (!document.contains(this)) {
        // Delay the render to assure the custom widget is appended on dom
        setTimeout(this.render.bind(this), 0)
        return
      }
      this._renderer.dispose()
  
      const text = this._text || this.text
  
      const byPhrase = {}
      text.toLowerCase().split(' ').map(word => {
        byPhrase[word] = byPhrase[word] || {
          phrase: word,
          count: 0
        }
        byPhrase[word].count++
      })
  
      const phrase = []
      for (const word in byPhrase) {
        phrase.push(byPhrase[word])
      }
  
      this._renderer.render(phrase)
    }
  }
  
  customElements.define('com-sap-sac-sample-echarts-wordcloudbyinput', Main)
  
})()