# Capstone - Bugtracker

## Description

This project was completed as a requirement for the Harvard Course **CS50's Web Programming with Python and JavaScript** as such it is a Django HTML Website.

The project is a bug tracker in which users can create and manage the status of projects and tickets. Each user is assigned a role which in turn determines the actions which can be taken in the site.

It is implemented using React for the rendering of individual pages such as the project and tickets.

## How to Run

This project can be run using either docker containers or with your computer.

### On Computer

You can find the installation guide in [Installing Django](https://docs.djangoproject.com/en/3.2/topics/install/).

Once installed navigate to the root directory of the project in your terminal and run the following commands

1. `pip install django-simple-history`
2. `python3 manage.py makemigrations`
3. `python3 manage.py migrate`
4. `python3 manage.py runserver`

### Using Docker

You can find the guide to downloading Docker in [Installing Docker](https://docs.docker.com/get-docker/).

Once installed, run `docker compose up` to start the containers.

Within a new terminal run the following commands.

1. `docker ps` which will give you a container ID
2. `docker exec -it` _container_id_ `bash -l`
3. `pip install django-simple-history`
4. `python3 manage.py makemigrations`
5. `python3 manage.py migrate`
6. `python3 manage.py runserver`

## Distinctiveness and Complexity

This project is a bug tracking application which draws upon the lessons learned in this course and attempts to build upon said lessons. During development we all encounter various issues, have different tasks to complete and various milestones to achieve. These tasks are what I defined as tickets within the application and a collection of tickets is then represented as a project.

This Tickets -> Project structure is the basis for everything which occurs within this web application. A project can be used to represent a milestone or a goal. For example the current project I am working on, this Bug tracker can be represented within the application and have various tickets within it. At a higher level I can also decide to split different parts of the application into a project of its own and then monitor the progress of these tickets from there.

Within an organization there are always different roles and access levels given to each person. I have also taken this into consideration and implemented a Role Based Access Control Authorization method.

To achieve this I used Django Groups to create 4 groups which Users Can be assigned to. They are described below:

-   Admin: This is the highest level, an Admin can access all parts of the application. The Admin is the only user capable of changing the roles of other users within the application.

-   Project Manager: This User manages and keeps tracks of the overall project and has the Arcjhitectural Vision to manage projects and see them to completion.

-   Developer: Developers will mainly be focused on the task assigned to them, they are in charge of their tickets.They have full access to the Ticket interface.

-   Submitter: These are the QA's who will report based on what they have evaluated from the work done by developers. They only have the ability to create Tickets and Read
 access to the projects.

I chose to use groups because I would be able to control the access and permissions assigned to each set of individuals at the same time and if there are more features or changes in the feature it is good to have acentral place to carry out these changes.

When you sign into the application you are first met with a quick summary of the tickets in the application grouped by Status, Type, Priority and Project.

There are 5 primary Pages to Navigate to, Dashboard, Manage User Roles, Projects, Tickets and User Profile. The Manage User page is only visible to Users with a role of ADMIN. If they try to access this URL they get an Unauthorized Error Message.

To build the application I utilized React.js on the frontend within Javascript files, Each React component is then managed within its app component and the components are rendered based on the page which the user currently is.

To change a user Role an Admin User can select multiple users and then assign the desired role to each of them.

To implement the role assignment a custom migration file was created which created the new groups and assigned the users with the roles associated to the individual groups. While saving, the role attribute of the user is checked using an `IF` Statement. Based on the role the user has, the user is assigned to the group.

To have the required RBAC, I utilized django permissions within my views. When a restricted view is accessed, the user permissions are checked in the database and if the required access is present, the following commands are carried out or else the user receives an Unauthorized Response.

The next Feature is the projects, a Project Manager or Admin can create, edit or view a project. Each project has assignees who work on it. Also all projects have various tickets assigned to them. Within the projects you can view these tickets and users. From a project you can add a ticket. This is the only place to add tickets because each ticket needs a project to be assigned to.

Following Projects you have the Tickets which are where all the tasks and bugs are described. Any user can create a ticket. Developers can make changes to tickets also as needed. The history of tickets is tracked and displayed. This helps you see the full lifecycle of the ticket. All Users can create, view or Edit a Ticket.

Lastly the User Details are given in the Profile Section.

Although best viewed on a laptop this site is also fully mobile responsive. Utilizes Django with 3 Models including the User Model. Goes beyond the teachings of the Course implementing RBAC and utilizes Javascript with React to render the Frontend.

# Features

## Authentication

Login, Logout, Forgot Passowrd Have been implemented.

For Ease of Testing Access, All new users are registered with a Role of ADMIN.

There is no mail service for the forgot password, instead the Mail is displayed within the terminal with the reset link.

## Dashboard

An entry point into the Website, a visualization to show the Tickets assigned to the User by Status, Priority, Type and Project

## Manage User Roles

Each User can Have only one role out of _ADMIN_, _PROJECT MANAGER_,_DEVELOPER_, _SUBMITTER_ . These roles can be changed within the Manage User Roles page accessible only to Users with a Role of Admin.

## Project

A Project at a high level is a collection of related Tickets which the user has registered within the system. Tickets can only be created under Projects and are directly assigned to the projects they are created from.

-   ### Project List

A Table showing all Projects a user has either created or been assigned to. From here you can choose to go to the Details or Edit Page with the right Permissions. Pagination of 10 per page and search function

-   ### Project Details

A page showing Project Assignees, information and Tickets assigned

-   ### Create And Edit Project

Creation and Editing of Tickets can only be done by Project Managers and Admins.

## Ticket

A single bug or issue currently being tracked by the User. Each Ticket is created under a Project and can have only one Assignee.

-   ### Ticket List

A list showing all tickets created by or assigned to a User. From this list you can route to Edit or Details. Pagination of 10 per page and search function

-   ### Create and Edit Ticket

A ticket can only be created from within a Project. Each Ticket can only have one Assignee which can be added at creation or edited later.

-   ### Ticket Details

This page shows fields on the Ticket along with the Change history of the Ticket.

The web application is mobile responsive although it offers the best experience on a laptop screen considering the nature of the project.

## Files Created

> ### bugtracker.js

This contains the React and JavaScript for the Project, Ticket and Manage User urls.

> ### dashboards.js

The Charts for the Dashboard Visualizations are stored here.

> ### 0002_auto_20211218_2029.py

Custom Migration which defines the permissions for Each User Group

> bugtracker/authentication

Within this folder all files are used for the login, logout, register and Password Reset of User accounts.

> ### content_container

The styling for the default container of the application.

> ### index.html

This is the entry point for the website which holds the visualizations

> ### layout.html

Default Layout and skeleton of the website

> ### manage_roles.html

Manage User Template used to hold the div which the React is rendered from.

> ### projects.html

Single Page for All Project views which are rendered using React.

> ### tickets.html

Single Page for All Ticket views which are rendered using React.

> ### user_profile.html

Page displaying User information

## Issues

The requirements.txt file was not installing the djangp-simple-history module. A workaround was to install it manually in the Docker container as suggested in the introduction.
