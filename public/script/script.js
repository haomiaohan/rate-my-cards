const rewardButtons = document.querySelector('#reward-selection-buttons');
const creditButtons = document.querySelector('#credit-selection-buttons');
const textInput = document.querySelectorAll('input[type=text]');

//regex for testing if the input is a valid number
const regex = /^-?\d*\.?\d*$/;

//remove the red warning border on inputs
function removeBorder() {
    if (this.classList.contains('red-border')) {
        this.classList.remove('red-border');
    }
    else if (this.classList.contains('bold-red-border')) {
        this.classList.remove('bold-red-border');
    }
}

//remove the alert display
function removeBottomAlert() {
    document.querySelector('#bottom-alert').classList.add('hidden');
}

function removeCreditAlert() {
    document.querySelector('#credit-alert').classList.add('hidden');
}

function removeRewardAlert() {
    document.querySelector('#reward-alert').classList.add('hidden');
}

//function for validating the form
function validateForm() {
    let creditSelected = false;
    let rewardSelected = false;
    let returnValue = true;

    //user must select a button on "credit score" or "reward type"
    for (let i = 0; i < creditButtons.childNodes.length; i++) {
        if (creditButtons.childNodes[i].classList !== undefined && creditButtons.childNodes[i].classList.contains('active')) {
            creditSelected = true;
            removeBorder.call(creditButtons);
            removeCreditAlert();
        }
    }

    for (let i = 0; i < rewardButtons.childNodes.length; i++) {
        if (rewardButtons.childNodes[i].classList !== undefined && rewardButtons.childNodes[i].classList.contains('active')) {
            rewardSelected = true;
            removeBorder.call(rewardButtons);
            removeRewardAlert();
        }
    }

    if (!creditSelected) {
        const creditAlert = document.querySelector('#credit-alert');
        creditAlert.classList.remove('hidden');
        creditButtons.classList.add('bold-red-border');
        returnValue = false;
    }

    if (!rewardSelected) {
        const rewardAlert = document.querySelector('#reward-alert');
        rewardAlert.classList.remove('hidden');
        rewardButtons.classList.add('bold-red-border');
        returnValue = false;
    }

    for (let i = 0; i < textInput.length; i++) {
        if (textInput[i].value.replace(/^\s+|\s+$/g, '') === '') {
            textInput[i].value = '';
            textInput[i].placeholder = "This field can't be empty";
            textInput[i].classList.add('red-border');
            returnValue = false;
        }
        else if (parseFloat(textInput[i].value) < 0 || !regex.test(textInput[i].value)) {
            textInput[i].value = '';
            textInput[i].placeholder = "Enter a non-negative number";
            textInput[i].classList.add('red-border');
            returnValue = false;
        }
    }
    
    if (!returnValue) {
        const alertPanel = document.querySelector('#bottom-alert');
        alertPanel.classList.remove('hidden');
    }
    return returnValue;
}

//add event listener to all the input on keyup 
//so that the red border and alert div will be removed when user is typing
for (let i = 0; i < textInput.length; i++) {
    textInput[i].addEventListener('keyup', removeBorder);
    textInput[i].addEventListener('keyup', removeBottomAlert);
}

//make the alerts disappear after 10 seconds
setTimeout(function() {
    document.querySelector('#bottom-alert').classList.add('hidden');
}, 10000);

setTimeout(function() {
    document.querySelector('#credit-alert').classList.add('hidden');
}, 10000);

setTimeout(function() {
    document.querySelector('#reward-alert').classList.add('hidden');
}, 10000);