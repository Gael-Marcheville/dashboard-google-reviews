// Author: Gaël Marcheville

let CLIENT_ID = '';
let starsDisplayed = [1, 2, 3, 4, 5];
let isAnswered = [1, 1];

if (config) {
    CLIENT_ID = config.CLIENT_ID;
    starsDisplayed = config.starsDisplayedFilter;
    isAnswered = config.isAnsweredFilter;
}

let accessToken;
let currentLocationId;
let currentAccountId;
let pageToken;
let reviewsListLength = 0;
let language;
var signin = false;
let averageRating = 0;
let numberOfReviews = 0;

/*
----------------------------------------------
Utils
----------------------------------------------
*/

// To convert the stars value to an image source
function convertStarsValueToImageSrc(starsValue) {
    switch (starsValue) {
        case 'FIVE':
            return "images/5_stars.png";
        case 'FOUR':
            return "images/4_stars.png";
        case 'THREE':
            return "images/3_stars.png";
        case 'TWO':
            return "images/2_stars.png";
        default:
            return "images/1_stars.png";
    }
}

// To convert the stars value to an integer
function convertStarsValueToInteger(starsValue) {
    switch (starsValue) {
        case 'FIVE':
            return 5;
        case 'FOUR':
            return 4;
        case 'THREE':
            return 3;
        case 'TWO':
            return 2;
        default:
            return 1;
    }
}

// Can be used to generate a response based on the number of stars, the comment and the name of the reviewer
// It will pre-fill the response textarea for each review
function autoReplyToReview(starsValue, comment, name) {
    var reply = '';
    return reply;
}

/*
----------------------------------------------
Display
----------------------------------------------
*/

// To display the response textarea when the user clicks on the edit button
function editResponse(reviewId, responseText) {
    const responseInput = document.createElement("textarea");
    responseInput.type = "text";
    responseInput.value = responseText;
    responseInput.style.width = "100%";
    responseInput.style.height = "200px";
    const responseCell = document.querySelector(`[data-review-id="${reviewId}"]`).getElementsByTagName("td")[2];
    responseCell.innerHTML = '';
    responseCell.appendChild(responseInput);

    const sendButton = document.createElement("button");
    sendButton.classList.add("sendButton");
    sendButton.textContent = language.body.table.actions.send;
    sendButton.addEventListener("click", function () {
        const responseText = responseInput.value;
        respondToReview(reviewId, currentLocationId, currentAccountId, responseText, accessToken);
    });
    const cancelButton = document.createElement("button");
    cancelButton.classList.add("cancelButton");
    cancelButton.textContent = language.body.table.actions.cancel;
    cancelButton.addEventListener("click", function () {
        cancelEditResponse(reviewId, responseText);
    });
    cancelButton.style.marginBottom = "3px";

    const actionsCell = document.querySelector(`[data-review-id="${reviewId}"]`).getElementsByTagName("td")[3];
    actionsCell.innerHTML = '';
    actionsCell.style.backgroundColor = "";
    actionsCell.appendChild(cancelButton);
    actionsCell.appendChild(sendButton);
}

// To cancel the response edition
function cancelEditResponse(reviewId, responseText) {
    const responseCell = document.querySelector(`[data-review-id="${reviewId}"]`).getElementsByTagName("td")[2];
    responseCell.innerHTML = '';
    responseCell.textContent = responseText;

    const editButton = document.createElement("button");
    editButton.classList.add("editButton");
    editButton.textContent = language.body.table.actions.edit;
    editButton.addEventListener("click", function () {
        editResponse(reviewId, responseText);
    });
    const actionsCell = document.querySelector(`[data-review-id="${reviewId}"]`).getElementsByTagName("td")[3];
    actionsCell.innerHTML = '';
    actionsCell.style.backgroundColor = "#9cff3a";
    actionsCell.appendChild(editButton);
}

// To display the location info (number of reviews and average rating)
function displayLocationInfo() {
    const locationInfo = document.getElementById("location-info");
    infoText = language.body.location_info_text;
    infoText = infoText.replace("[numberOfReviews]", numberOfReviews);
    infoText = infoText.replace("[averageRating]", averageRating);
    const locationInfoText = infoText;
    locationInfo.textContent = locationInfoText;
    locationInfo.style.display = "block";
}

