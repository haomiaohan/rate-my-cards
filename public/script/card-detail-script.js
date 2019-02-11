//getting all the navigation tabs in the detail view 
const highlights = document.querySelector('#highlights');
const earn = document.querySelector('#earn');
const redeem = document.querySelector('#redeem');
const other = document.querySelector('#other');
const comments = document.querySelector('#comments');

//display content under one bar
function hideOthers(current) {
    const allDivs = document.querySelectorAll('.card-body');
    for (let i = 0; i < allDivs.length; i++) {
        if (allDivs[i].id.indexOf(current) === -1 && !allDivs[i].classList.contains('hidden')) {
            allDivs[i].classList.add('hidden');
        }
        else if (allDivs[i].id.indexOf(current) !== -1 && allDivs[i].classList.contains('hidden')) {
            allDivs[i].classList.remove('hidden');
        }
    }
}

//make the current tab "active" (changing css)
function changeActive(current) {
    const allLinks = document.querySelectorAll('.detail-view .nav-link');
    for (let i = 0; i < allLinks.length; i++) {
        if (allLinks[i].id.indexOf(current) === -1 && allLinks[i].classList.contains('active')) {
            allLinks[i].classList.remove('active');
        }
        else if (allLinks[i].id.indexOf(current) !== -1 && !allLinks[i].classList.contains('active')) {
            allLinks[i].classList.add('active');
        }
    }
}

//attach event listener to all labels
highlights.addEventListener('click', function() {
    hideOthers('highlights');
    changeActive('highlights');
});

earn.addEventListener('click', function() {
    hideOthers('earn');
    changeActive('earn');
});

redeem.addEventListener('click', function() {
    hideOthers('redeem');
    changeActive('redeem');
});

other.addEventListener('click', function() {
    hideOthers('other');
    changeActive('other');
});

comments.addEventListener('click', function() {
    hideOthers('comments');
    changeActive('comments');
});