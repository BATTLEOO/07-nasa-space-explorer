// NASA API key provided for this app.
const apiKey = 'bSySFm7eYTwwxw4UaZlnX8GfGzmpobfARfkfKctC';

// Find the page elements we need.
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const modalCloseButton = document.querySelector('.modal-close');
const modalCloseButtons = document.querySelectorAll('[data-modal-close]');

// Set up the date inputs so they always stay in NASA's valid date range.
setupDateInputs(startInput, endInput);

function showMessage(message) {
	gallery.innerHTML = `<div class="placeholder"><p>${message}</p></div>`;
}

function openModal(item) {
	const imageUrl = item.media_type === 'video'
		? item.thumbnail_url || createFallbackPreview(item.title)
		: item.url;

	modalImage.src = imageUrl;
	modalImage.alt = item.title;
	modalTitle.textContent = item.title;
	modalDate.textContent = item.date;
	modalExplanation.textContent = item.explanation;
	imageModal.classList.add('modal-open');
	imageModal.setAttribute('aria-hidden', 'false');
	document.body.classList.add('modal-lock');
	modalCloseButton.focus();
}

function closeModal() {
	imageModal.classList.remove('modal-open');
	imageModal.setAttribute('aria-hidden', 'true');
	document.body.classList.remove('modal-lock');
	modalImage.src = '';
}

function escapeXml(text) {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function escapeHtml(text) {
	return escapeXml(text);
}

function createFallbackPreview(title) {
	const safeTitle = escapeXml(title);
	const svg = `
		<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
			<rect width="1200" height="800" fill="#111827" />
			<circle cx="980" cy="140" r="90" fill="#374151" />
			<text x="80" y="360" fill="#ffffff" font-family="Arial, sans-serif" font-size="64" font-weight="700">${safeTitle}</text>
			<text x="80" y="450" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="28">Preview unavailable for this APOD video</text>
		</svg>
	`;

	return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function renderGallery(items) {
	gallery.innerHTML = '';

	items.forEach((item) => {
		const card = document.createElement('article');
		card.className = 'gallery-item';
		const safeTitle = escapeHtml(item.title);
		const safeDate = escapeHtml(item.date);
		const imageUrl = item.media_type === 'video'
			? item.thumbnail_url || createFallbackPreview(item.title)
			: item.url;

		card.innerHTML = `
			<button class="gallery-image-button" type="button" aria-label="Open ${safeTitle} in a modal">
				<img src="${imageUrl}" alt="${safeTitle}" loading="lazy" />
			</button>
			<div class="gallery-item-content">
				<h2>${safeTitle}</h2>
				<p class="gallery-date">${safeDate}</p>
			</div>
		`;

		card.querySelector('.gallery-image-button').addEventListener('click', () => {
			openModal(item);
		});

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
		const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;
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

modalCloseButtons.forEach((button) => {
	button.addEventListener('click', closeModal);
});

imageModal.addEventListener('click', (event) => {
	if (event.target === imageModal) {
		closeModal();
	}
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && imageModal.classList.contains('modal-open')) {
		closeModal();
	}
});
