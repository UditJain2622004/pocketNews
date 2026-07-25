import os
from translator import translate_text

def test_translation():
    test_phrase = "Why don't scientists trust atoms? Because they make up everything!"
    languages = ["hindi", "kannada", "bengali", "tamil", "marathi"]
    
    print(f"Testing translation of: '{test_phrase}'\n")
    
    # Run translation
    result = translate_text(test_phrase, languages)
    
    print(f"Translation Engine Mode: {result['mode']}\n")
    
    if "error" in result:
        print(f"Global Error: {result['error']}\n")
        return
        
    for lang, data in result.get("translations", {}).items():
        print(f"--- {lang} ---")
        if "error" in data:
            print(f"Error: {data['error']}")
        else:
            print(f"Translation: {data['translation']}")
            if data.get('warning'):
                print(f"Warning: {data['warning']}")
        print()

if __name__ == "__main__":
    test_translation()
