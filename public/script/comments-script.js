const submitBtn = document.querySelector('button#submit');
const pathArr = window.location.pathname.split('/');
const currentCard = pathArr[pathArr.length - 1];

//create a new div with comment's content, published date and author
function createNewCommentDisplay(c) {
    //create a new div
    const newCommentDiv = document.createElement('div');

    //create a new span for username
    const usernameSpan = document.createElement('span');
    usernameSpan.innerHTML = c.username;
    usernameSpan.classList.add('bold-font');
    const usernamePara = document.createElement('p');
    usernamePara.innerHTML = ' says: ';
    usernamePara.prepend(usernameSpan);

    //create a new p for content
    const contentPara = document.createElement('p');
    contentPara.innerHTML = c.content;

    //create a new p for date
    const datePara = document.createElement('p');
    const date = new Date(c.date);

    let hr = date.getHours();
    let min = date.getMinutes();
    if (hr < 10) {
        hr = '0' + hr;
    }
    if (min < 10) {
        min = '0' + min;
    }

    datePara.innerHTML = 'Published on: ' + date.toDateString() + ' '+ hr + ':' + min;
    datePara.classList.add('italics-font');

    //combine everything
    newCommentDiv.appendChild(usernamePara);
    newCommentDiv.appendChild(contentPara);
    newCommentDiv.appendChild(datePara);
    newCommentDiv.appendChild(document.createElement('hr'));

    return newCommentDiv;
}

//display an alert
function displayAlert(success, msg) {
    //if saving comment is not successful, display a "failure" alert
    if (!success) {
        const alertDiv = document.querySelector('#saveCommentFailure');
        alertDiv.classList.remove('hidden');

        const alertDivMsg = document.querySelector('#failure-msg');
        alertDivMsg.textContent = msg; //add optional message

        //make the alert automatically disappear after 5 seconds
        setTimeout(function() {
            alertDiv.classList.add('hidden');
        }, 5000);
    }
    //if saving comment is successful, display a "success" alert
    else {
        const alertDiv = document.querySelector('#saveCommentSuccess');
        alertDiv.classList.remove('hidden');

        setTimeout(function() {
            alertDiv.classList.add('hidden');
        }, 5000);
    }
}

//render an additional comment on the page
function showAdditionalComments(c) {
    const commentsDiv = document.body.querySelector('.comments-display');
    commentsDiv.appendChild(createNewCommentDisplay(c));
}

//get all comments for the current card in database
function getComments() {

    //old code using xmlhttprequest
    /*
    const req = new XMLHttpRequest();
    const url = '/api/comments?card=' + currentCard;
    const commentsDiv = document.body.querySelector('.comments-display');

    //use api to query the database
    req.open('GET', url);
    req.addEventListener('load', function(evt) {
        if(req.status >= 200 && req.status < 300) {

            //if query is successful, display all available comments
            const comments = JSON.parse(req.responseText); 
            for (const c of comments) {
                commentsDiv.appendChild(createNewCommentDisplay(c));
            }
        }
    });

    req.send();
    */

    //new code using fetch & await/async
    const url = '/api/comments?card=' + currentCard;
    const commentsDiv = document.body.querySelector('.comments-display');

    const request = async () => {
        const response = await fetch(url);
        const comments = await response.json();

        for (const c of comments) {
            commentsDiv.appendChild(createNewCommentDisplay(c));
        }
    };

    request();
}

//save a newly submitted comment into databse
function handleSubmit(evt) {
    //setting up
    const comment = document.querySelector('textarea').value;
    const username = document.querySelector('span#username').innerHTML;

    //do not submit the comment if the content is empty
    if (comment.length === 0 || comment.replace(/^\s+|\s+$/g, '') === '') {
        displayAlert(false, 'because it seems that you have not entered anything');
    }
    else {
        //old code using xmlhttprequest
        /*
        const req = new XMLHttpRequest();

        //use api to save comment into database
        req.open('POST', '/api/comments');
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        req.addEventListener('load', function(evt) {
            
            //if saving failed, display an alert
            if (req.status === 500) {
                displayAlert(false);
            }
            //if successful, display an alert and the new comment
            else {
                displayAlert(true);
                document.querySelector('textarea').value = '';
                const newCommentObj = {username: username, content: comment, date: new Date()};
                showAdditionalComments(newCommentObj);
            }
        });

        req.send('username=' + username + '&cardSlug=' + currentCard + '&comment=' + comment);
        */

        //new code using fetch & await/async
        const url = '/api/comments';
        const commentObj = {username: username, comment: comment, cardSlug: currentCard};

        const request = async () => {
            try {
                //try posting the comment
                const response = await fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(commentObj),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const json = await response.json();

                //if we got back something, display a success alert and show the new comment
                if (json) {
                    displayAlert(true);
                    document.querySelector('textarea').value = '';
                    const newCommentObj = {username: username, content: comment, date: new Date()};
                    showAdditionalComments(newCommentObj);
                }
            }
            catch(e) {
                //if we got an error, display an error alert
                displayAlert(false, e + '');
            }
        };

        request();
    }
}

//only attach submit button events when it is displayed on the page
//(i.e. when user is signed in)
if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmit);
}

document.addEventListener("DOMContentLoaded", getComments);
