#!/bin/bash

CONFIG=config.json

if ! [ -f "$CONFIG" ]; then
        echo '{ "sucess": "Error", "data": "Create first config.json file in your server" }' > data.json
        exit 0
fi

v1=$(cat $CONFIG | jq '.m_publicKey')
M_PUBLICKEY="${v1//\"/}"
v1=$(cat $CONFIG | jq '.t_publicKey')
T_PUBLICKEY="${v1//\"/}"

buffer=buffer.file

f=0
i=1
echo "{ \"success\": true, \"servers\": {" > $buffer
jq -r '.servers|keys[]' $CONFIG | 
{ while read key ; do
    if [ "$i" -ne "1" ]; then
        echo "," >> $buffer
    fi
    echo "\"server$i\": {" >> $buffer
    v1=$(jq ".servers.$key.http" $CONFIG)
    HTTP="${v1//\"/}"
    v1=$(jq ".servers.$key.ip" $CONFIG)
    IP="${v1//\"/}"
    v1=$(jq ".servers.$key.port" $CONFIG)
    PORT="${v1//\"/}"
    v1=$(jq ".servers.$key.testnet" $CONFIG)
    TESTNET="${v1//\"/}"

    RESPONSE=$(curl --connect-timeout 2 --fail  -s $HTTP://$IP:$PORT/api/loader/status/sync)
    HEIGHT=$(echo $RESPONSE | jq '.height')
    SYNCING=$(echo $RESPONSE | jq '.syncing')
    CONSENSUS=$(echo $RESPONSE | jq '.consensus')

    if [ "$TESTNET" == "true" ]; 
    then
        PUBLICKEY="$T_PUBLICKEY"
    else
        PUBLICKEY="$M_PUBLICKEY"
    fi
    
    FORGING=$(curl --connect-timeout 2 --fail -s -k $HTTP://$IP:$PORT/api/delegates/forging/status?publicKey=$PUBLICKEY | jq '.enabled')
    if [ "$FORGING" == "true" ]; then
    	DELEGATE_DATA=true
        RESPONSE=$(curl --connect-timeout 2 --fail -s -k $HTTP://$IP:$PORT/api/delegates/get?publicKey=$PUBLICKEY)
        USERNAME=$(echo $RESPONSE | jq '.delegate.username')
        RANK=$(echo $RESPONSE | jq '.delegate.rate')
        APPROVAL=$(echo $RESPONSE | jq '.delegate.approval')
        PRODUCTIVITY=$(echo $RESPONSE | jq '.delegate.productivity')
        PRODUCEDBLOCKS=$(echo $RESPONSE | jq '.delegate.producedblocks')
        MISSEDBLOCKS=$(echo $RESPONSE | jq '.delegate.missedblocks')

        if [ "$f" != "0" ]; then
        	echo "," >> tmp.file
        fi	

        if [ "$TESTNET" == "true" ]; 
        then
        	echo "  \"testnet\": { \"success\": true," >> tmp.file
    	else       
        	echo "  \"mainnet\": { \"success\": true," >> tmp.file
    	fi

    	echo "  \"username\": $USERNAME," >> tmp.file
        echo "  \"rank\": $RANK," >> tmp.file
        echo "  \"approval\": $APPROVAL," >> tmp.file
        echo "  \"productivity\": $PRODUCTIVITY," >> tmp.file
        echo "  \"producedblocks\": $PRODUCEDBLOCKS," >> tmp.file
        echo "  \"missedblocks\": $MISSEDBLOCKS," >> tmp.file
      
        RESPONSE=$(curl --connect-timeout 2 --fail -s $HTTP://$IP:$PORT/api/delegates/getNextForgers?limit=101 | jq '.delegates')
        n=0
        while [ "$n" -lt "101" ]; do
           v1=$(echo $RESPONSE | jq '.['$n']')
           PK="${v1//\"/}"
           if [ "$PK" == "$PUBLICKEY" ]; then
                NEXTTURN="$n"
                break
           fi
           ((n++))
        done

        if [ -z "$NEXTTURN" ]; then
        	NEXTTURN=$"null"
    	fi

    	echo "  \"nextturn\": $NEXTTURN," >> tmp.file

        RESPONSE=$(curl --connect-timeout 2 --fail -s $HTTP://$IP:$PORT/api/blocks?generatorPublicKey=$PUBLICKEY&limit=1)
        FORGED_BLOCK=$(echo $RESPONSE | jq '.blocks[0].height')

        echo "  \"forged_block\": $FORGED_BLOCK }" >> tmp.file

        ((f++))

    fi
    
    if [ -z "$HEIGHT" ]; then
        HEIGHT=$"\"Server Error\""
    fi
    if [ -z "$SYNCING" ]; then
        SYNCING=$"false"
    fi   
    if [ -z "$CONSENSUS" ]; then
        CONSENSUS=$"\"Server Error\""
    fi
    if [ -z "$FORGING" ]; then
        FORGING=$"\"Server Error\""
    fi  
    
    echo "  \"height\": $HEIGHT", >> $buffer
    echo "  \"syncing\": $SYNCING", >> $buffer
    echo "  \"consensus\": $CONSENSUS", >> $buffer
    echo "  \"forging\": $FORGING", >> $buffer
    echo "  \"testnet\": $TESTNET" >> $buffer
    echo "}" >> $buffer
    ((i++))
done 

if [ "$DELEGATE_DATA" == "true" ];
then
	echo "}," >> $buffer
else
	echo "}" >> $buffer	
fi

}

cat tmp.file >> $buffer
rm tmp.file

echo "}" >> $buffer

cat buffer.file > data.json
