'use strict;'
import {handleBearishResponse, handleVolumeResponse, handeBuySellResponse} from './dataHandleFunctions.js';
const alertLabel = document.getElementById('alert'),
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
				handleBearishResponse(data, queryDateFrom);
			} else if (btnVolume.checked === true) {
				handleVolumeResponse(data, queryDateFrom);
			} else if (btnBuyAndSell.checked === true) {
				handeBuySellResponse(data, queryDateFrom);
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