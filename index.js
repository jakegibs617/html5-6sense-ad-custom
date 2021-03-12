function init() {
  window.dynamicContent = document.getElementById('content'); // The div to replace the image into.
  window.clickUrl = undefined; // the global variable to store the click url.
  window.companyName = undefined;  // the global variable to store the company name. 
  window.companyText1 = undefined;  // the global variable to store the company associated text part 1.
  window.companyText2 = undefined;  // the global variable to store the company associated text part 2.
  window.buttonCTA = undefined;  // the global variable to store the dynamic button CTA.
  window.bgimage = undefined;  // the global variable to store the dynamic background image.
  showImage(loader); // temporarily show the loader gif. 
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function () {
    addListeners(); // Adding click listener to content; to handle click redirects.
    if (this.readyState == 4) { // After we get the response.
      if (this.status === 200){ // if we get the success response.
        res = JSON.parse(this.responseText); // parse the response from company details api.
        companyName = res.company.name;
        var matchedMappingKey = Object.keys(companyUrlMapping).find(function (name) {
          return name.toLowerCase() === companyName.toLowerCase();
        }); // match company name ignoring case from the mapping object.
        if (companyName && matchedMappingKey) {
          clickUrl = companyUrlMapping[matchedMappingKey].link; // get the custom click url from mapping.
          companyText1 = companyUrlMapping[matchedMappingKey].text1; // get the custom text part 1 for the company.
          companyText2 = companyUrlMapping[matchedMappingKey].text2; // get the custom text part 2 for the company.
          buttonCTA = companyUrlMapping[matchedMappingKey].buttonCTA; // get the button text for the company.
          bgimage = companyUrlMapping[matchedMappingKey].bgimage; // get the custom background image.
          displayPersonalizedText(companyName, companyText1, companyText2, clickUrl, buttonCTA); // passing params to be rendered in html.
          showImage(bgimage); // passing the custom background image to the function that handles the image.
        }
        else {
          // the company name is not in the list you are targeting.
          companyName = undefined;          
          clickUrl = "https://www.a-link-that-wont-show-up-when-the-company-matches.com"
          companyText1 = "You are not my target audience"
          companyText2 = "Some other text to add with a different style"
          buttonCTA = "Defualt CTA text"
          displayPersonalizedText(companyName, companyText1, companyText2, clickUrl, buttonCTA);
          showImage(bgimage);         }
      }
    }
  });

  xhr.open("GET", "https://epsilon.6sense.com/v1/company/details"); // The actual call made to company details api.
  xhr.setRequestHeader("Authorization", "Token <insert token here>"); // The company details api-token (provided by 6sense) goes here.
  // xhr.setRequestHeader("X-Forwarded-For", "<IP_ADDRESS>"); To test your HTML5 ad uncomment this line and put the appropiate ip address for the account you want to test
  xhr.timeout = 5000; // ideal to wait for 5 seconds.
  xhr.send(); // The call starts here.
}

function showImage(img) {
  if (img){ 
    dynamicContent.style.backgroundImage = "url(images/" + img + ")"; // set the param image to the background image.
  }
  else{
    img = loader // if no background image is defined yet, set it to be the loader gif.
    showImage(); // rerun this function with the loader gif.
  };
}

function displayPersonalizedText(userCompanyName, userCompanyText1, userCompanyText2, userClickUrl, userButtonCTA) {
  var companyNameEle = document.getElementById('company-name'); // the div that shows the custom text, the company name.
  var companyText1Ele = document.getElementById('company-text1'); // the div that shows the custom text part 1.
  var companyText2Ele = document.getElementById('company-text2'); // the div that shows the custom text part 2.
  var companyCTAEle = document.getElementById('company-cta'); // the div that shows the custom button text.

  // if the company name exists, assign the value to the html element.
  if (userCompanyName) {
    companyNameEle.innerHTML = userCompanyName
  };
  // including the no company default, if the params exists, map those to the html.
  if (userCompanyText1 && userCompanyText2 && userButtonCTA) {
    companyText1Ele.innerHTML = userCompanyText1
    companyText2Ele.innerHTML = userCompanyText2
    companyCTAEle.innerHTML = userButtonCTA
  };
}

function addListeners() {
	dynamicContent.addEventListener('click', clickEventHandler, false);
}

function clickEventHandler(e) { // function that redirects to landing page url. We get the landing page url from APPNEXUS library.
  function updateClickUrl(clickTag, dynamicClickUrl, dynamicCompanyName) {
    var baseClickTag, anClickUrl, sixSenseClickUrl, modifiedDynamicClickUrl;
    var anClickUrlKey = 'clickenc=';
    modifiedDynamicClickUrl = new URL(dynamicClickUrl);
    modifiedDynamicClickUrl.searchParams.set('xsrc', '6s'); // set param for source to be from 6s to the clickurl from mapped item.
    // add your query params to your custom click URL here, if needed.
    if(dynamicCompanyName) {
      modifiedDynamicClickUrl.searchParams.set('xdcname', dynamicCompanyName); // set param to recogonize the user company name to the clickUrl from the maped item.
    }
    baseClickTag = clickTag.split(anClickUrlKey)[0];
    anClickUrl = clickTag.split(anClickUrlKey)[1];
    sixSenseClickUrl = new URL(decodeURIComponent(anClickUrl));
    sixSenseClickUrl.searchParams.set('redirect', modifiedDynamicClickUrl); // update redirect URL to clickUrl from mapped item with, modified with additionam params 'xsrc' and 'xdcname'.
    // DO NOT ADD ANY MORE QUERY PARAMS HERE, this is for 6sense analytics.
    if(dynamicCompanyName) {
      sixSenseClickUrl.searchParams.set('xdcname', dynamicCompanyName); // set param to recogonize the user company name
    }
    return baseClickTag + anClickUrlKey + encodeURIComponent(sixSenseClickUrl);
  }
  var clickTag = APPNEXUS.getClickTag();
  if (window.clickUrl) {
    // if custom click url for the matched mapping item present then update the app nexus.
    // click tag with some more custom query params.
    clickTag = updateClickUrl(clickTag, window.clickUrl, window.companyName);
  }
  window.open(clickTag);
}
