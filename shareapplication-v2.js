//Share js for edit and create tenancy application form
DomReady(() => {
  const applicationMode = document.querySelector(".js-section-wrapper").dataset
    .mode;
  const applicationStatus = document.querySelector(".js-section-wrapper")
    .dataset.status;

  accordions();
  goNext(applicationMode);
  backtoEdit();
  buildList();
  calculatePoints();
  conditionalDisplayField();
  showHideConditionalFields();

  const moduleContent = document.querySelector(
    ".multi-step-form-container__outer-wrapper"
  );

  if (applicationStatus != "Draft") {
    const formCircles = document.querySelectorAll("li[step]");
    formCircles.forEach((circle, index) => {
      circle.classList.add("form-stepper-completed");
    });
  }

  const allSelects = document.querySelectorAll(".generated-ts__select");
  if (allSelects) {
    renderNewQuoteTomSelects(allSelects, multiSelectTSConfig);
  }

  const htmlSelectorOptions = document.querySelectorAll(
    ".generated-standard__select"
  );
  htmlSelectorOptions.forEach((option) => {
    handleSelectedValueOption(option);
  });

  const internalRadioNames = document.querySelectorAll(".js-radio-field");
  const radioGroups = {};

  internalRadioNames.forEach((radio) => {
    const internalName = radio.getAttribute("data-internal-name");
    if (internalName) {
      if (!radioGroups[internalName]) {
        radioGroups[internalName] = [];
      }
      radioGroups[internalName].push(radio);
    }
  });

  for (const groupName in radioGroups) {
    if (Object.prototype.hasOwnProperty.call(radioGroups, groupName)) {
      const radioInputs = radioGroups[groupName];
      setCheckedRadioBySelectedValue(groupName, radioInputs);
    }
  }

  const formCancel = document.querySelectorAll(".js-form-cancel");
  formCancel.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (document.referrer.indexOf("/creating-application") > -1) {
        history.go(-2);
      } else if (document.referrer.indexOf("/my-applications?rid=") > -1) {
        history.go(-2);
      } else if (document.referrer) {
        history.go(-1);
      } else {
        window.location = "/my-applications";
      }
    });
  });
});

function ClearFields(fields) {
  const fields_count = fields.length;
  for (let i = 0; i < fields_count; i++) {
    const this_field = fields[i];
    switch (this_field.type) {
      case "checkbox":
      case "radio":
        this_field.checked = false;
        this_field.disabled = false;
        break;
      default:
        this_field.value = "";
        break;
    }
  }
}

function CollectFormFields(form) {
  let all_fields = [];
  all_fields = Array.prototype.concat.apply(all_fields, form.getElementsByTagName("input"));
  all_fields = Array.prototype.concat.apply(all_fields, form.getElementsByTagName("select"));
  all_fields = Array.prototype.concat.apply(all_fields, form.getElementsByTagName("textarea"));
  return all_fields;
}

function showErrorPopupStep(message, stepNumbers, timeoutSecs = 3) {
  console.log("popup error", message, stepNumbers);
  const popupInfoBox = document.getElementById("popupInfoBox");
  popupInfoBox.style.display = "block";
  let errorMessageHTML = message;
  if (stepNumbers && stepNumbers.length > 0) {
    errorMessageHTML += '<span class="close-btn" onclick="removeErrorPopupStep();"></span><br/><ul class="popup-step-list">';
    stepNumbers.forEach((stepNumber) => {
      var stepSection = document.getElementById("step-" + stepNumber);
      unfilledFieldSection(stepSection);
      const element = document.querySelector(`li[step_number="${stepNumber}"]`);
      const labelElement = element.querySelector(".label");
      const labelText = labelElement.textContent.trim();
      errorMessageHTML += `<li class="popup-step-list__item"><a class="js-backtoedit link" step_number="${stepNumber}">Step ${stepNumber}: ${labelText}</a>`;
    });
    errorMessageHTML += "</ul>";
  }
  errorMessageHTML += "<br/>Click on a link above to go to step.";
  popupInfoBox.innerHTML = errorMessageHTML;
  backtoEdit();
  const summaryBox = document.querySelector('.js-residence-details');
  unfilledFieldSection(summaryBox);
  setTimeout(() => {
    removeErrorPopupStep();
  }, (timeoutSecs * 1000));
}

function removeErrorPopupStep() {
  removePageLoader();
  const popupInfoBox = document.getElementById("popupInfoBox");
  popupInfoBox.style.display = "none";
  popupInfoBox.innerHTML = "";
}

