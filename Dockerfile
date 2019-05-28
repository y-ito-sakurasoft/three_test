FROM golang:latest

RUN go get -u github.com/oxequa/realize && \
    go get -u github.com/gorilla/mux

WORKDIR /go/src/github.com/three_test/