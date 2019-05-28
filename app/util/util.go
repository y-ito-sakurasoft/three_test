package util

import (
	"log"
	"net/http"
	"text/template"
)

func Templates(w http.ResponseWriter, filename string, data interface{}) {

	t := template.Must(template.ParseFiles("templates/" + filename))
	if err := t.ExecuteTemplate(w, filename, data); err != nil {
		log.Fatal(err)
	}
}
