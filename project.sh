#!/bin/bash


function setup {
  docker-compose -f docker-compose.yml up -d --no-recreate
}

function test {
  if [ "$1" = "ci" ]
  then
    docker exec hapipathgenerator_node_1 npm run testCI
  else
    docker exec hapipathgenerator_node_1 npm run test
  fi
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
    setup)
      setup
    ;;
    test)
      setup
      test $2
    ;;
    *)
      echo $"Usage: $0 {clean|start}"
      exit 1
    ;;
esac