function unfilledFieldSection(stepSection) {
  const requiredFields = stepSection.querySelectorAll('[required], [required="required"]');
  requiredFields.forEach((input) => {
    if (input.classList.contains("js-radio-field")) {
      const radioGroupName = input.getAttribute("name");
      const allRadioInputs = document.querySelectorAll(`input[name="${radioGroupName}"]`);
      let isRadioChecked = false;
      allRadioInputs.forEach((radio) => { if (radio.checked) isRadioChecked = true; });
      if (!isRadioChecked) {
        input.classList.add("highlight-unfilled-input");
        input.addEventListener("change", () => {
          const allRadioInputs = document.querySelectorAll(`input[name="${input.getAttribute("name")}"]`);
          allRadioInputs.forEach((radio) => {
            radio.style.setProperty("border-color", "");
            radio.classList.remove("highlight-unfilled-input");
          });
        });
      }
    }
    if (input.type === 'select-one' || input.type === 'select-multiple') {
      if (input.selectedIndex === 0) {
        input.classList.add("highlight-unfilled-input");
        input.style.setProperty("border-color", "red", "important");
        input.addEventListener("change", () => {
          input.classList.remove("highlight-unfilled-input");
          input.style.setProperty("border-color", "");
        });
      }
    }
    if (input.type === "text" || input.type === "number" || input.type === "email" || input.type === "tel") {
      if (!input.value.trim()) {
        input.classList.add("highlight-unfilled-input");
        input.style.setProperty("border-color", "red", "important");
        input.addEventListener("change", () => {
          if (input.value.trim()) {
            input.classList.remove("highlight-unfilled-input");
            input.style.setProperty("border-color", "");
          }
        });
      }
    }
    if (input.type === 'checkbox') {
      if (!input.checked) {
        input.classList.add("highlight-unfilled-input");
        input.style.setProperty("border-color", "red", "important");
      }
      input.addEventListener("change", () => {
        input.classList.remove("highlight-unfilled-input");
        input.style.setProperty("border-color", "");
      });
    }
    const inputDocID = input.dataset.supportid;
    if (inputDocID === '0') {
      input.classList.add("highlight-unfilled-input");
      input.style.setProperty("border-color", "red", "important");
      if (input.classList.contains("js-check-value")) {
        const fileInput = input.parentElement;
        const fileButton = fileInput.querySelector(".js-file-btn");
        if (fileButton) fileButton.style.borderColor = "red";
      }
      input.addEventListener("change", () => {
        input.style.setProperty("border-color", "");
        input.classList.remove("highlight-unfilled-input");
        if (input.classList.contains("js-check-value")) {
          const fileInput = input.parentElement;
          const fileButton = fileInput.querySelector(".js-file-btn");
          if (fileButton) fileButton.style.borderColor = "";
        }
      });
    }
  });
}

function checkApplicationSummary(isvalid) {
  const summary = document.getElementById("ApplicationSummary");
  const summaryRequired = summary.querySelectorAll("[required]");
  if (summaryRequired.length > 0) {
    isvalid = validateRequiredFields(summaryRequired);
  }
  return isvalid;
}

function ValidateStep(section, step, isvalid) {
  let requiredFields = null;
  let requiredInputElements = null;
  if (step == 3) {
    const employmentTypeElement = document.querySelector(".js-employment_1_type");
    if (employmentTypeElement) {
      const employmentType = employmentTypeElement.value;
      let requiredEmploymentFields = ["[name=employment_1_type]"];
      let requiredUploadFields = [];
      switch (employmentType) {
        case "Employed":
          requiredEmploymentFields.push("[name=employment_1_company_name]");
          requiredEmploymentFields.push("[name=employment_1_role_or_title]");
          requiredEmploymentFields.push("[name=employment_1_start_date]");
          requiredEmploymentFields.push("[name=employment_1_document_type]");
          requiredUploadFields.push("[name=employment_1_document]");
          break;
        case "Retired":
          break;
        case "Unemployed":
          break;
        case "self_employed":
          requiredEmploymentFields.push("[name=employment_1_self_company_name]");
          requiredEmploymentFields.push("[name=employment_1_self_employed_abn_acn]");
          requiredEmploymentFields.push("[name=employment_1_self_date_start]");
          requiredUploadFields.push("[name=employment_1_proof_of_self_employment]");
          const employment2TypeRadios = document.getElementsByName("employment_2_type");
          const checkeEmployment2TypeRadio = Array.from(employment2TypeRadios).find(r => r.checked);
          if (checkeEmployment2TypeRadio && checkeEmployment2TypeRadio.dataset.value == "self_employed") {
            requiredEmploymentFields.push("[name=employment_2_self_company_name]");
            requiredEmploymentFields.push("[name=employment_2_self_employed_abn_acn]");
            requiredEmploymentFields.push("[name=employment_2_self_start_date]");
            requiredUploadFields.push("[name=employment_2_self_proof_of_self_employment]");
          }
          break;
        default:
          console.log(`Unknown Employment Type "${employmentType}"`);
          break;
      }
      requiredFields = requiredEmploymentFields.length > 0
        ? section.querySelectorAll(requiredEmploymentFields.join(","))
        : section.querySelectorAll("empty-node-list");
      requiredInputElements = requiredUploadFields.length > 0
        ? section.querySelectorAll(requiredUploadFields.join(","))
        : section.querySelectorAll("empty-node-list");
    }
  } else {
    requiredFields = section.querySelectorAll("[required]:not(.js-file-input)");
    requiredInputElements = section.querySelectorAll(".js-file-input[required]");
  }

  const checkRequiredFields = validateRequiredFields(requiredFields);
  const checkrequiredFileFields = areAllDataValuesValid(requiredInputElements);
  if (checkRequiredFields && checkrequiredFileFields) {
    alertunfilledValue(true, requiredFields);
  } else {
    alertunfilledValue(false, requiredFields);
    isvalid = false;
  }
  return isvalid;
}

