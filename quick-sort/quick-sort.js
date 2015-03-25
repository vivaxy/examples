// var
function getQueryStringByName(name){
	var result = location.search.match(new RegExp("[?&]" + name+ "=([^&]+)","i"));
	if(result == null || result.length < 1){
		return "";
	}
	return result[1];
}
var interval = getQueryStringByName("interval");
var number = getQueryStringByName("number");
if (interval == ""){
	interval = 10;
}
if (number == ""){
	number = 100;
}

// define function
var steps = []; // select compare move
var quickSort = function(a, start, end){
	var i = start, j = end;
	steps.push({select: [i,j]});
	while(i<j){
		steps.push({compareTo: i});
		while(i<j && a[i]<=a[j]){
			steps.push({compare: j});
			j--;
		}
		if(i<j){
			steps.push({compare: j});
			steps.push({move: j});
			var temp = a[i];
			a[i] = a[j];
			a[j] = temp;
		}
		steps.push({compareTo: j});
		while(i<j && a[i]<a[j]){
			steps.push({compare: i});
			i++;
		}
		if(i<j){
			steps.push({compare: i});
			steps.push({move: i});
			var temp = a[i];
			a[i] = a[j];
			a[j] = temp;
		}
	}
	if(start<i-1) quickSort(a,start,i-1);
	if(end>i+1) quickSort(a,i+1,end);
	return a;
};
// define array
var array = [], arrarInit = [];
for(var i=0;i<number;i++){
	array[i] = Math.random();
	arrarInit[i] = array[i];
}
// main
quickSort(array,0,array.length-1);
// css
var getCssName = function(name){
	var prefixes = ['', '-webkit-', '-ms-','-moz-', '-khtml-', '-o-'];
	var target = document.documentElement.style;
	for (var i=0;i<prefixes.length;i++) {
		var test = prefixes[i] + name;
		if (test in target){
			return test;
		}
	}
	return null;
};
var transition = getCssName("transition");
var css = document.styleSheets[0];
var addCss = function (sheet, selectorText, cssText, position) {
	var pos = position || sheet.cssRules.length;
	if (sheet.insertRule) {
		sheet.insertRule(selectorText + "{" + cssText + "}", pos);
	} else if (sheet.addRule) {//IE
		sheet.addRule(selectorText, cssText, pos);
	}
};
addCss(css,"div","width: "+100/number+"%; "+transition+": background "+interval/1000+"s, left "+interval/1000+"s;");
for (var i=0;i<number;i++){
	addCss(css,".div"+i,"height: "+100*arrarInit[i]+"%; top: "+100*(1-arrarInit[i])+"%;");
}
// create div
var div = [];
for (var i=0;i<number;i++){
	div[i] = document.createElement("div");
	div[i].classList.add("div"+i);
	div[i].style.left = 100/number*i+"%";
	document.body.appendChild(div[i]);
}
// animate
var toBeMoved = 0, loopVar = 0;
var loopFunc = function(){
	if (loopVar>=steps.length){
		clearTimeout(loopVar);
		for(var i=0;i<number;i++){
			div[i].classList.remove("select");
			div[i].classList.remove("compare");
			div[i].classList.remove("compareTo");
		}
		return;
	}
	if (steps[loopVar].hasOwnProperty("select")){
		for(var i=0;i<number;i++){
			div[i].classList.remove("select");
			div[i].classList.remove("compare");
			div[i].classList.remove("compareTo");
		}
		for(var i=steps[loopVar].select[0];i<=steps[loopVar].select[1];i++){
			div[i].classList.add("select");
		}
		toBeMoved = steps[loopVar].select[0];
	}
	if (steps[loopVar].hasOwnProperty("compareTo")){
		for(var i=0;i<number;i++){
			div[i].classList.remove("compareTo");
		}
		div[steps[loopVar].compareTo].classList.add("compareTo");
	}
	if (steps[loopVar].hasOwnProperty("compare")){
		for(var i=0;i<number;i++){
			div[i].classList.remove("compare");
		}
		div[steps[loopVar].compare].classList.add("compare");
	}
	if (steps[loopVar].hasOwnProperty("move")){
		var temp = div[toBeMoved].style.left;
		div[toBeMoved].style.left = div[steps[loopVar].move].style.left;
		div[steps[loopVar].move].style.left = temp;
		var divTemp = div[toBeMoved];
		div[toBeMoved] = div[steps[loopVar].move];
		div[steps[loopVar].move] = divTemp;
		toBeMoved = steps[loopVar].move;
	}
	loopVar = setTimeout(loopFunc,interval);
};
loopFunc();
