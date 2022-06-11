# Caessino

Firstly, create a .env file in the project's root directory and populate it like so:

HOME_URL="http://localhost:3000"


Now, in your console, navigate to the project's root directory and run:

docker-compose up


======== If you are configuring this project for the first time, do the following =========

We will now set up a dummy database, in order for the project to work.
Note: The containers should be running in the background! (previously started with docker-compose up)

Open another console and run:

docker exec -it name_of_db_container /bin/bash
psql -U postgres postgres &lt; /usr/local/app/caessino.sql

==========================================================================================

Now you are all set up.

Enjoy your stay at Caessino.