function goNext(mode) {
  const formBtnSteps = document.querySelectorAll(".js-btn-navigate-form-step");
  formBtnSteps.forEach((formNavigationBtn) => {
    formNavigationBtn.addEventListener("click", () => {
      const stepSection = formNavigationBtn.closest(".form-step");
      const currentStepNumber = parseInt(stepSection.getAttribute('step_number'));
      if (mode === "edit") {
        ValidateStep(stepSection, currentStepNumber, true);
      }
      const stepNumber = parseInt(formNavigationBtn.getAttribute("step_number"));
      const nextStep = stepSection.nextElementSibling;
      if (nextStep) nextStep.scrollIntoView({ behavior: "smooth", block: "start" });
      const preStep = stepSection.previousElementSibling;
      if (preStep) preStep.scrollIntoView({ behavior: "smooth", block: "start" });
      navigateToFormStep(stepNumber);
      formStepCircles();
      document.querySelectorAll("li[step]").forEach((circle) => {
        circle.classList.remove("form-stepper-current");
      });
      const formStepCircle = document.querySelector('li[step="' + stepNumber + '"]');
      formStepCircle.classList.add("form-stepper-current");
    });
  });
}

function areAllDataValuesValid(elements) {
  for (const element of elements) {
    const dataValue = element.dataset.value;
    if (dataValue === undefined || dataValue === null || dataValue === '') return false;
  }
  return true;
}

function getStepNumbersWithUnfilledInputs(requiredInputElements) {
  const uniqueStepNumbers = new Set();
  const unfilledArray = [];
  requiredInputElements.forEach((requiredInput) => {
    if (!requiredInput.checkValidity()) {
      const formStep = requiredInput.closest(".form-step");
      if (formStep) {
        const stepNumber = formStep.getAttribute("step_number");
        if (stepNumber !== null && !uniqueStepNumbers.has(stepNumber)) {
          unfilledArray.push({ stepNumber, requiredInput });
          uniqueStepNumbers.add(stepNumber);
        }
      }
    }
  });
  return unfilledArray;
}

function returnUnfilledFileInputs(requiredInputElements) {
  const unfilledFileInputs = [];
  requiredInputElements.forEach((requiredInput) => {
    const fileValue = requiredInput.dataset.value;
    if (fileValue === undefined || fileValue === null || fileValue === '') {
      const formStep = requiredInput.closest(".form-step");
      if (formStep) {
        const stepNumber = formStep.getAttribute("step_number");
        if (stepNumber !== null) {
          unfilledFileInputs.push({ stepNumber, requiredInput });
        }
      }
    }
  });
  return unfilledFileInputs;
}

function highlightStepsWithUnfilledInputs(stepNumbers, actionMethod) {
  const formStepper = document.querySelector(".form-stepper");
  const stepforFilled = [];
  const classToRemove = "form-stepper-alert highlight-unfilled";
  if (formStepper) {
    const formStepperItems = formStepper.querySelectorAll(".form-stepper-list");
    formStepperItems.forEach((stepItem) => {
      const stepNumber = stepItem.getAttribute("step_number");
      if (stepNumbers.includes(stepNumber)) {
        stepItem.classList.add(...classToRemove.split(" "));
        if (actionMethod == 'check') stepItem.classList.remove('form-stepper-completed');
      } else {
        stepItem.classList.remove(...classToRemove.split(" "));
        stepItem.classList.add("form-stepper-completed");
        stepforFilled.push(stepNumber);
      }
    });
  }
  return stepforFilled;
}

function conditionDisplayContent(val, content) {
  const inputs = content.querySelectorAll(".js-condition-required");
  if (val) {
    content.classList.add("display--none");
  } else {
    content.classList.remove("display--none");
  }
  inputs.forEach((input) => {
    if (val) {
      input.removeAttribute("required");
    } else {
      input.setAttribute("required", "");
    }
    if (input.classList.contains("js-file-field")) {
      console.log("togglging jscheckval 2", input);
      input.classList.toggle("js-check-value", !val);
      const fileElement = input.closest(".js-file-upload");
      const labelElement = fileElement.querySelector(".file-title");
      if (labelElement) labelElement.classList.toggle("input-required", !val);
    } else if (input.classList.contains("js-radio-field")) {
      const radioWrapper = input.closest(".js-radio-wrapper");
      const radioTitleElement = radioWrapper.querySelector(".radio_title");
      if (radioTitleElement) {
        const titleElement = radioTitleElement.querySelector("span");
        if (titleElement) titleElement.classList.toggle("input-required", !val);
      }
    } else {
      const labelElement = input.closest("label");
      const titleElement = labelElement.querySelector("span");
      labelElement.classList.toggle("input-required-label", !val);
      if (titleElement) titleElement.classList.toggle("input-required", !val);
    }
  });
  buildList();
}

