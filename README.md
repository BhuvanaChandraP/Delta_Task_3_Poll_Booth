# Poll Booth

Vikram and Pavithra want to decide upon a design for Delta T Shirt. They decided to put up a poll among Delta members to select a design. So they asked their juniors to develop a portal which facilitates polling among teams.

They need a website which allows creation of teams and polls within the team members built upon a full fledged frontend and backend.

## Getting Started

1. Download or clone this repo to your local system
2. Install nodejs from Nodejs official website
3. Open the terminal in the folder where you have cloned the project.
4. Now run the following commands

```
npm install
```

5. Now, you should be able to see the node modules folder with all dependencies installed.
6. Install the mongodb community edition from here [Mongodb official documentation](https://docs.mongodb.com/manual/administration/install-community/)
7. Ensure that mongo service has started and is listening on port 27017 
8. Run the following command back in the terminal at the project folder

```
   npm run dev
```


9. Navigate to http://localhost:3000/login and you should be able to view the login page



**Normal mode:**

- [x] Have a user management system with authentication that allows users to register and login on the site
- [x] Implement an authentication system to allow users to register on the site.
- [x] Create a poll with variable number of text options within the team
- [x] Create a dashboard for a team and display the polls in chronological order
- [x] Show the results of poll after admin ends it
- [x] Design a neat, intuitive UI ( make the site responsive, legible text, etc )

 **Hacker mode:**
 
- [x] Have a deadline for automatically ending polls
- [ ] Support for different types of options such as images, audio and video
- [x] Notifications to the admin when someone submits a vote, joins their team using invite, etc
- [x] Validate the registration forms (check for duplicate usernames, determine password strength, etc)
- [x] Add plots/graphs to visualize results of polls
- [x] Prevent SQL injection


 **Hacker++ mode:**
 
- [x] Ability to add multiple admins and user roles (like teachers, CR, students etc)
- [x] Send notifications through email
- [x] Google Calendar API integration to keep track of deadlines for polls
- [ ] Add chat and real time video conferencing feature