// To update the reviews list when the filters are changed
function updateReviewsList(starsDisplayed, isAnswered) {
    const reviewsList = document.getElementById("reviews-list");
    const rows = reviewsList.getElementsByTagName("tr");
    var isGrey = false;
    var isEmpty = true;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const starsImage = row.getElementsByTagName("img")[0];
        const starsValue = convertStarsValueToInteger(starsImage.alt.split(' ')[0]);
        if (!starsDisplayed.includes(starsValue)) {
            row.style.display = "none";
        } else {
            if ((isAnswered[1] === 1 && row.dataset.isAnswered === "true") || (isAnswered[0] === 1 && row.dataset.isAnswered === "false")) {
                row.style.display = "table-row";
                if (isGrey) {
                    row.style.backgroundColor = "#f2f2f2";
                } else {
                    row.style.backgroundColor = "white";
                }
                isGrey = !isGrey;
                isEmpty = false;
            } else {
                row.style.display = "none";
            }
        }
    }
    if (isEmpty) {
        var elements = document.querySelectorAll('.onReviewsDisplayed');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "none";
        }
        document.getElementById("onReviewsEmpty").style.display = "block";
    }
    else {
        var elements = document.querySelectorAll('.onReviewsDisplayed');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "block";
        }
        document.getElementById("onReviewsEmpty").style.display = "none";
    }
}

// To display the reviews
function displayReviews(reviews, toBeCleaned = true) {
    const reviewsList = document.getElementById("reviews-list");
    var isEmpty = true;

    if (toBeCleaned) {
        reviewsList.innerHTML = '';
    }

    reviewsListLength = reviewsList.rows.length;

    reviews.forEach((review, index) => {
        if (reviewsList.rows.length > 0) {
            const rows = reviewsList.getElementsByTagName("tr");
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (row.dataset.reviewId === review.reviewId) {
                    return;
                }
            }
        }

        isEmpty = false;

        const row = reviewsList.insertRow(index + reviewsListLength);

        const infoCell = row.insertCell(0);
        const reviewCell = row.insertCell(1);
        const responseCell = row.insertCell(2);
        const actionsCell = row.insertCell(3);

        infoCell.style.width = "10%";
        reviewCell.style.width = "40%";
        responseCell.style.width = "40%";
        actionsCell.style.width = "10%";

        const reviewerName = review.reviewer.displayName || language.body.table.reviewer.anonymous;
        const reviewDate = new Date(review.updateTime);
        infoCell.textContent = `${reviewerName}\n${reviewDate.toLocaleDateString()}`;

        const starsImage = document.createElement("img");
        starsImage.src = convertStarsValueToImageSrc(review.starRating);

        starsImage.style.maxWidth = "100px";
        starsImage.alt = `${review.starRating} stars`;
        infoCell.appendChild(starsImage);

        reviewCell.textContent = review.comment;
        row.dataset.reviewId = review.reviewId;
        row.dataset.isAnswered = review.reviewReply ? true : false;

        if (review.reviewReply) {
            actionsCell.style.backgroundColor = "#9cff3a";
            responseCell.textContent = review.reviewReply.comment;
            const editButton = document.createElement("button");
            editButton.classList.add("editButton");
            editButton.textContent = language.body.table.actions.edit;
            editButton.addEventListener("click", function () {
                editResponse(review.reviewId, review.reviewReply.comment);
            });
            actionsCell.appendChild(editButton);
        } else {

            var responseText = ''
            var name = null
            if (!review.reviewer.isAnonymous) {
                name = review.reviewer.displayName.split(' ')[0]
            }
            var comment = ''
            if (review.comment) {
                comment = review.comment
            }
            responseText = autoReplyToReview(convertStarsValueToInteger(review.starRating), comment, name)

            const responseInput = document.createElement("textarea");
            responseInput.type = "text";
            responseInput.value = responseText;
            responseInput.style.width = "100%";
            responseInput.style.height = "200px";
            responseCell.appendChild(responseInput);

            const sendButton = document.createElement("button");
            sendButton.classList.add("sendButton");
            sendButton.textContent = language.body.table.actions.send;
            sendButton.addEventListener("click", function () {
                const responseText = responseInput.value;
                respondToReview(review.reviewId, currentLocationId, currentAccountId, responseText, accessToken);
            });
            actionsCell.appendChild(sendButton);
        }
    });

    if (isEmpty) {
        var elements = document.querySelectorAll('.onReviewsDisplayed');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "none";
        }
        document.getElementById("onReviewsEmpty").style.display = "block";
    }
    else {
        var elements = document.querySelectorAll('.onReviewsDisplayed');
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = "block";
        }
        document.getElementById("onReviewsEmpty").style.display = "none";
    }
}