function remove_loader() {
  const loader = document.querySelector(".js-page-loader");
  loader.classList.remove("loader--active");
  loader.parentElement.remove("js-load-fullpage");
}

function isMobileDevice() {
  return window.innerWidth < 767;
}

function accordions() {
  const isMobileView = isMobileDevice();
  window.hdnz = typeof window.hdnz !== "undefined" ? window.hdnz : {};
  if (isMobileView) {
    if (hdnz.mAccordian === undefined) {
      hdnz.mAccordian = {
        init: () => {
          let accordions = document.getElementsByClassName("js-mobile-accordion-title");
          for (let i = 0; i < accordions.length; i++) {
            accordions[i].addEventListener("click", function () {
              this.classList.toggle("mobile-accordion__item--open");
              let wrapper = this.closest(".js-mobile-accordion-group-item");
              let bodyCopy = wrapper.querySelector(".js-mobile-accordion-content");
              if (bodyCopy.style.maxHeight) {
                bodyCopy.style.maxHeight = null;
              } else {
                bodyCopy.style.maxHeight = `${bodyCopy.scrollHeight}px`;
              }
            });
          }
        },
      };
      DomReady(() => { hdnz.mAccordian.init(); });
    }
    var nextButtons = document.querySelectorAll(".btn-navigate-form-step");
    nextButtons.forEach(function (button, index) {
      button.addEventListener("click", function () {
        var currentSection = document.getElementById("step-" + index);
        var nextSection = document.getElementById("step-" + (index + 1));
        const currentBody = currentSection.querySelector(".js-mobile-accordion-title");
        currentBody.classList.remove("mobile-accordion__item--open");
        currentBody.nextElementSibling.style.maxHeight = null;
        const nextBody = nextSection.querySelector(".js-mobile-accordion-title");
        nextBody.classList.add("mobile-accordion__item--open");
        nextBody.nextElementSibling.style.maxHeight = nextBody.nextElementSibling.scrollHeight + "px";
      });
    });
  }
}

window.hdnz = typeof window.hdnz !== "undefined" ? window.hdnz : {};
if (hdnz.Accordian === undefined) {
  hdnz.Accordian = {
    init: () => {
      let accordions = document.getElementsByClassName("js-accordion-title");
      for (let i = 0; i < accordions.length; i++) {
        accordions[i].addEventListener("click", function () {
          this.classList.toggle("accordion__item--open");
          let wrapper = this.closest(".js-accordion-group-item");
          let bodyCopy = wrapper.querySelector(".js-accordion-content");
          if (bodyCopy.style.maxHeight) {
            bodyCopy.style.maxHeight = null;
          } else {
            bodyCopy.style.maxHeight = `${bodyCopy.scrollHeight}px`;
          }
        });
      }
    },
  };
  DomReady(() => { hdnz.Accordian.init(); });
}

