#KBA_HLF_COURSE_DOCKER_INSTALLATION

if [ -z $SUDO_USER ]
then
    echo "===== Script need to be executed with sudo ===="
    echo "Usage: sudo ./docker.sh"
    exit 0
fi

export DOCKER_VERSION=17

apt-get update
apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
apt-key fingerprint 0EBFCD88
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get install -y "docker-ce"
docker info
sudo groupadd docker
sudo usermod -aG docker $SUDO_USER
sudo apt-get install -y docker-compose
docker version
docker-compose version
