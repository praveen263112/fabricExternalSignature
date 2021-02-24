docker-compose -f docker-compose-cli.yaml down
sleep 2s
docker stop $(docker ps -a -q)
sleep 2s
docker rm $(docker ps -a -q)