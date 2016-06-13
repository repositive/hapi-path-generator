#!/bin/bash


function setup {
  docker-compose up -d --no-recreate
  docker-compose start
  docker-compose run node npm install --no-recreate
}

function test {
  if [ "$1" = "dev" ]
  then
    COMMAND="devTest"
  else
    COMMAND="test"
  fi
  docker-compose run node npm run "$COMMAND" --no-recreate
}

function clean {
  docker-compose stop
  docker-compose rm -fa
}

case "$1" in
    clean)
      clean
      exit 0
    ;;
    test)
      setup
      test $2
      clean
      exit 0
    ;;
    setup)
      setup
      exit 0
    ;;
    *)
      echo $"Usage: $0 {clean|test}"
      exit 1
    ;;
esac
