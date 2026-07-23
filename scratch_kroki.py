import urllib.request
import urllib.parse
import json

def main():
    with open('docs/workflow.mmd', 'r', encoding='utf-8') as f:
        data = f.read()
    
    url = "https://kroki.io/"
    payload = json.dumps({
        "diagram_source": data,
        "diagram_type": "mermaid",
        "output_format": "svg"
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            svg = response.read().decode('utf-8')
            with open('docs/workflow.svg', 'w', encoding='utf-8') as out:
                out.write(svg)
            print("SVG gerado com sucesso!")
    except Exception as e:
        print(f"Erro: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))

if __name__ == '__main__':
    main()
