FROM alpine:3.14.2
WORKDIR /workspace
COPY . .
RUN find
RUN test -f example/example.txt
RUN test ! -f example/__tests__/dummy
RUN date > timestamp
