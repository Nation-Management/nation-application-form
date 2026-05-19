// Create application only
DomReady(() => {
  addPageLoaderWithText();
  const pageLoader = document.querySelector('.js-load-fullpage');
  pageLoader.style.background = "#fff";
  const urlParams = new URLSearchParams(window.location.search);

  const dealid = urlParams.get('dealid') ? urlParams.get('dealid') : "0";
  const deBug = urlParams.get('hsDebug') ? true : false;

  const contact_section = document.querySelector('.js-section-wrapper');
  const contactid = contact_section.dataset.memberid;
  const date_inputs = document.querySelectorAll('.js-dateinput');
  returnDateToForm(date_inputs);

  var movedate = document.querySelectorAll('.js-movecalendar');
  returnDateToForm(movedate);
  const createNewBtn = document.querySelector('.js-save-exit');

  if (dealid != 0) {
    console.log("has deal, check deal");
    const hasAssocaitedDeal = contact_section.dataset.existingdeal;
    const validDeal = contact_section.dataset.dealvalid;

    if (validDeal == "true") {
      console.log("valid");
      if (hasAssocaitedDeal == "0") {
        console.log("no associated deal");
        setTimeout(function () {
          createNewApplication(createNewBtn, "Draft", contactid, dealid);
        }, 1000);
      } else {
        const applicationID = contact_section.dataset.existingapplicationid;
        showPopupInfoBox('The joint application is only available to invitees. An existing application exists', applicationID);
      }
    } else {
      const popupInfoBox = document.getElementById('popupInfoBox');
      popupInfoBox.style.display = 'block';
      popupInfoBox.innerHTML = 'Invalid Deal, please try again';
    }
  } else {
    setTimeout(function () {
      createNewApplication(createNewBtn, "Draft", contactid, dealid);
    }, 1000);
  }
});

const observer = new MutationObserver(function (mutationsList) {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      buildList();
    }
  }
});

function showPopupInfoBox(message, applicationid) {
  const popupInfoBox = document.getElementById('popupInfoBox');
  popupInfoBox.style.display = 'block';
  let errorMessageHTML = message;
  errorMessageHTML += '<br/><p>';
  errorMessageHTML += `<span><a class="button underlineLink map_link" href="/tenancy-application?appid=${applicationid}">Edit existing application</span>`;
  errorMessageHTML += '</p>';
  popupInfoBox.innerHTML = errorMessageHTML;
}

function addPageLoaderWithText() {
  const pageLoader = document.querySelector('.js-page-loader-section');
  const thankYouDiv = document.createElement('div');
  thankYouDiv.className = 'page-loader-text';
  thankYouDiv.innerHTML = `<h4>Thank you. This shouldn't take long, but please don't refresh or leave this screen, while we set everything up behind the scenes.</h4>`;
  pageLoader.appendChild(thankYouDiv);
  pageLoader.classList.add('page-loader');
  pageLoader.classList.add('js-load-fullpage');
}