// To update the review when it has been answered
function updateReviewWhenAnswered(reviewId, responseText) {
    const reviewsList = document.getElementById("reviews-list");
    const rows = reviewsList.getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.dataset.reviewId === reviewId) {
            const responseCell = row.getElementsByTagName("td")[2];
            const actionsCell = row.getElementsByTagName("td")[3];
            responseCell.innerHTML = '';
            actionsCell.innerHTML = '';
            actionsCell.style.backgroundColor = "#9cff3a";
            responseCell.textContent = responseText;
            const editButton = document.createElement("button");
            editButton.classList.add("editButton");
            editButton.textContent = language.body.table.actions.edit;
            actionsCell.appendChild(editButton);
            editButton.addEventListener("click", function () {
                editResponse(reviewId, responseText);
            });
        }
    }
}

/*
----------------------------------------------
API calls
----------------------------------------------
*/

// To get the account ID, and then call getLocation to get the location ID
function getAccountIdThenGetLocation(accessToken) {

    document.getElementById("loader").style.display = "block";
    fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/accounts`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Réponse non valide');
            }
            return response.json()
        })
        .then(data => {
            if (data.accounts && data.accounts.length > 0) {
                currentAccountId = data.accounts[0].name;
                getLocations(accessToken, currentAccountId);
            } else {
                document.getElementById("loader").style.display = "none";
                console.error('Aucun compte n\'a été trouvé.');
            }
        })
        .catch(error => {
            document.getElementById("loader").style.display = "none";
            console.error('Une erreur s\'est produite lors de la récupération des établissements :', error);
        });
}

// To get the location ID
function getLocations(accessToken, accountId) {

    document.getElementById("loader").style.display = "block";
    const readMask = 'name,title';

    fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations?readMask=${readMask}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(response => {
            document.getElementById("loader").style.display = "none";
            if (!response.ok) {
                throw new Error('Réponse non valide');
            }
            return response.json();
        })
        .then(data => {

            const locationSelector = document.getElementById("location-selector");

            data.locations.forEach(location => {
                const option = document.createElement("option");
                option.value = location.name;
                option.textContent = location.title;
                locationSelector.appendChild(option);
            });
        })
        .catch(error => {
            document.getElementById("loader").style.display = "none";
            console.error('Une erreur s\'est produite lors de la récupération des établissements :', error);
        });
}

// To get the reviews
function getGoogleReviews(access_token, locationId, accountId) {

    document.getElementById("loader").style.display = "block";

    fetch(`https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            loadMoreButton = document.getElementById("load-more-button");
            if (data.nextPageToken) {
                pageToken = `&pageToken=${data.nextPageToken}`;
                loadMoreButton.style.display = "block";

            } else {
                loadMoreButton.style.display = "none";
            }
            document.getElementById("loader").style.display = "none";
            displayReviews(data.reviews);
            updateReviewsList(starsDisplayed, isAnswered);
            numberOfReviews = data.totalReviewCount;
            averageRating = data.averageRating;
            displayLocationInfo();
        })
        .catch(error => {
            document.getElementById("loader").style.display = "none";
            console.error('Erreur lors de la récupération des avis :', error);
        });

}

