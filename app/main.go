package main

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/three_test/app/util"
)

func rootHandler(w http.ResponseWriter, r *http.Request) {
	util.Templates(w, "index.html", nil)
}

func test2Handler(w http.ResponseWriter, r *http.Request) {
	util.Templates(w, "test2.html", nil)
}

func test3Handler(w http.ResponseWriter, r *http.Request) {
	util.Templates(w, "test3.html", nil)
}

func test4Handler(w http.ResponseWriter, r *http.Request) {
	util.Templates(w, "test4.html", nil)
}

func main() {

	r := mux.NewRouter()
	r.HandleFunc("/", rootHandler)
	r.HandleFunc("/test2", test2Handler)
	r.HandleFunc("/test3", test3Handler)
	r.HandleFunc("/test4", test4Handler)

	http.Handle("/", r)
	http.Handle("/js/", http.FileServer(http.Dir("./")))
	http.Handle("/textures/", http.FileServer(http.Dir("./")))
	http.Handle("/shaders/", http.FileServer(http.Dir("./")))
	http.Handle("/models/", http.FileServer(http.Dir("./")))

	http.ListenAndServe(":3000", nil)
}