function buildList() {
  const totalPoint = calculatePoints();
  const checkDocs = totalPoint >= 100
    ? document.querySelectorAll(".js-check-value[required]")
    : document.querySelectorAll(".js-check-value");
  const docsGroup = {};
  checkDocs.forEach((doc) => {
    const docdataValue = doc.dataset.value;
    const docName = doc.getAttribute("for");
    const docStepSection = doc.closest(".form-step");
    if (doc.classList.contains("student-app-field")) {
      if (!docdataValue) {
        if (!docsGroup[docName]) docsGroup[docName] = [1];
        else docsGroup[docName].push(1);
      }
    } else {
      if (docStepSection) {
        const docStep = docStepSection.getAttribute("step_number");
        if (!docdataValue) {
          if (!docsGroup[docName]) docsGroup[docName] = [docStep];
          else docsGroup[docName].push(docStep);
        }
      }
    }
  });
  const missingDocsWrapper = document.querySelector(".js-missing-docs");
  const missingDocsTitle = document.querySelector(".residence-missing-doc .accordion__item__title-inner");
  missingDocsWrapper.innerHTML = "";
  const ul = document.createElement("ul");
  ul.classList.add("summary-ul");
  let listCount = 0;
  for (const key in docsGroup) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="steplist">Step ${docsGroup[key][0]}</span> - <a class="js-backtoedit underlineLink" step_number="${docsGroup[key][0]}">${key}</a>`;
    ul.appendChild(li);
    listCount++;
  }
  missingDocsTitle.innerHTML = `<span class='list-count'>${listCount}</span> Missing Documents`;
  missingDocsWrapper.appendChild(ul);
  if (listCount === 0) {
    missingDocsTitle.closest(".residence-missing-doc").classList.add("display--none");
  } else {
    missingDocsTitle.closest(".residence-missing-doc").classList.remove("display--none");
  }
  backtoEdit();
}

function calculatePoints() {
  const fileInputs = document.querySelectorAll(".js-file-points");
  let totalPoint = 0;
  fileInputs.forEach((input) => {
    const point = input.dataset.hasOwnProperty("points") ? parseInt(input.dataset.points) : 0;
    totalPoint += point;
  });
  const pointHTML = `<p class="mt-15">You have <span class="js-checking-value" data-value="${totalPoint}">${totalPoint}</span> of <span class="">100</span> points required for identification.</p>`;
  const pointWrapper = document.querySelector(".js-calculate");
  if (pointWrapper) pointWrapper.innerHTML = pointHTML;
  return totalPoint;
}

function createApplicaitonPresetVal() {
  const internalRadioNames = document.querySelectorAll(".js-radio-field");
  return sortRadioValueIntoObject(internalRadioNames);
}

function areAllInputsFilled(contentId) {
  const contentSection = document.getElementById(contentId);
  const inputElements = contentSection.querySelectorAll("input.js-skyflow-field");
  for (const inputElement of inputElements) {
    if (inputElement.value.trim() === "") return false;
  }
  return true;
}

function handleCardTypeChange() {
  const selectedValue = document.querySelector('input[name="identity_type"]:checked').dataset.value;
  const identitySection = document.querySelectorAll(".js-identity-section");
  identitySection.forEach((htmlSection) => {
    const inputs = htmlSection.querySelectorAll(".js-skyflow-field");
    const isSelectedPassport = htmlSection.classList.contains("js-selected-passportcontent");
    const isSelectedLicense = htmlSection.classList.contains("js-selected-licensecontent");
    const isSelectedMedicare = htmlSection.classList.contains("js-selected-medicarecontent");
    if (
      (isSelectedPassport && selectedValue === "Passport") ||
      (isSelectedLicense && selectedValue === "Driving License") ||
      (isSelectedMedicare && selectedValue === "Medicare")
    ) {
      htmlSection.classList.remove("display--none");
      inputs.forEach((input) => input.setAttribute("required", ""));
    } else {
      htmlSection.classList.add("display--none");
      inputs.forEach((input) => input.removeAttribute("required", ''));
    }
  });
}

function conditionalDisplayField() {
  const applicationMode = document.querySelector(".js-section-wrapper").dataset.mode;

  const pets = document.querySelectorAll(".js-pets");
  const petSection = document.querySelector(".js-condition-meet-pet-true");
  const addPetbtn = document.querySelector(".js-add-pet");
  handleConditionRequireFieldOnRadio(pets, addPetbtn, "selectedvalue", applicationMode, "false");
  handleConditionRequireFieldOnRadio(pets, petSection, "selectedvalue", applicationMode, "false");

  const employmentType1 = document.querySelector(".js-employment_1_type");
  const employmentType2 = document.querySelector(".js-employment_2_type");
  const employed1Section = document.querySelectorAll(".js-condition-meet--employment_1_type-employed");
  const selfemployed1Section = document.querySelectorAll(".js-condition-meet--employment_1_type-self_employed");
  const referenceSection = document.querySelectorAll(".js-condition-meet--employment_1_type-employed-only");
  const retiredSection = document.querySelectorAll(".js-condition-meet--employment_1_type-employed-retired");
  const studentSection = document.querySelectorAll(".js-condition-meet--employment_1_type-student");
  const unemployedSection = document.querySelectorAll(".js-condition-meet--employment_1_type-employed-unemployed");
  const additionSelfEmployed = document.querySelectorAll(".js-condition-meet-employment_2_type-self_employed");
  const additionEmployed = document.querySelectorAll(".js-condition-meet-employment_2_type-employed");
  const additionSection = document.querySelectorAll(".js-condition-meet--employment_1_type-self_employed-employed");

  handleConditionRequireFieldOnDropdown(employmentType1, employed1Section, ["self_employed", "Retired", "Unemployed", "Student"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(employmentType1, studentSection, ["self_employed", "Retired", "Unemployed", "Employed"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(employmentType1, selfemployed1Section, ["Employed", "Retired", "Unemployed", "Student"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(employmentType1, referenceSection, ["self_employed", "Retired", "Unemployed", "Student"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(employmentType1, retiredSection, ["self_employed", "Employed", "Unemployed", "Student"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(employmentType1, unemployedSection, ["self_employed", "Employed", "Retired", "Student"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(employmentType1, additionSection, ["Retired", "Unemployed"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(employmentType2, additionSelfEmployed, ["Employed"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(employmentType2, additionEmployed, ["self_employed"], applicationMode, true);

  const radio_other_occupants = document.querySelectorAll(".js-other_occupants");
  const dependent_section = document.querySelector(".js-condtion-meet-other_occupants-true");
  handleConditionRequireFieldOnRadio(radio_other_occupants, dependent_section, "selectedvalue", applicationMode, "false");

  const employed_1_stillworking = document.querySelectorAll(".js-employment_1_still_working_there");
  const employed_1_enddate = document.querySelector(".js-employment_1_end_date_input");
  handleConditionRequireFieldOnRadio(employed_1_stillworking, employed_1_enddate, "value", applicationMode, "true");

  const employed_2_stillworking = document.querySelectorAll(".js-employment_2_still_working_there");
  const employed_2_enddate = document.querySelector(".js-employment_2_end_date_input");
  handleConditionRequireFieldOnRadio(employed_2_stillworking, employed_2_enddate, "value", applicationMode, "true");

  const primaryAddressOwnRent = document.querySelector(".js-primary_address_own_or_rent");
  const rentSection = document.querySelector(".js-condition-meet-rent");
  const ownHomeSection = document.querySelector(".js-condition-meet-own-home");
  const previousAddressOwnRent = document.querySelector(".js-secondary_address_own_or_rent");
  const previourentSection = document.querySelector(".js-condition-meet-previous-rent");
  const previouownHomeSection = document.querySelector(".js-condition-meet-previous-own-home");

  handleConditionRequireFieldOnDropdown(primaryAddressOwnRent, [rentSection], ["Own", "Lived with Family"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(primaryAddressOwnRent, [ownHomeSection], ["Rent", "Lived with Family"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(previousAddressOwnRent, [previourentSection], ["Own", "Lived with Family"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(previousAddressOwnRent, [previouownHomeSection], ["Rent", "Lived with Family"], applicationMode, true);

  const incomeType = document.querySelector(".js-income_1_type");
  const income2Type = document.querySelector(".js-income_2_type");
  const income3Type = document.querySelector(".js-income_3_type");
  const salaryComparisonValues = ["Self Employed", "Rental Income", "Family / Student Allowance", "Government Support", "Pension", "Other"];
  const otherComparisonVal = ["Salary"];

  handleConditionRequireFieldOnDropdown(incomeType, [document.querySelector(".js-condition-meet-salary")], salaryComparisonValues, applicationMode, true);
  handleConditionRequireFieldOnDropdown(incomeType, [document.querySelector(".js-condition-meet-income-other")], otherComparisonVal, applicationMode, true);
  handleConditionRequireFieldOnDropdown(incomeType, [document.querySelector(".js-condition-meet-income-self_employed")], ["Salary","Rental Income","Family / Student Allowance","Government Support","Pension","Other"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(incomeType, [document.querySelector(".js-condition-meet-income-rental")], ["Salary","Self Employed","Family / Student Allowance","Government Support","Pension","Other"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(incomeType, [document.querySelector(".js-condition-meet-income-family")], ["Salary","Self Employed","Rental Income","Government Support","Pension","Other"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(incomeType, [document.querySelector(".js-condition-meet-income-government")], ["Salary","Self Employed","Rental Income","Family / Student Allowance","Pension","Other"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(incomeType, [document.querySelector(".js-condition-meet-income-pension")], ["Salary","Self Employed","Rental Income","Family / Student Allowance","Government Support","Other"], applicationMode, true);
  handleConditionRequireFieldOnDropdown(incomeType, [document.querySelector(".js-condition-meet-income-select-other")], ["Salary","Self Employed","Rental Income","Family / Student Allowance","Government Support","Pension"], applicationMode, true);

  [income2Type, income3Type].forEach((type, i) => {
    const n = i + 2;
    handleConditionRequireFieldOnDropdown(type, [document.querySelector(`.js-condition-meet-income-${n}-salary`)], salaryComparisonValues, applicationMode, true);
    handleConditionRequireFieldOnDropdown(type, [document.querySelector(`.js-condition-meet-income-${n}-other`)], otherComparisonVal, applicationMode, true);
    handleConditionRequireFieldOnDropdown(type, [document.querySelector(`.js-condition-meet-income-${n}-self_employed`)], ["Salary","Rental Income","Family / Student Allowance","Government Support","Pension","Other"], applicationMode, true);
    handleConditionRequireFieldOnDropdown(type, [document.querySelector(`.js-condition-meet-income-${n}-rental`)], ["Salary","Self Employed","Family / Student Allowance","Government Support","Pension","Other"], applicationMode, true);
    handleConditionRequireFieldOnDropdown(type, [document.querySelector(`.js-condition-meet-income-${n}-family`)], ["Salary","Self Employed","Rental Income","Government Support","Pension","Other"], applicationMode, true);
    handleConditionRequireFieldOnDropdown(type, [document.querySelector(`.js-condition-meet-income-${n}-government`)], ["Salary","Self Employed","Rental Income","Family / Student Allowance","Pension","Other"], applicationMode, true);
    handleConditionRequireFieldOnDropdown(type, [document.querySelector(`.js-condition-meet-income-${n}-pension`)], ["Salary","Self Employed","Rental Income","Family / Student Allowance","Government Support","Other"], applicationMode, true);
    handleConditionRequireFieldOnDropdown(type, [document.querySelector(`.js-condition-meet-income-${n}-select-other`)], ["Salary","Self Employed","Rental Income","Family / Student Allowance","Government Support","Pension"], applicationMode, true);
  });

  const ntd_medicare_card_colour = document.querySelector(".js-ntd_medicare_card_colour");
  const medicareDay = document.querySelector(".js-condition-meet-color-green");
  const medicareEditDay = document.querySelector(".js-condition-meet-color-uploaded-green");

  if (ntd_medicare_card_colour) {
    ntd_medicare_card_colour.addEventListener("change", () => {
      const selectedValue = ntd_medicare_card_colour.value;
      if (selectedValue == "G") {
        if (medicareDay && !medicareDay.classList.contains('display--none')) {
          medicareDay.classList.add('display--none');
          medicareDay.querySelector('.js-ntd_medicare_expriy_day').removeAttribute("required");
        }
        if (medicareEditDay && !medicareEditDay.classList.contains('display--none')) {
          medicareEditDay.classList.add('display--none');
          medicareEditDay.querySelector('.js-ntd_medicare_expriy_day').removeAttribute("required");
        }
      } else {
        if (medicareDay && medicareDay.classList.contains('display--none')) {
          medicareDay.classList.remove('display--none');
          medicareDay.querySelector('.js-ntd_medicare_expriy_day').setAttribute("required", "");
        }
        if (medicareEditDay && medicareEditDay.classList.contains('display--none')) {
          medicareEditDay.classList.remove('display--none');
          medicareEditDay.querySelector('.js-ntd_medicare_expriy_day').setAttribute("required", "");
        }
      }
    });
  }
}

function handleConditionRequireFieldOnDropdown(dropdownElement, sections, comparisonValues, mode, check) {
  function applyRequired(selectedValue) {
    const selected = check ? comparisonValues.includes(selectedValue) : !comparisonValues.includes(selectedValue);
    sections.forEach((section) => {
      if (section) conditionShowRequiredContent(selected, section);
    });
  }
  if (dropdownElement) {
    if (mode == "edit") {
      const selectedValue = dropdownElement.dataset.selectedvalue;
      if (selectedValue) applyRequired(selectedValue);
    }
    dropdownElement.addEventListener("change", () => {
      const selectedValue = dropdownElement.value;
      if (selectedValue) applyRequired(selectedValue);
    });
  }
}

function handleConditionRequireFieldOnRadio(radioElements, section, datasetKey, mode, comparisonValues) {
  function applyRequired(selectedValue) {
    const selected = comparisonValues.includes(selectedValue);
    conditionDisplayContent(selected, section);
  }
  radioElements.forEach((radio) => {
    if (mode == "edit") {
      const selectedVal = radio.dataset.selectedvalue;
      if (selectedVal) applyRequired(selectedVal);
    }
    radio.addEventListener("change", () => {
      applyRequired(radio.dataset.value);
    });
  });
}

function conditionShowRequiredContent(val, content) {
  const inputs = content.querySelectorAll(".js-condition-required");
  if (val) {
    content.classList.add("display--none");
  } else {
    content.classList.remove("display--none");
  }
  inputs.forEach((input) => {
    if (val) {
      input.removeAttribute("required");
    } else {
      input.setAttribute("required", "");
    }
    if (input.classList.contains("js-file-field")) {
      input.classList.toggle("js-check-value", !val);
      const fileElement = input.closest(".js-file-upload");
      const labelElement = fileElement.querySelector(".file-title");
      if (labelElement) labelElement.classList.toggle("input-required", !val);
    } else {
      const labelElement = input.closest("label");
      const titleElement = labelElement.querySelector("span");
      labelElement.classList.toggle("input-required-label", !val);
      if (titleElement) titleElement.classList.toggle("input-required", !val);
    }
  });
  buildList();
}

function AddFileUploadFeedback(fieldlabel, field) {
  let wrapper = document.getElementById("FileUploadModal");
  if (!wrapper) {
    const wrapperHTML = StringToHTML(HTMLTemplates.fileUploadWrapper);
    document.body.appendChild(wrapperHTML);
    wrapper = document.getElementById("FileUploadModal");
  } else {
    Array.from(wrapper.querySelectorAll(".fileUploadModal__item"))
      .filter((i) => i.dataset.field == field)
      .forEach((el) => el.remove());
  }
  let item = HTMLTemplates.fileUploadItem
    .replace(/\[\[FIELDLABEL\]\]/g, fieldlabel)
    .replace(/\[\[FIELD\]\]/g, field);
  wrapper.appendChild(StringToHTML(item));
}

function FileUploadComplete(field, status, labelWrapper, additionalMesssage = "") {
  labelWrapper.classList.remove("js-uploading");
  const wrapperSelector = `.fileUploadModal__item[data-field='${field}']`;
  const wrapper = document.querySelector(wrapperSelector);
  const body = wrapper.querySelector(".fileUploadModal__item__body");
  const { fieldlabel } = wrapper.dataset;
  wrapper.classList.add("fileUploadModal__item--complete");
  if (status) {
    wrapper.classList.add("fileUploadModal__item--success");
    let successHTML = `<strong>SUCCESS!</strong> "${fieldlabel}" upload was successful.`;
    if (additionalMesssage != "") successHTML += ` ${additionalMesssage}`;
    body.innerHTML = successHTML;
    setTimeout(function () {
      const item = document.querySelector(wrapperSelector);
      if (item) RemoveFileUploadFeedback(item);
    }, 1000 * 10);
  } else {
    wrapper.classList.add("fileUploadModal__item--error");
    let errorHTML = `<strong>FAILED!</strong> "${fieldlabel}" upload failed.`;
    errorHTML += additionalMesssage != "" ? ` ${additionalMesssage}` : " Please try again.";
    body.innerHTML = errorHTML;
  }
}

function RemoveFileUploadFeedback(el) {
  const wrapper = document.getElementById("FileUploadModal");
  const items = Array.from(wrapper.querySelectorAll(".fileUploadModal__item"));
  if (items.length <= 1) {
    wrapper.remove();
  } else {
    el.closest(".fileUploadModal__item").remove();
  }
}

function StringToHTML(str) {
  let t = document.createElement("template");
  t.innerHTML = str;
  return t.content;
}

function AddClass(list, className) {
  list.forEach(listItem => listItem.classList.add(className));
}

function RemoveClass(list, className) {
  list.forEach(listItem => listItem.classList.remove(className));
}

const HTMLTemplates = {
  fileUploadWrapper: `<div id="FileUploadModal" class="fileUploadModal"></div>`,
  fileUploadItem: `<div class="fileUploadModal__item" data-field="[[FIELD]]" data-fieldlabel="[[FIELDLABEL]]">
    <span class="spinner"></span>
    <div class="fileUploadModal__item__body">Uploading [[FIELDLABEL]]...</div>
    <div class="close-btn" onclick="RemoveFileUploadFeedback(this)"></div>
  </div>`,
};

function alertStepCircleColorToStep(isStepValid) {
  const classToRemove = 'form-stepper-alert highlight-unfilled';
  const formStepCircle = document.querySelector('li[step="5"]');
  if (isStepValid) {
    formStepCircle.classList.remove(...classToRemove.split(' '));
  } else {
    formStepCircle.classList.add(...classToRemove.split(' '));
  }
}

function showHideConditionalFields() {
  const addbtns = document.querySelectorAll(".js--add-button");
  addbtns.forEach((addbtn) => {
    const addType = addbtn.dataset.addtype;
    const findContainer = document.querySelector(".js-" + addType + "-container");
    const addTypeHiddenSections = findContainer.querySelectorAll(".js-" + addType + ".display--none");

    addTypeHiddenSections.forEach((eachHidden) => {
      const inputsInHiddenSection = eachHidden.querySelectorAll(".js-crm-field");
      let hasValue = false;
      inputsInHiddenSection.forEach((input) => {
        if (input.nodeName === "INPUT") {
          if (["text", "email", "number"].includes(input.type) && input.value.trim() !== "") hasValue = true;
          else if (input.type === "radio" && input.dataset.selectedvalue.trim() !== "") hasValue = true;
        } else if (input.nodeName === "SELECT" && input.dataset.selectedvalue.trim() !== "") {
          hasValue = true;
        }
      });
      if (hasValue) eachHidden.classList.remove("display--none");
      if (!findContainer.querySelector(".js-" + addType + ".display--none")) addbtn.style.display = "none";
    });

    addbtn.addEventListener("click", (this_btn) => {
      const thisaddType = this_btn.target.dataset.addtype;
      const findThisContainer = document.querySelector(".js-" + thisaddType + "-container");
      const hiddenSection = findThisContainer.querySelector(".js-" + thisaddType + ".display--none");
      if (hiddenSection) {
        hiddenSection.classList.remove("display--none");
        if (hiddenSection.classList.contains('js-condition-meet_document_upload_false')) {
          hiddenSection.querySelectorAll('.js-condition-required').forEach(input => input.setAttribute("required", ""));
        }
        RemoveClass(CollectFormFields(hiddenSection), "js-resetvalue");
      }
      if (!findThisContainer.querySelector(".js-" + addType + ".display--none")) addbtn.style.display = "none";
    });
  });

  const removeButtons = document.querySelectorAll(".js--remove-btn");
  removeButtons.forEach((removebtn) => {
    removebtn.addEventListener("click", function () {
      const removeType = this.dataset.addtype;
      const findContainer = document.querySelector(".js-" + removeType + "-container");
      const addBtn = findContainer.querySelector('.js--add-button[data-addtype="' + removeType + '"]');
      const showSection = this.closest(".js-" + removeType);
      showSection.classList.add("display--none");
      if (showSection.classList.contains('js-condition-meet_document_upload_false')) {
        showSection.querySelectorAll('.js-condition-required').forEach(input => input.removeAttribute("required", ""));
        showSection.querySelectorAll(".js-skyflow-field").forEach(input => input.removeAttribute("required", ""));
      }
      const clear_fields = CollectFormFields(showSection);
      ClearFields(clear_fields);
      AddClass(clear_fields, "js-resetvalue");
      if ((addBtn.style.display = "none")) addBtn.style.display = "block";
    });
  });
}
