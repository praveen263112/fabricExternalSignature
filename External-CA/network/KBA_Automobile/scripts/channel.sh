source manufacturer.env.sh

echo "Creating Channel Block"
peer channel create -o orderer.auto.com:7050 -c $CHANNEL_NAME -f ./../channel-artifacts/channel.tx

echo "Joining manufacturer to auto channel"
sleep 3s
peer channel join -b ./autochannel.block
echo "Updating Anchor peer details of manufacturer"
sleep 3s
peer channel update -o orderer.auto.com:7050 -c $CHANNEL_NAME -f ./../channel-artifacts/Manufactureranchors.tx
sleep 3s

echo "Changin env to dealer"
source dealer.env.sh

echo "Joining dealer to autochannel"
sleep 3s
peer channel join -b ./autochannel.block
echo "Updating anchor peer details of dealer"
sleep 3s
peer channel update -o orderer.auto.com:7050 -c $CHANNEL_NAME -f ./../channel-artifacts/Dealeranchors.tx


echo "Changin env to mvd"
source mvd.env.sh

echo "Joining mvd to autochannel"
sleep 3s
peer channel join -b ./autochannel.block
echo "Updating anchor peer details of mvd"
sleep 3s
peer channel update -o orderer.auto.com:7050 -c $CHANNEL_NAME -f ./../channel-artifacts/Mvdanchors.tx



# Chaincode Installation on dealer peer

echo "Installing BMW chaincode on Mvd peer"
peer chaincode install -n my -v 2.0.0 -p /opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/BMW -l "node"
sleep 10s

sleep 3s
echo "Installing BMW chaincode on dealer peer"
source dealer.env.sh
peer chaincode install -n my -v 2.0.0 -p /opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/BMW -l "node"
sleep 10s

source manufacturer.env.sh
echo "Installing BMW chaincode on Manufacturer peer"
peer chaincode install -n my -v 2.0.0 -p /opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/BMW -l "node"
sleep 10s



echo "Instantiating Chaincode"
peer chaincode instantiate -o orderer.auto.com:7050 -C $CHANNEL_NAME -n my -v 2.0.0 -l "node" -c '{"Args":[]}' -P "OR ('DealerMSP.member','ManufacturerMSP.member','MvdMSP.member')"
sleep 15s

echo "Invoking chaincode for testing"
peer chaincode invoke -o orderer.auto.com:7050 -C $CHANNEL_NAME -n my -c '{"function":"addBMW","Args":["123","sedan","m3","blue","12-09-1993","0"]}'
sleep 5s

echo "Querying chaincode for testing"
peer chaincode query -C $CHANNEL_NAME -n my -c '{"function":"readBmw","Args":["123"]}'

source dealer.env.sh
peer chaincode query -C $CHANNEL_NAME -n my -c '{"function":"readBmw","Args":["123"]}'


source mvd.env.sh
peer chaincode query -C $CHANNEL_NAME -n my -c '{"function":"readBmw","Args":["123"]}'
