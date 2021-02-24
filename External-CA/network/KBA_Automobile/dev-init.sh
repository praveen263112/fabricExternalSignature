# echo "Generating Crypto materials"
# cryptogen generate --config=./crypto-config.yaml
# sleep 2s

# echo "Generating Network artifacts"

# export FABRIC_CFG_PATH=$PWD
# mkdir channel-artifacts
# configtxgen -profile AutoOrdererGenesis -outputBlock ./channel-artifacts/genesis.block -channelID ordererchannel
# sleep 1s

# export CHANNEL_NAME=autochannel
# configtxgen -profile AutoChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME

# configtxgen -profile AutoChannel -outputAnchorPeersUpdate ./channel-artifacts/Manufactureranchors.tx -channelID $CHANNEL_NAME -asOrg Manufacturer

# configtxgen -profile AutoChannel -outputAnchorPeersUpdate ./channel-artifacts/Dealeranchors.tx -channelID $CHANNEL_NAME -asOrg Dealer

# configtxgen -profile AutoChannel -outputAnchorPeersUpdate ./channel-artifacts/Mvdanchors.tx -channelID $CHANNEL_NAME -asOrg Mvd


sleep 3s

docker-compose -f docker-compose-cli.yaml up -d --build

sleep 5s

docker exec -it cli bash

