# Caessino

Firstly, create a .env file in the project's root directory and populate it like so:

        HOME_URL="http://localhost:3000"  
        POSTGRES_HOST="db"  
        POSTGRES_USER="postgres"  
        POSTGRES_PASSWORD="postgres"  
        POSTGRES_DB="postgres"  
        GOOGLE_EMAIL="YOUR_GOOGLE_EMAIL"  
        GOOGLE_APP_PASSWORD="YOUR_GOOGLE_APP_PASSWORD"  
        GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_OAUTH2  
        GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_OAUTH2  
        NEXT_SECRET="S0s2l3jzcxVw93sS0s2l3j"  
        NEXTAUTH_URL="http://localhost:3000/api/auth/"  


Now, in your console, navigate to the project's root directory and run:

        docker-compose up


===========================================================================

If you are configuring this project for the first time, do the following, in order to set up the database.

-- Note: The containers should be running in the background! (previously started with docker-compose up)

Open another console and run:

        docker exec -it NAME_OF_DATABASE_CONTAINER /bin/bash  
        psql -U postgres postgres `<` /usr/local/app/caessino.sql  

-- Note: When inserting `<`, it should not be surrounded by quotation marks

===========================================================================

Now you are all set up.

Enjoy your stay at Caessino.
