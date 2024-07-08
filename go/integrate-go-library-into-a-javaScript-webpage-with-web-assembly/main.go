package main

import (
	"fmt"
	"strings"
	"syscall/js"

	"github.com/neurosnap/sentences/english"
)

func sentenceWrapper() js.Func {
	sentenceFunc := js.FuncOf(func(this js.Value, args []js.Value) any {
		if len(args) != 1 {
			return "Invalid no of arguments passed"
		}
		inputSentence := args[0].String()
		fmt.Printf("input %s\n", inputSentence)
		tokenizer, err := english.NewSentenceTokenizer(nil)
		if err != nil {
			panic(err)
		}

		sentences := tokenizer.Tokenize(inputSentence)
		for _, s := range sentences {
			fmt.Println(s.Text)
		}

		var sentenceTexts []string
		for _, s := range sentences {
			trimmedText := strings.TrimSpace(s.Text)
			sentenceTexts = append(sentenceTexts, trimmedText)
		}

		allSentences := strings.Join(sentenceTexts, "\n") // Join all sentences separated by a space
		return allSentences

	})
	return sentenceFunc
}

func main() {
	fmt.Println("Go Web Assembly")
	js.Global().Set("tokenizeSentence", sentenceWrapper())
	<-make(chan struct{})
}
