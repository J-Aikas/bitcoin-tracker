const dayInMilliseconds = 60 * 60 * 24 * 1000,
	alertLabel = document.getElementById('alert'),
	answerDiv = document.getElementById('answer');
let dpMaxDate = dateTodayToString(),
	queryDateFrom = Number.NaN,
	queryDateTo = Number.NaN;

// Set minimum date of the date pickers to the date of the first data
document.getElementById('dpBearishStart').setAttribute('min', '2013-04-28');
document.getElementById('dpBearishEnd').setAttribute('min', '2013-04-28');

// Set maximum date of the date pickers to the present day
document.getElementById('dpBearishStart').setAttribute('max', dpMaxDate);
document.getElementById('dpBearishEnd').setAttribute('max', dpMaxDate);

// Event listeners for the date pickers and getting their value in Unix timestamp form
const dpStart = document.getElementById('dpBearishStart');
dpStart.addEventListener('change', e => {
	let dateStart = dpStart.value;
	let dateStartSplit = dateStart.split('-');
	let dateStartMonth = (parseInt(dateStartSplit[1])-1).toString();
	queryDateFrom = Date.UTC(dateStartSplit[0], dateStartMonth, dateStartSplit[2])/1000;
});
const dpEnd = document.getElementById('dpBearishEnd');
dpEnd.addEventListener('change', e => {
	let dateEnd = dpEnd.value;
	let dateEndSplit = dateEnd.split('-');
	let dateEndMonth = (parseInt(dateEndSplit[1])-1).toString();
	queryDateTo = Date.UTC(dateEndSplit[0], dateEndMonth, dateEndSplit[2])/1000;
});

// Event listener for the form's submit and handling of bad inputs, fetching the wanted data from CoinGecko API +
// redirecting the response to the chosen handle function
const form = document.getElementById('form');
form.addEventListener('submit', e => {
	e.preventDefault();
	if (Number.isNaN(queryDateFrom) || Number.isNaN(queryDateTo)) {
		alertLabel.innerHTML = 'Pick a start date and an end date!';
		answerDiv.innerHTML = 'The answer will appear here.';
		return;
	} else if (queryDateFrom > queryDateTo) { 
		alertLabel.innerHTML = 'End date must be after start date!';
		answerDiv.innerHTML = 'The answer will appear here.';
		return;
	} else if (queryDateFrom === queryDateTo) {
		alertLabel.innerHTML = 'End and start must have different dates!';
		answerDiv.innerHTML = 'The answer will appear here.';
		return;
	} else {
		alertLabel.innerHTML = '';
	}
	let url = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=' 
	+ queryDateFrom + '&to=' + (queryDateTo + 3600);
	fetch(url)
		.then(response => {
			if (!response.ok) {
				throw new Error(answerDiv.innerHTML = `HTTP error: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			if (btnBearish.checked === true) {
				handleBearishResponse(data);
			} else if (btnVolume.checked === true) {
				handleVolumeResponse(data);
			} else if (btnBuyAndSell.checked === true) {
				handeBuySellResponse(data);
			}
		})
		.catch(err => answerDiv.innerHTML = `Something went wrong: ${err}`);
});
// Get date string to set date pickers' max date to today in UTC
function dateTodayToString() {
	const today = new Date().toISOString();
	const day = today.slice(8, 10);
	const month = today.slice(5, 7);
 	const year = today.slice(0, 4);
	const readyTodayString = year + '-' + month + '-' + day;
	return readyTodayString;
}

// Longest bearish trend
function handleBearishResponse(data) {
	const pricesArr = getDataByDay(data.prices);
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
function handleVolumeResponse(data) {
	const volumesArr = getDataByDay(data.total_volumes);
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
	+ '. Volume: ' + highestVolume + ' €.';
}

// Best day to buy and sell
function handeBuySellResponse(data) {
	const pricesArr = getDataByDay(data.prices);

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
function getDataByDay(data) {
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
