# Crawling tests

In order to test crawling capabilities, we create a docker container where runs a server.
This server has special /etc/hosts and /etc/host.conf files... or not... it uses --add-host, 'cause that's how things work in Docker 1.5. See https://github.com/docker/docker/issues/10324

Start the server and then run the tests in the machine

## Plan

A docker container runs a virtual web. Test are run inside this container.
dockerfile needs to be top level to see the crawl code (will simplify the virtual web app anyway)

first test : 