// To get the next reviews (when the user clicks on the "Load more reviews" button)
function getMoreGoogleReviews(access_token, locationId, accountId) {

    document.getElementById("loader").style.display = "block";

    fetch(`https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews?pageToken=${pageToken}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            loadMoreButton = document.getElementById("load-more-button");
            if (data.nextPageToken) {
                pageToken = `&pageToken=${data.nextPageToken}`;
                loadMoreButton.style.display = "block";

            } else {
                loadMoreButton.style.display = "none";
            }
            document.getElementById("loader").style.display = "none";
            displayReviews(data.reviews, false);
            updateReviewsList(starsDisplayed, isAnswered);
        })
        .catch(error => {
            document.getElementById("loader").style.display = "none";
            console.error('Erreur lors de la récupération des avis :', error);
        });

}

// To respond to a review
function respondToReview(reviewId, locationId, accountId, responseText, accessToken) {

    const responsePayload = {
        comment: responseText
    };

    fetch(`https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews/${reviewId}/reply`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(responsePayload)
    })
        .then(response => response.json())
        .then(data => {
            if (data && data.comment && data.updateTime) {
                updateReviewWhenAnswered(reviewId, data.comment);
            } else {
                console.error('Erreur lors de l\'envoi de la réponse :', data);
            }
        })
        .catch(error => {
            console.error('Erreur lors de l\'envoi de la réponse :', error);
        });
}

/*
----------------------------------------------
Sign in / Sign out
----------------------------------------------
*/

function handleSignInWithCustomClientID() {
    const CLIENT_ID = document.getElementById("client-id").value;
    if (!CLIENT_ID) {
        alert("Veuillez saisir un ID client valide");
        return;
    }
    const client = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: "https://www.googleapis.com/auth/business.manage",
        callback: (tokenResponse) => {
            signin = true;
            accessToken = tokenResponse.access_token;
            getAccountIdThenGetLocation(accessToken);
            document.getElementById("signin-button").textContent = language.body.sign_out;
            var elements = document.querySelectorAll('.onSignIn');
            for (var i = 0; i < elements.length; i++) {
                elements[i].style.display = "inline-block";
            }
            var elements = document.querySelectorAll('.onSignOut');
            for (var i = 0; i < elements.length; i++) {
                elements[i].style.display = "none";
            }
        }
    });
    client.requestAccessToken();
}

function handleSignOutWithCustomClientID() {
    document.getElementById("signin-button").textContent = language.body.sign_in;
    signin = false;
    google.accounts.oauth2.revoke(accessToken);
    const locationSelector = document.getElementById("location-selector");
    locationSelector.innerHTML = '<option value="">' + language.body.location_select + '</option>';
    const reviewsList = document.getElementById("reviews-list");
    reviewsList.innerHTML = '';
    elements = document.querySelectorAll('.onSignIn, .onReviewsDisplayed');
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "none";
    }
    var elements = document.querySelectorAll('.onSignOut');
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "inline-block";
    }
    document.getElementById("client-id").value = CLIENT_ID;
    document.getElementById("location-info").style.display = "none";
}

/*
----------------------------------------------
Event handlers for filters
----------------------------------------------
*/

// To handle the change of state of the star checkbox
function handleStarCheckboxChange(event) {
    if (event.target.checked) {
        starsDisplayed.push(parseInt(event.target.value));
    } else {
        starsDisplayed = starsDisplayed.filter(star => star !== parseInt(event.target.value));
    }
    updateReviewsList(starsDisplayed, isAnswered);
}

// To handle the change of state of the isAnswered checkbox
function handleIsAnsweredCheckboxChange(event) {
    if (event.target.checked) {
        isAnswered[event.target.value - 1] = 1;
    } else {
        isAnswered[event.target.value - 1] = 0;
    }
    updateReviewsList(starsDisplayed, isAnswered);
}

/* 
----------------------------------------------
Language
----------------------------------------------
*/

// To change the language
function changeLanguage(language_code) {
    fetch('./language.json')
        .then(response => response.json())
        .then(data => {
            language = data[language_code];
            console.log(language);
            document.title = language.head.title;
            if (signin) {
                document.getElementById("signin-button").textContent = language.body.sign_out;
                infoText = language.body.location_info_text;
                infoText = infoText.replace("[numberOfReviews]", numberOfReviews);
                infoText = infoText.replace("[averageRating]", averageRating);
                document.getElementById("location-info").textContent = infoText;
            }
            else { document.getElementById("signin-button").textContent = language.body.sign_in; }
            const locationSelector = document.getElementById("location-selector");
            locationSelector.getElementsByTagName("option")[0].textContent = language.body.location_select;
            const isAnsweredLabels = document.querySelectorAll('.isAnswered label');
            isAnsweredLabels[0].textContent = language.body.is_answered_label;
            isAnsweredLabels[1].textContent = language.body.is_not_answered_label;
            document.getElementById("onReviewsEmpty").textContent = language.body.is_empty;
            const tableHeaders = document.querySelectorAll('th');
            tableHeaders[0].textContent = language.body.table.header.col_1;
            tableHeaders[1].textContent = language.body.table.header.col_2;
            tableHeaders[2].textContent = language.body.table.header.col_3;
            tableHeaders[3].textContent = language.body.table.header.col_4;
            const editButtons = document.querySelectorAll('.editButton');
            editButtons.forEach((button) => {
                button.textContent = language.body.table.actions.edit;
            });
            const sendButtons = document.querySelectorAll('.sendButton');
            sendButtons.forEach((button) => {
                button.textContent = language.body.table.actions.send;
            });
            const cancelButton = document.querySelectorAll('.cancelButton');
            cancelButton.forEach((button) => {
                button.textContent = language.body.table.actions.cancel;
            });
            const loadMoreButton = document.getElementById("load-more-button");
            loadMoreButton.textContent = language.body.load_more;
        })
        .catch(error => {
            console.error('Une erreur s\'est produite lors de la récupération de la langue :', error);
        })
};

/*
----------------------------------------------
Init
----------------------------------------------
*/

// To initialize the filters
function initializeFilter(selector, values, changeHandler) {
    const checkboxes = document.querySelectorAll(selector);

    for (let i = 0; i < values.length; i++) {
        checkboxes[i].checked = true;
    }

    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', changeHandler);
    });

    const labels = document.querySelectorAll(selector + ' + label');

    labels.forEach((label, index) => {
        label.addEventListener('click', (event) => {
            event.preventDefault();
            const checkbox = checkboxes[index];
            checkbox.checked = !checkbox.checked;
            changeHandler({ target: checkbox });
        });
    });
}

// client ID initialization
clientIdInput = document.getElementById("client-id");
clientIdInput.value = CLIENT_ID;
placeholderLength = clientIdInput.placeholder.length;
textLength = clientIdInput.value.length;
clientIdInput.style.width = (placeholderLength > textLength ? placeholderLength : textLength) + "ch";

// filters initialization
initializeFilter('.rating input[type="checkbox"]', starsDisplayed, handleStarCheckboxChange);
initializeFilter('.isAnswered input[type="checkbox"]', isAnswered, handleIsAnsweredCheckboxChange);

// location selector initialization
document.getElementById("location-selector").addEventListener("change", function () {
    currentLocationId = this.value;
    getGoogleReviews(accessToken, currentLocationId, currentAccountId);
});

// "Load more reviews" button initialization
loadMoreButton = document.getElementById("load-more-button");
loadMoreButton.style.display = "none";
loadMoreButton.addEventListener("click", function () {
    getMoreGoogleReviews(accessToken, currentLocationId, currentAccountId);
});

// "Sign in" button initialization
const signinButton = document.getElementById("signin-button");
signinButton.addEventListener("click", function () {
    if (signin) {
        handleSignOutWithCustomClientID();

    } else {
        handleSignInWithCustomClientID();
    }
});

// "Change language" selector initialization, with the language file
const languageSelector = document.getElementById("language-selector");
fetch('./language.json')
    .then(response => response.json())
    .then(data => {
        if (Object.keys(data).length != 0) {
            languageSelector.innerHTML = '';
        }
        for (const [key, value] of Object.entries(data)) {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = value.name;
            languageSelector.appendChild(option);
        }
        navigator_language = navigator.language || navigator.userLanguage;
        if (Object.keys(data).includes(navigator_language)) {
            languageSelector.value = navigator_language;
        } else {
            languageSelector.value = "en";
        }
        changeLanguage(languageSelector.value);
        languageSelector.addEventListener("change", function () {
            changeLanguage(this.value);
        });

    })
    .catch(error => {
        console.error('Une erreur s\'est produite lors de la récupération de la langue :', error);
    });