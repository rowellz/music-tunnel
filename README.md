# Sveltekit Animated 3D Music Tunnel

First, clone the repository:

`git clone https://github.com/rowellz/music-tunnel`

Then run the docker-compose services with:

`docker-compose up`

this will run both the development and static production servers on their respective ports defined in `docker-compose.yml`

Changes to files will immediately be reflected in the development server while `docker-compose build --no-cache static-app` followed by `docker-compose up -d`  is required for changes to be seen in the static server.

If you are running a newer version of docker compose, you may need to run `docker compose` instead.