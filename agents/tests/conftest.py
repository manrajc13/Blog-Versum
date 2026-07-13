import sys
from pathlib import Path

AGENTS_ROOT = Path(__file__).resolve().parent.parent
if str(AGENTS_ROOT) not in sys.path:
    sys.path.insert(0, str(AGENTS_ROOT))
