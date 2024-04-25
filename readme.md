## About the project

This project is a simple web application that allows you to manage your Google Reviews to see, filter, and reply to them. It is built with HTML, CSS, and JavaScript. It's available in English, French and Spanish.

[Google Reviews Manager Screenshot](https://dashboard-reviews.000webhostapp.com/screen.png)

[Google Reviews Manager Demo](https://app-gaelmarcheville.koyeb.app/)  
Note: The demo is hosted on a free web hosting service, so it may take a few seconds to load. You need to add https://app-gaelmarcheville.koyeb.app/ to the list of authorized JavaScript origins of your Client ID to use the demo (cf [Getting started](#getting-started)).

## Getting started

### Prerequisites

To run this project, you will need:

1. A Google account with access to Google My Business
2. A project in the [Google Cloud Platform Console](https://console.cloud.google.com/)
3. An access for your project to the [Google My Business API](https://developers.google.com/my-business/content/prereqs?)
4. The [Google My Business API](https://console.cloud.google.com/marketplace/product/google/mybusiness.googleapis.com), [My Business Account Management API](https://developers.google.com/my-business/reference/accountmanagement/rest?), and
[Google My Business Business Information](https://developers.google.com/my-business/reference/businessinformation) enabled for your project
5. A [Client ID](https://console.cloud.google.com/apis/credentials) for your project. Don't forget to add your domain you will be running the project on to the list of authorized JavaScript origins. For example, if you will be running the project on `http://localhost:8080`, you will need to add `http://localhost:8080` to the list of authorized JavaScript origins.

### Local installation
1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/Project-Name.git
   ```
2. Fulfill url_website in `config.js` with : `http://localhost:8080` 
3. OPTIONAL : Fulfill `config.js` with your Client ID and the values of star rating and answered filters you want to pre-fill in the app. By default, the app will display all reviews. You can fulfill or give another Client ID at the start of the app.
4. Build the project
   ```sh
   npm install
   ```
5 Run the project
   ```sh
   node server.mjs
   ```
6. Go to the URL `http://localhost:8080`  in your browser. You should see the app !

### Deploy the project on Koyeb
1. Fork the repo
2. Create a new Web App on Koyeb :
- Deployement method : Github
- Repository : your forked repo
- Build command : 
   ```sh
   npm install
   ```
- Run command :
   ```sh
   npm run start
   ```
- Port : 
   - 8000 mapped to /
   - 3000 mapped to /proxy
- Deploy, please note the URL of your app
3. Fulfill url_website in `config.js` with the URL of your app, git push the change and go to the URL of your app. You should see the app !

## To do more with this project

### Add your own Autoresponder

In `script.js` you can add your own autoresponder. You can do this with the `autoReplyToReview` function.  
This function takes three parameters: `starsValue`, `comment`, and `name`. 

1. The `starsValue` parameter is the number of stars the review has. 
2. The `comment` parameter is the text of the review. 
3. The `name` parameter is the name of the person who left the review. You can use these parameters to create your own autoresponder. 

It will prefill the reply box with your autoresponder for each review that matches the parameters you set, and you can edit the reply before sending it.