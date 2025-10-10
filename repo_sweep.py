#!/usr/bin/env python3
"""
Repo Sweep - Comprehensive codebase analyzer for routes, imports, endpoints, and duplicates
"""
import os
import json
import re
import hashlib
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Tuple
import subprocess

class RepoSweep:
    def __init__(self, root_dir="."):
        self.root_dir = Path(root_dir)
        self.output_dir = self.root_dir / "repo-sweep"
        self.output_dir.mkdir(exist_ok=True)
        
        # Analysis results
        self.routes = {}
        self.api_endpoints = {}
        self.endpoint_calls = []
        self.imports = defaultdict(list)
        self.unresolved_imports = []
        self.duplicates = defaultdict(list)
        self.near_duplicates = []
        self.file_hashes = {}
        
    def scan_routes(self):
        """Scan for frontend routes (wouter in App.tsx)"""
        app_tsx = self.root_dir / "client" / "src" / "App.tsx"
        if app_tsx.exists():
            content = app_tsx.read_text()
            # Find Route components: <Route path="..." component={...} />
            route_pattern = r'<Route\s+path=["\'](.*?)["\']\s+component=\{(.*?)\}'
            matches = re.findall(route_pattern, content)
            for path, component in matches:
                self.routes[path] = {
                    "path": path,
                    "component": component,
                    "file": str(app_tsx.relative_to(self.root_dir))
                }
        
    def scan_api_endpoints(self):
        """Scan for backend API endpoints (Express routes)"""
        routes_file = self.root_dir / "server" / "routes.ts"
        if routes_file.exists():
            content = routes_file.read_text()
            # Find Express routes: app.get/post/put/delete/patch('/api/...', ...)
            endpoint_pattern = r'app\.(get|post|put|delete|patch)\(["\']([^"\']+)["\']'
            matches = re.findall(endpoint_pattern, content)
            for method, path in matches:
                if path not in self.api_endpoints:
                    self.api_endpoints[path] = []
                self.api_endpoints[path].append({
                    "method": method.upper(),
                    "path": path,
                    "file": str(routes_file.relative_to(self.root_dir))
                })
    
    def scan_endpoint_calls(self):
        """Scan for API calls and navigation in frontend"""
        client_dir = self.root_dir / "client" / "src"
        if not client_dir.exists():
            return
            
        for tsx_file in client_dir.rglob("*.tsx"):
            content = tsx_file.read_text()
            rel_path = str(tsx_file.relative_to(self.root_dir))
            
            # Find fetch/axios calls
            api_call_patterns = [
                r'fetch\(["\']([^"\']+)["\']',
                r'axios\.(get|post|put|delete|patch)\(["\']([^"\']+)["\']',
                r'apiRequest\(["\']([^"\']+)["\']',
                r'queryKey:\s*\[["\']([^"\']+)["\']'
            ]
            
            for pattern in api_call_patterns:
                matches = re.findall(pattern, content)
                for match in matches:
                    url = match if isinstance(match, str) else match[-1]
                    if url.startswith('/api/') or url.startswith('http'):
                        self.endpoint_calls.append({
                            "file": rel_path,
                            "url": url,
                            "type": "api_call"
                        })
            
            # Find Link components and navigation
            nav_patterns = [
                r'<Link\s+(?:to|href)=["\'](.*?)["\']',
                r'navigate\(["\']([^"\']+)["\']',
                r'router\.push\(["\']([^"\']+)["\']'
            ]
            
            for pattern in nav_patterns:
                matches = re.findall(pattern, content)
                for url in matches:
                    if not url.startswith('http'):
                        self.endpoint_calls.append({
                            "file": rel_path,
                            "url": url,
                            "type": "navigation"
                        })
    
    def scan_imports(self):
        """Scan all imports and check resolution"""
        ts_files = list(self.root_dir.rglob("*.ts")) + list(self.root_dir.rglob("*.tsx"))
        
        for ts_file in ts_files:
            if "node_modules" in str(ts_file) or ".venv" in str(ts_file):
                continue
                
            content = ts_file.read_text()
            rel_path = str(ts_file.relative_to(self.root_dir))
            
            # Find import statements
            import_pattern = r'import\s+.*?from\s+["\']([^"\']+)["\']'
            matches = re.findall(import_pattern, content)
            
            for import_path in matches:
                self.imports[rel_path].append(import_path)
                
                # Check if import is resolvable
                if not self._is_import_resolvable(ts_file, import_path):
                    self.unresolved_imports.append({
                        "file": rel_path,
                        "import": import_path
                    })
    
    def _is_import_resolvable(self, from_file: Path, import_path: str) -> bool:
        """Check if an import can be resolved"""
        # Skip external packages
        if not import_path.startswith('.') and not import_path.startswith('@/'):
            return True
        
        # Handle path aliases
        if import_path.startswith('@/'):
            import_path = import_path.replace('@/', 'client/src/')
        
        # Resolve relative imports
        if import_path.startswith('.'):
            resolved = (from_file.parent / import_path).resolve()
        else:
            resolved = (self.root_dir / import_path).resolve()
        
        # Check various extensions
        for ext in ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx']:
            if (resolved.parent / f"{resolved.name}{ext}").exists():
                return True
        
        return False
    
    def scan_duplicates(self):
        """Find duplicate and near-duplicate files"""
        ts_files = list(self.root_dir.rglob("*.ts")) + list(self.root_dir.rglob("*.tsx"))
        
        for ts_file in ts_files:
            if "node_modules" in str(ts_file) or ".venv" in str(ts_file):
                continue
            
            content = ts_file.read_text()
            # Normalize content for comparison (remove whitespace and comments)
            normalized = re.sub(r'\s+', ' ', content)
            normalized = re.sub(r'//.*?\n', '', normalized)
            normalized = re.sub(r'/\*.*?\*/', '', normalized, flags=re.DOTALL)
            
            file_hash = hashlib.md5(normalized.encode()).hexdigest()
            rel_path = str(ts_file.relative_to(self.root_dir))
            
            self.file_hashes[rel_path] = file_hash
            self.duplicates[file_hash].append(rel_path)
        
        # Find near-duplicates (files with >80% similarity)
        files = list(self.file_hashes.keys())
        for i, file1 in enumerate(files):
            for file2 in files[i+1:]:
                similarity = self._calculate_similarity(file1, file2)
                if similarity > 0.8:
                    self.near_duplicates.append({
                        "files": [file1, file2],
                        "similarity": similarity
                    })
    
    def _calculate_similarity(self, file1: str, file2: str) -> float:
        """Calculate similarity between two files based on content"""
        try:
            content1 = (self.root_dir / file1).read_text()
            content2 = (self.root_dir / file2).read_text()
            
            # Simple line-based similarity
            lines1 = set(content1.split('\n'))
            lines2 = set(content2.split('\n'))
            
            if not lines1 or not lines2:
                return 0.0
            
            intersection = len(lines1 & lines2)
            union = len(lines1 | lines2)
            
            return intersection / union if union > 0 else 0.0
        except:
            return 0.0
    
    def generate_import_graph(self):
        """Generate DOT file for import graph visualization"""
        dot_content = ["digraph ImportGraph {", "  rankdir=LR;", "  node [shape=box];", ""]
        
        for file, imports in self.imports.items():
            # Simplify file names for visualization
            short_file = file.split('/')[-1].replace('.tsx', '').replace('.ts', '')
            for imp in imports:
                if imp.startswith('.') or imp.startswith('@/'):
                    short_imp = imp.split('/')[-1].replace('.tsx', '').replace('.ts', '')
                    dot_content.append(f'  "{short_file}" -> "{short_imp}";')
        
        dot_content.append("}")
        
        graph_file = self.output_dir / "import_graph.dot"
        graph_file.write_text('\n'.join(dot_content))
    
    def generate_candidate_fixes(self):
        """Generate markdown file with suggested fixes"""
        fixes = ["# Candidate Fixes\n"]
        
        # Duplicate files
        if self.duplicates:
            fixes.append("## Duplicate Files\n")
            for file_hash, files in self.duplicates.items():
                if len(files) > 1:
                    fixes.append(f"### Hash: {file_hash[:8]}")
                    fixes.append(f"**Files:**")
                    for f in files:
                        fixes.append(f"- {f}")
                    fixes.append(f"**Suggestion:** Keep shortest path, delete others\n")
        
        # Near duplicates
        if self.near_duplicates:
            fixes.append("## Near-Duplicate Files\n")
            for nd in self.near_duplicates:
                fixes.append(f"### Similarity: {nd['similarity']:.2%}")
                fixes.append(f"**Files:**")
                for f in nd['files']:
                    fixes.append(f"- {f}")
                fixes.append(f"**Suggestion:** Review and merge\n")
        
        # Unresolved imports
        if self.unresolved_imports:
            fixes.append("## Unresolved Imports\n")
            for imp in self.unresolved_imports:
                fixes.append(f"- `{imp['file']}` imports `{imp['import']}`")
            fixes.append("")
        
        fixes_file = self.output_dir / "candidate_fixes.md"
        fixes_file.write_text('\n'.join(fixes))
    
    def save_results(self):
        """Save all analysis results to JSON files"""
        # Route map
        (self.output_dir / "route_map.json").write_text(
            json.dumps({"routes": self.routes, "api_endpoints": self.api_endpoints}, indent=2)
        )
        
        # Endpoint calls
        (self.output_dir / "endpoint_calls.json").write_text(
            json.dumps(self.endpoint_calls, indent=2)
        )
        
        # Unresolved imports
        (self.output_dir / "unresolved_imports.json").write_text(
            json.dumps(self.unresolved_imports, indent=2)
        )
        
        # Duplicates
        duplicate_groups = {k: v for k, v in self.duplicates.items() if len(v) > 1}
        (self.output_dir / "duplicates.json").write_text(
            json.dumps(duplicate_groups, indent=2)
        )
        
        # Near duplicates
        (self.output_dir / "near_duplicates.json").write_text(
            json.dumps(self.near_duplicates, indent=2)
        )
        
        print(f"✅ Analysis complete! Results saved to {self.output_dir}/")
        print(f"   - Routes found: {len(self.routes)}")
        print(f"   - API endpoints found: {len(self.api_endpoints)}")
        print(f"   - Endpoint calls found: {len(self.endpoint_calls)}")
        print(f"   - Unresolved imports: {len(self.unresolved_imports)}")
        print(f"   - Duplicate groups: {len(duplicate_groups)}")
        print(f"   - Near-duplicate pairs: {len(self.near_duplicates)}")
    
    def run(self):
        """Run full analysis"""
        print("🔍 Scanning codebase...")
        self.scan_routes()
        self.scan_api_endpoints()
        self.scan_endpoint_calls()
        self.scan_imports()
        self.scan_duplicates()
        self.generate_import_graph()
        self.generate_candidate_fixes()
        self.save_results()

if __name__ == "__main__":
    sweeper = RepoSweep()
    sweeper.run()
