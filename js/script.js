// NASA API key provided for this app.
const apiKey = 'bSySFm7eYTwwxw4UaZlnX8GfGzmpobfARfkfKctC';

// Find the page elements we need.
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Set up the date inputs so they always stay in NASA's valid date range.
setupDateInputs(startInput, endInput);

function showMessage(message) {
	gallery.innerHTML = `<div class="placeholder"><p>${message}</p></div>`;
}

function renderGallery(items) {
	gallery.innerHTML = '';

	items.forEach((item) => {
		const card = document.createElement('article');
		card.className = 'gallery-item';

		const media = item.media_type === 'image'
			? `<img src="${item.url}" alt="${item.title}" loading="lazy" />`
			: `<iframe src="${item.url}" title="${item.title}" loading="lazy" allowfullscreen></iframe>`;

		card.innerHTML = `
			${media}
			<div class="gallery-item-content">
				<h2>${item.title}</h2>
				<p class="gallery-date">${item.date}</p>
				<p>${item.explanation}</p>
			</div>
		`;

		gallery.appendChild(card);
	});
}

async function fetchApodData() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate) {
		showMessage('Please choose a date range first.');
		return;
	}

	showMessage('Loading space images...');

	try {
		const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error('NASA API request failed.');
		}

		const data = await response.json();
		const items = Array.isArray(data) ? data : [data];

		renderGallery(items);
	} catch (error) {
		console.error(error);
		showMessage('Sorry, we could not load the APOD data right now.');
	}
}

// Load the default 9-day range as soon as the page opens.
fetchApodData();

// Load the selected 9-day range when the button is clicked.
getImagesButton.addEventListener('click', fetchApodData);
