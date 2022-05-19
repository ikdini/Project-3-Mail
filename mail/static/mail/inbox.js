document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => loadMailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => loadMailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => loadMailbox("archive"));
  document
    .querySelector("#compose")
    .addEventListener("click", () => composeEmail(""));

  // By default, load the inbox
  loadMailbox("inbox");
});

function composeEmail(email) {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-entry-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = email
    ? email.sender
    : "";
  document.querySelector("#compose-subject").value = email
    ? prefillSubject(email.subject)
    : "";
  document.querySelector("#compose-body").value = email
    ? prefillBody(email)
    : "";

  document.querySelector("#compose-form").onsubmit = submitMail;
}

function prefillSubject(subject) {
  /* Checking if the subject line of the email being replied to has the prefix "Re: " and if it does
 not, it adds it. */
  const prefix = "Re: ";
  if (subject.slice(0, 4) === prefix) {
    return subject;
  } else {
    return prefix + subject;
  }
}

function prefillBody(email) {
  /* This is a template literal that is used to prefill the body of the email with the timestamp,
  sender, and body of the email being replied to. */
  return `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
}

function submitMail() {
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value,
    }),
  });

  loadMailbox("sent");

  return false;
}

function loadMailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#email-entry-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach(addMail, mailbox);
    });
}

function addMail(email) {
  mailbox = this.valueOf();

  /* This is creating a new div element and appending it to the emails-view div. */
  const inner = `<div class="row mb-0"><div class="col-md-8"><em>${
    email.sender
  }</em></div><div class="col-md-4 email-timestamp"><span>${
    email.timestamp
  }</span></div></div><span class="h5">${
    email.subject.charAt(0).toUpperCase() + email.subject.slice(1)
  }</span>`;
  const mail_entry = document.createElement("div");
  mail_entry.className = "email-entry";
  mail_entry.innerHTML = inner;
  document.querySelector("#emails-view").append(mail_entry);

  /* This is a ternary operator that is setting the background color of the email entry to grey if the
  email has been read and white if it has not been read. */
  mail_entry.style.background = email.read ? "grey" : "white";

  /* This is an event listener that is listening for a click on the email entry. When the email entry is
clicked, it is making a PUT request to the server to update the read status of the email to true. It
is then making a GET request to the server to get the email and then calling the viewMail function
to display the email. */
  mail_entry.onclick = function () {
    fetch(`/emails/${email.id}`, {
      method: "PUT",
      body: JSON.stringify({
        read: true,
      }),
    });

    fetch(`/emails/${email.id}`)
      .then((response) => response.json())
      .then((email) => {
        viewMail(email, mailbox);
      });
  };
}

function viewMail(email, mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-entry-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  const sender = `<p><b>From: </b>${email.sender}</p>`;
  const recipients = `<p><b>To: </b>${email.recipients}</p>`;
  const subject = `<p><b>Subject: </b>${
    email.subject.charAt(0).toUpperCase() + email.subject.slice(1)
  }</p>`;
  const timestamp = `<p><b>Timestamp: </b>${email.timestamp}</p>`;
  const body = `<hr><p>${email.body}</p>`;
  const reply =
    '<button class="btn btn-sm btn-outline-primary" id="rep">Reply</button>';

  /* This is setting the innerHTML of the email-entry-view div to the sender, recipients, subject,
  timestamp, and reply button. */
  document.querySelector("#email-entry-view").innerHTML =
    sender + recipients + subject + timestamp + reply;

  const arc_btn_txt = email.archived ? "Unarchive" : "Archive";

  if (mailbox != "sent") {
    document.querySelector(
      "#email-entry-view"
    ).innerHTML += `<button class="btn btn-sm btn-outline-primary" id="arc">${arc_btn_txt}</button>`;
  }

  document.querySelector("#email-entry-view").innerHTML += body;

  if (mailbox !== "sent") {
    document
      .querySelector("#arc")
      .addEventListener("click", () => toggleArchive(email));
  }

  document
    .querySelector("#rep")
    .addEventListener("click", () => composeEmail(email));
}

function toggleArchive(email) {
  /* This is making a PUT request to the server to update the archived status of the email to the
  opposite of what it currently is. It is then reloading the page. */
  fetch(`/emails/${email.id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !email.archived,
    }),
  }).then((location.href = ""));
}
