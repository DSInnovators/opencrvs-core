DIR=$(cd "$(dirname "$0")"; pwd)
echo "Working dir: $DIR"

if [ "$DEV" = "true" ]; then
  HOST=mongo1
  echo "Working in DEV mode"
else
  HOST=rs0/mongo1,mongo2,mongo3
fi

docker run --rm -v $DIR/backups:/backups --network=opencrvs_overlay_net mongo:3.6 bash \
 -c "mongodump --host $HOST -d hearth-dev --gzip --archive=/backups/hearth-dev.gz"

docker run --rm -v $DIR/backups:/backups --network=opencrvs_overlay_net mongo:3.6 bash \
 -c "mongodump --host $HOST -d openhim-dev --gzip --archive=/backups/openhim-dev.gz"

docker run --rm -v $DIR/backups:/backups --network=opencrvs_overlay_net mongo:3.6 bash \
 -c "mongodump --host $HOST -d user-mgnt --gzip --archive=/backups/user-mgnt.gz"
