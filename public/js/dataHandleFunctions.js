'use strict;'
const dayInMilliseconds = 60 * 60 * 24 * 1000,
	answerDiv = document.getElementById('answer');

// Longest bearish trend
export function handleBearishResponse(data, queryDateFrom) {
	const pricesArr = getDataByDay(data.prices, queryDateFrom);
	let arrBearishTrends = [];
	let arrBearishTrendsIndex = 0;
	let bearishTrend = 0;
	for (let i = 1; i < pricesArr.length; i++) {
		if (pricesArr[i][1] < pricesArr[i-1][1]) {
			bearishTrend++;
		} else {
			arrBearishTrends[arrBearishTrendsIndex] = bearishTrend;
			arrBearishTrendsIndex++;
			bearishTrend = 0;
		}
	}
	const longestBearishTrend = Math.max.apply(Math, arrBearishTrends);
	answerDiv.innerHTML = 'Longest bearish trend: ' + longestBearishTrend + ' days' + '.';
}

// Highest trading volume
export function handleVolumeResponse(data, queryDateFrom) {
	const volumesArr = getDataByDay(data.total_volumes, queryDateFrom);
	let highestVolumeDate = volumesArr[0][0];
	let highestVolume = volumesArr[0][1];
	for (let i = 1; i < volumesArr.length; i++) {
		if (volumesArr[i][1] > highestVolume) {
			highestVolumeDate = volumesArr[i][0];
			highestVolume = volumesArr[i][1];
		}
	}
	const highestVolumeDateString = dateToUTCString(highestVolumeDate);
	answerDiv.innerHTML = 'Date with the highest trading volume: ' + highestVolumeDateString 
	+ '. Volume: ' + Math.round(highestVolume) + ' €.';
}

// Best day to buy and sell
export function handeBuySellResponse(data, queryDateFrom) {
	const pricesArr = getDataByDay(data.prices, queryDateFrom);

	let valleys = [];
	let valleysIndex = 0;
	if (pricesArr[0][1] < pricesArr[1][1]) {
		valleys[valleysIndex] = pricesArr[0];
		valleysIndex++;
	}
	for (let i = 1; i < pricesArr.length-1; i++) {
		if ((pricesArr[i][1] < pricesArr[i+1][1]) && (pricesArr[i][1] < pricesArr[i-1][1])) {
			valleys[valleysIndex] = pricesArr[i];
			valleysIndex++;
		} 
	}
	if (pricesArr[pricesArr.length-1][1] < pricesArr[pricesArr.length-2][1]) {
		valleys[valleysIndex] = pricesArr[pricesArr.length-1];
	}

	let peaks = [];
	let peaksIndex = 0;
	if (pricesArr[0][1] > pricesArr[1][1]) {
		peaks[peaksIndex] = pricesArr[0];
		peaksIndex++;
	}
	for (let i = 1; i < pricesArr.length-1; i++) {
		if ((pricesArr[i][1] > pricesArr[i+1][1]) && (pricesArr[i][1] > pricesArr[i-1][1])) {
			peaks[peaksIndex] = pricesArr[i];
			peaksIndex++;
		}
	}
	if ((pricesArr[pricesArr.length-1][1] > pricesArr[pricesArr.length-2][1])) {
		peaks[peaksIndex] = pricesArr[pricesArr.length-1];
	}

	let biggestDiff = 0;
	let dateBuy = 0;
	let dateSell = 0;
	for (let i = 0; i < valleys.length; i++) {
		for (let j = 0; j < peaks.length; j++) {
			if (peaks[j][1] - valleys[i][1] > biggestDiff && peaks[j][0] > valleys[i][0]) {
				biggestDiff = peaks[j][1] - valleys[i][1];
				dateBuy = valleys[i][0];
				dateSell = peaks[j][0];
			}
		}
	}
	const buyDateString = dateToUTCString(dateBuy);
	const sellDateString = dateToUTCString(dateSell);
	if (biggestDiff === 0) {
		answerDiv.innerHTML = 'Do not buy or sell.';
	} else {
		answerDiv.innerHTML = 'Buy ' + buyDateString + ', ' + 'sell ' + sellDateString + '.';
	}
}

// Pick one data point per day from the fetched data, closest to midnight
function getDataByDay(data, queryDateFrom) {
	let newestDate = queryDateFrom * 1000;
	let dataArr = [];
	let dataArrIndex = 0;
	for (let i = 0; i < data.length; i++) {
		if (data[i][0] >= newestDate) {
			dataArr[dataArrIndex] = data[i];
			dataArrIndex++;
			newestDate += dayInMilliseconds;
		}
	}
	return dataArr;
}

// Convert timestamp to a string with the date in UTC
function dateToUTCString(date) {
	const isoDateString = new Date(date).toISOString();
	const day = isoDateString.slice(8, 10);
	const month = isoDateString.slice(5, 7);
 	const year = isoDateString.slice(0, 4);
	const readyDateString = day + '.' + month + '.' + year;
	return readyDateString;
}