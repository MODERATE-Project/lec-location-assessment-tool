# lec-location-assessment-tool
## Create dev environment
1. Clone the repository
`git clone https://github.com/MODERATE-Project/lec-location-assessment-tool.git`
2. Run docker container
From the root of the project, put the following line in your console:
`docker-compose  -f docker-compose.dev.yaml up`
## Create prod environment
1. Clone the repository
`git clone https://github.com/MODERATE-Project/lec-location-assessment-tool.git`
3. Run docker container
`docker-compose  -f docker-compose.dev.yaml run`

## Running the app:
### Development
  http://localhost:3000
### Production
  http://localhost

## Stopping the app:
`docker-compose  -f docker-compose.dev.yaml down`
