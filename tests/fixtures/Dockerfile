FROM alpine:3.14.2
WORKDIR /workspace
COPY example.txt .
COPY example/ example/
RUN test -f example/example.txtaa
RUN test ! -f example/dummy
RUN date > /timestamp
