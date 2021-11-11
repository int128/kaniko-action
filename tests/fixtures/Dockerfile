FROM alpine:3.14.2
WORKDIR /workspace
COPY example.txt .
COPY example/ example/
RUN test -f example/example.txt
RUN test ! -f example/dummy
RUN date > /timestamp
