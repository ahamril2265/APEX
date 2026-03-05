import re
import sys

def extract_strings(filename, min_len=4):
    with open(filename, 'rb') as f:
        data = f.read()
    
    # Look for common command substrings
    patterns = [b'npm', b'uvicorn', b'backend', b'frontend', b'python', b'cmd\\.exe', b'start', b'run dev']
    print(f"Scanning {filename} for patterns...")
    for p in patterns:
        hits = [data[m.start()-30:m.end()+30] for m in re.finditer(p, data, re.IGNORECASE)]
        if hits:
            print(f"Found '{p.decode()}':")
            for h in hits[:5]:
                try:
                    print("  ", h.decode('utf-8', 'replace').replace('\x00', ''))
                except:
                    pass

if __name__ == '__main__':
    extract_strings(sys.argv[1])
