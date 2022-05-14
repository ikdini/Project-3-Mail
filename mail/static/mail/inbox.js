document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email(''));

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(email) {
  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-entry-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email ? email.sender : '';
  document.querySelector('#compose-subject').value = email ? prefill_subject(email.subject) : '';
  document.querySelector('#compose-body').value = email ? prefill_body(email) : '';
  
  document.querySelector('#compose-form').onsubmit = submit_mail;
}

function prefill_subject(subject) {
  const prefix = "Re: "
  if (subject.slice(0,4) === prefix) {
    return subject
  } else {
    return prefix + subject
  }
}

function prefill_body(email) {
  return `On ${email.timestamp} ${email.sender} wrote: ${email.body}\n`;
}

function submit_mail() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value,
    })
  });
  
  load_mailbox('sent');
  
  return false;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-entry-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(add_mail, mailbox);
  });
  
}

function add_mail(email) {

  mailbox = this.valueOf();

  const inner = `<div class="row mb-0"><div class="col-md-8"><em>${email.sender}</em></div><div class="col-md-4 email-timestamp"><span>${email.timestamp}</span></div></div><span class="h5">${email.subject.charAt(0).toUpperCase() + email.subject.slice(1)}</span>`;
  const mail_entry = document.createElement("div");
  mail_entry.className = "email-entry";
  mail_entry.innerHTML = inner;
  document.querySelector('#emails-view').append(mail_entry);
  
  mail_entry.style.background = email.read ? 'grey' : 'white';

  mail_entry.onclick = function () {
    
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    });
    
    fetch(`/emails/${email.id}`)
    .then(response => response.json())
    .then(email => {
      view_mail(email, mailbox);
    });
    
  };
  
}

function view_mail(email, mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-entry-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // const email_view = document.createElement('div');
  // email_view.className = 'email-viewer';
  
  const sender = `<p><b>From: </b>${email.sender}</p>`;
  const recipients = `<p><b>To: </b>${email.recipients}</p>`;
  const subject = `<p><b>Subject: </b>${email.subject.charAt(0).toUpperCase() + email.subject.slice(1)}</p>`;
  const timestamp = `<p><b>Timestamp: </b>${email.timestamp}</p>`;
  const body = `<hr><p>${email.body}</p>`;
  const reply = '<button class="btn btn-sm btn-outline-primary" id="rep">Reply</button>';

  // email_view.innerHTML = `<p><b>From: </b>${email.sender}</p>
  //                         <p><b>To: </b>${email.recipients}</p>
  //                         <p><b>Subject: </b>${email.subject}</p>
  //                         <p><b>Timestamp: </b>${email.timestamp}</p>`;
                          
  // document.querySelector('#email-entry-view').append(email_view);
  document.querySelector('#email-entry-view').innerHTML = sender + recipients + subject + timestamp + reply;
  
  const arc_btn_txt = email.archived ? "Unarchive" : "Archive";

  if (mailbox != "sent") {
    document.querySelector('#email-entry-view').innerHTML += `<button class="btn btn-sm btn-outline-primary" id="arc">${arc_btn_txt}</button>`;
  }
  
  document.querySelector('#email-entry-view').innerHTML += body;
  
  if (mailbox !== 'sent') {
    // document.querySelector("#arc").onclick = toggle_archive(email);
    document.querySelector('#arc').addEventListener('click', () => toggle_archive(email));
  }

  document.querySelector('#rep').addEventListener('click', () => compose_email(email));
  // document.querySelector('#rep').addEventListener('click', () => compose_email);
}

function toggle_archive(email) {

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !email.archived
    })
  })
  .then(location.href = "");

}