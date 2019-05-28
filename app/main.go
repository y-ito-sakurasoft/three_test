package main

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/three_test/app/util"
)

func rootHandler(w http.ResponseWriter, r *http.Request) {
	util.Templates(w, "index.html", nil)
}

func main() {

	r := mux.NewRouter()
	r.HandleFunc("/", rootHandler)

	http.Handle("/", r)
	http.Handle("/js/", http.FileServer(http.Dir("./")))
	http.Handle("/textures/", http.FileServer(http.Dir("./")))
	http.Handle("/shaders/", http.FileServer(http.Dir("./")))

	http.ListenAndServe(":3000", nil)
}
