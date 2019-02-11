const usernameInput = document.querySelector('input[name="username"]');
const passwordInput = document.querySelector('input[name="password"]');
const emailInput = document.querySelector('input[name="email"]');

//regex for testing email
const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

//remove the red warning border on inputs
function removeBorder() {
    if (this.classList.contains('red-border')) {
        this.classList.remove('red-border');
    }
}

//remove the alert display
function removeAlert() {
    document.querySelector('#registration-alert').classList.add('hidden');
}

//function for validating the form
function validateForm() {
    let usernameErr = false;
    let passwordErr = false;
    let emailErr = false;
    let returnValue = true;

    if (usernameInput.value.length <= 3) {
        usernameInput.value = '';
        usernameInput.placeholder = "Must be 4 or more digits";
        usernameInput.classList.add('red-border');
        usernameErr = true;
    }

    if (passwordInput.value.length <= 5) {
        passwordInput.value = '';
        passwordInput.placeholder = "Must be 6 or more digits";
        passwordInput.classList.add('red-border');
        passwordErr = true;
    }

    if (!regex.test(emailInput.value)) {
        emailInput.value = '';
        emailInput.placeholder = "Enter a valid email address";
        emailInput.classList.add('red-border');
        emailErr = true;
    }

    if (emailErr || passwordErr || usernameErr) {
        const alertPanel = document.querySelector('#registration-alert');
        alertPanel.classList.remove('hidden');
        returnValue = false;
    }

    return returnValue;
}

//add event listener to all the input on keyup 
//so that the red border and alert div will be removed when user is typing
usernameInput.addEventListener('keyup', removeAlert);
usernameInput.addEventListener('keyup', removeBorder);
passwordInput.addEventListener('keyup', removeAlert);
passwordInput.addEventListener('keyup', removeBorder);
emailInput.addEventListener('keyup', removeAlert);
emailInput.addEventListener('keyup', removeBorder);
