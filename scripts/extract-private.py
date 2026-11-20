import sys,json,zipfile,re
from pathlib import Path
from xml.etree import ElementTree as ET
rows=[]; limitations=[]
def add(anchor,text):
 text=str(text or '').strip()
 if text and len(rows)<100: rows.append({'anchor':anchor,'text':text[:2000]})
try:
 path=Path(sys.argv[1]); ext=sys.argv[2]
 if path.stat().st_size>8*1024*1024: raise ValueError('size')
 if ext=='.pdf':
  from pypdf import PdfReader
  reader=PdfReader(str(path))
  if reader.is_encrypted: raise ValueError('encrypted')
  for i,p in enumerate(reader.pages[:50]):
   for j,line in enumerate((p.extract_text() or '').splitlines()): add(f'page {i+1}, line {j+1}',line)
  limitations.append('First 50 pages and 100 non-empty text lines only. No OCR or engineering validation.')
 elif ext in ['.docx','.pptx','.xlsx']:
  with zipfile.ZipFile(path) as z:
   if sum(i.file_size for i in z.infolist())>32*1024*1024: raise ValueError('expanded size')
   if ext=='.docx':
    root=ET.fromstring(z.read('word/document.xml'))
    for i,p in enumerate(root.findall('.//{*}p')): add(f'paragraph {i+1}',''.join(t.text or '' for t in p.findall('.//{*}t')))
   elif ext=='.pptx':
    for n in sorted(n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml',n)):
     root=ET.fromstring(z.read(n)); add(n,''.join(t.text or '' for t in root.findall('.//{*}t')))
  if ext=='.xlsx':
   from openpyxl import load_workbook
   w=load_workbook(path,read_only=True,data_only=False)
   for s in w:
    for row in s.iter_rows(max_row=200,max_col=30):
     for cell in row:
      if cell.value is not None: add(f'{s.title}!{cell.coordinate}',cell.value)
   w.close()
  limitations.append('Bounded OOXML extraction; first 100 non-empty anchors. Spreadsheet formulas are text, never recalculated.')
 text='\n'.join(r['text'] for r in rows)
 print(json.dumps({'status':'EXTRACTED' if rows else 'OCR_REQUIRED' if ext=='.pdf' else 'UNSUPPORTED','extractedText':text,'anchors':rows,'limitations':' '.join(limitations) or 'No readable text; OCR/manual review required.'}))
except Exception:
 print(json.dumps({'status':'FAILED','limitations':'File is encrypted, malformed, unsupported or exceeds extraction limits. Original private bytes are retained.'}))
