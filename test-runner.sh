#!/bin/bash
while [ true ]
do
    echo "
----------------------
[a] Run All Test Cases
[b] Run All Test Cases with Code Coverage
[q] Quit"

    read command

    case $command in
    a)
        clear
        yarn test:ci
        ;;

    b)
        clear
        yarn test:coverage
        ;;

    q)
        exit 0
        ;;
    esac
done


